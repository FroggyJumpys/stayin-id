import jwt from 'jsonwebtoken';

const authorize = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorize.' });
    };

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err)
            return res.status(403).json({ message: 'Somthing went wrong', error: err });

        req.user = user;
        next();
    });
};

export default authorize;