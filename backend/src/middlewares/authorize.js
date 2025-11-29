import jwt from 'jsonwebtoken';

export default function authorize(requiredRole) {
    return (req, res, next) => {
        try {
            const cookieToken = req.cookies?.token;
            const authHeader = req.headers?.authorization;
            const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
            const token = cookieToken || headerToken;

            if (!token) {
                return res.status(401).json({ message: 'Unauthorized: token missing' });
            }

            const secret = process.env.SECRET_KEY;
            if (!secret) {
                return res.status(500).json({ message: 'Server misconfigured: SECRET_KEY missing' });
            }

            const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
            // Optional role check
            if (requiredRole && payload.role !== requiredRole) {
                return res.status(403).json({ message: 'Forbidden: insufficient permission' });
            }

            req.user = payload;
            next();
        } catch (err) {
            const isExpired = err?.name === 'TokenExpiredError';
            const isInvalid = err?.name === 'JsonWebTokenError';
            const status = isExpired || isInvalid ? 401 : 500;
            return res.status(status).json({
                message: isExpired ? 'Unauthorized: token expired' :
                    isInvalid ? 'Unauthorized: invalid token' :
                        'Authorization error',
            });
        }
    };
}