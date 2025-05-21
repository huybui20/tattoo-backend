import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token received:', token);
            console.log('JWT_SECRET:', process.env.JWT_SECRET);
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            
            if (!req.user) {
                console.log('User not found for id:', decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }
            
            console.log('User authenticated:', req.user.id);
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ 
                message: 'Not authorized, token failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
export {protect};