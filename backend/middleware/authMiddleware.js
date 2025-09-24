import jwt from 'jsonwebtoken';
import { User } from '../models/userModelNew.js';
import createError from '../utils/appError.js';
import secureLogger from '../utils/secureLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

const authenticateUser = async (req, res, next) => {
  try {
    const header = req.header.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return next(new createError("Unathorized", 401));

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) return next(new createError("Unauthorized", 401));

    req.user = user;
    next();
  } catch (error) {
    secureLogger.warn('Authentication failed', error);
    next(new createError('Unauthorized', 401));
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticateUser(req, res, async () => {
      if (req.user.role === 'admin') {
        next();
      } else {
        throw new Error('User is not an admin');
      }
    });
  } catch (error) {
    secureLogger.warn('Authorization failed', error);
    next(new createError('Forbidden', 403));
  }
};

export { authenticateUser, authenticateAdmin };