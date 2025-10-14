import jwt from 'jsonwebtoken';
import { User } from '../models/userModelNew.js';
import createError from '../utils/appError.js';


const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

//MIDDLEWARE Functions
const authenticateUser = async (req, res, next) => {
  try {
    // Extract the token from the request headers
    const header = req.header.authorization || '';
    const [, token] = header.split(' ');
    // const token = req.headers.authorization.split(' ')[1];
    if (!token) return next(new createError("Unathorized", 401));
    // Verify the token

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if a user exists with the decoded token's ID
    const user = await User.findById(decoded._id);
    if (!user) return next(new createError("Unauthorized", 401));

    // Attach the user object to the request for further use
    req.user = user;

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle authentication errors
    next(new createError.Unauthorized('Unauthorized', 401));
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    // Ensure the user is authenticated first
    await authenticateUser(req, res, async () => {
      // Check if the user is an admin
      if (req.user.role === 'admin') {
        // Proceed to the next middleware/route handler
        next();
      } else {
        // User is not an admin, throw an error
        throw new Error('User is not an admin');
      }
    });
  } catch (error) {
    // Handle authorization errors
    next(new createError.Forbidden('Forbidden'));
  }
};

module.exports = { authenticateUser, authenticateAdmin };