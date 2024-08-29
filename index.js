import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./database/index.js";
import User from "./models/User.js";
import validateUserInput from "./validations/index.js";
import { hashPassword ,comparePassword} from "./utils/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "./middlewares/index.js";

dotenv.config(); // To config all the env available in the file

// Create an App
const app = express();
const port = process.env.PORT || 4000;
// const jwtSecret = process.env.JWT_SECRET || "default_secret_key";

// Connect to MongoDB

connectDB();

// Middleware
app.use(bodyParser.json());

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
      return res.status(400).json({
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


app.listen(port, () => {
  console.log(`Sever listening on port ${port}`);
});
