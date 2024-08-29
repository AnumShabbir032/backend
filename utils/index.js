import pkg from 'bcryptjs';
const { genSalt, hash, compare } = pkg;
// Function to hash a password
const hashPassword = async (password) => {
  try {
    const salt = await genSalt(10);  // Generate a salt with 10 rounds
    return await hash(password, salt); // Hash the password with the salt
  } catch (error) {
    throw new Error("Error hashing the password"); // Error handling
  }
};

// Function to compare passwords
const comparePassword = async (enteredPassword, storedPassword) => {
  try {
    return await compare(enteredPassword, storedPassword); // Compare hashed passwords
  } catch (error) {
    throw new Error("Error comparing passwords"); // Error handling
  }
};

// Named exports for better clarity
export { hashPassword, comparePassword };
