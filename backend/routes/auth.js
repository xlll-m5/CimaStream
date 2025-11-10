const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'CimaExtremeSecretKey2026';

// --- مسار إنشاء حساب ---
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- مسار تسجيل الدخول (المعدل ليتجاهل حالة الأحرف) ---
router.post('/login', async (req, res) => {
    try {
        // هذا هو الكود الصحيح لجعل البحث غير حساس لحالة الأحرف
        const loginIdentifier = req.body.loginIdentifier;
        const user = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') } },
                { username: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') } }
            ]
        });
        
        if (!user) {
            return res.status(404).json('User not found!');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json('Wrong password!');
        }

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '3d' }
        );

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });

    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;
