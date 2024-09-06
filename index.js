import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config(); 
import connectDB from "./database/index.js";
import User from "./models/User.js";
import validateUserInput from "./validations/index.js";
import { hashPassword ,comparePassword} from "./utils/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "./middlewares/index.js";
import multer from "multer";
import path from "path";
import cors from "cors";





const app = express();
// const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();



// Middleware
app.use(bodyParser.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check the file type for images (jpeg, jpg, png, gif)
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true); // Accept the file
    } else {
      // Return a custom error message if the file is not an image
      return cb(null, false); // This prevents the upload
    }
  },
});

// Create the POST route for image uploads
app.post('/upload', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (e.g., file too large)
      return res.status(400).json({
        error: 'There was an error processing your upload. Please try again.',
      });
    } else if (err) {
      // General error handling
      return res.status(400).json({
        error: 'An unknown error occurred during the upload.',
      });
    }

    // Check if no file was uploaded or file was not an image
    if (!req.file) {
      return res.status(400).json({
        error: 'Invalid file type. Please upload an image (jpeg, jpg, png, gif).',
      });
    }

    // If the file is successfully uploaded, return the file path
    res.json({
      message: 'File uploaded successfully',
      filePath: `/uploads/${req.file.filename}`,  // Path to the saved image
    });
  });
});

// Create APi for Register User

app.post("/register", async (req, res) => {
  const { username, email, password, contact, gender, dob } = req.body;
  try {
    const missingFields = [];
    if (!username) missingFields.push("username");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!contact) missingFields.push("contact");
    if (!gender) missingFields.push("gender");
    if (!dob) missingFields.push("dob");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please provide the following required fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    const validationErr = validateUserInput(
      username,
      email,
      password,
      contact,
      gender,
      dob
    );
    if (validationErr.length > 0) {
      return res.status(200).json({
        message: "Validation Error",
        error: validationErr,
      });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `User with this email (${existingUser.email}) already exists` });
    }

    const hashedPassword = await hashPassword(password);

    let user = new User({
      username,
      email,
      password: hashedPassword,
      contact,
      gender,
      dob
    });

    await user.save();

    user.password = undefined;

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET must be defined");
    }
    
    const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '1h', // example expiration
    });

    res.status(201).json({ message: "User registered successfully", user, token });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please provide the following required fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    user.password = undefined;

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/user", authMiddleware, (req, res) => {
    res.status(200).json({
      user: req.user,
    });
  });
app.put("/user", authMiddleware, async (req, res) => {
    const { username, email, profilePicture, dob, gender, contact } = req.body;
  
    try {
      const updatedFields = {};
      if (username) updatedFields.username = username;
      if (gender) updatedFields.gender = gender;
      if (email) updatedFields.email = email;
      if (profilePicture) updatedFields.profilePicture = profilePicture;
      if (dob) updatedFields.dob = dob;
      if (contact) updatedFields.contact = contact;
  
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id, 
        { $set: updatedFields },
        { new: true, runValidators: true } 
      ).select("-password"); 
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  });






const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });