import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Make sure to include the .js extension if using ES modules

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if the Authorization header is missing or not properly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'No token provided, authorization denied' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.replace('Bearer ', '');

  // If no token is found after removing 'Bearer ', deny access
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT_SECRET environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the decoded token payload and exclude sensitive fields
    req.user = await User.findById(decoded.userId).select('-password -createdAt -updatedAt -__v');

    // If the user is not found, deny access
    if (!req.user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    // If everything is fine, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
