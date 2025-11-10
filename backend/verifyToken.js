const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // جلب "التوكن" من الهيدر
    const authHeader = req.headers.authorization; 
    
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        jwt.verify(token, process.env.JWT_SECRET || 'CimaExtremeSecretKey2026', (err, user) => {
            if (err) {
                return res.status(403).json('Token is not valid!');
            }
            // إذا كان التوكن صحيحاً، أضف بيانات المستخدم للطلب
            req.user = user; 
            next(); // اكمل للخطوة التالية
        });
    } else {
        return res.status(401).json('You are not authenticated!');
    }
};

module.exports = verifyToken;

