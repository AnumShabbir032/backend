import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,  
      unique: true,
      lowercase: true,
      maxlength: 20,  
    },
    email: {
      type: String,
      required: true,  
      unique: true,
      lowercase: true,
      maxlength: 50,  
    },
    password: {
      type: String,
      required: true,  
    },
    contact: {
      type: Number,
      required: true,  
      unique: true,
    },
    gender: {
      type: String,
      required: true,  
      enum: ["M", "F", "O"],
    },
    dob: {
      type: Date,
    },
    profilePicture:{
      type: String,
    },
    token: {
      type: String
    },
    resetToken: {   
      type: String,
    },
    resetTokenExpiry: {  
      type: Date,
    },
    newPassword: {
      type: String,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
