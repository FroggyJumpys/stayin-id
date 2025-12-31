import jwt from 'jsonwebtoken';

/**
 * Middleware untuk autentikasi dan otorisasi
 * @param {string|string[]} requiredRole - Role yang diizinkan (string atau array)
 * @returns {Function} Express middleware
 */
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
            
            // Optional role check - support array atau string
            if (requiredRole) {
                const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                if (!allowedRoles.includes(payload.role)) {
                    return res.status(403).json({ message: 'Forbidden: insufficient permission' });
                }
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