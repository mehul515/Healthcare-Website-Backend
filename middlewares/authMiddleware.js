import jwt from 'jsonwebtoken';

const verifyUserToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).json({ message: 'No token provided. Access denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach the decoded user data to the request object
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token. Access denied.' });
    }
};

export default verifyUserToken;