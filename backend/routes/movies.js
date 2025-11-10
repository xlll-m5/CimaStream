const router = require('express').Router();
const Movie = require('../models/Movie');
const multer = require('multer');
const verifyToken = require('../verifyToken');
const storage = require('../cloudinary.config.js'); // <-- 1. استيراد إعداد Cloudinary

// --- 2. استخدام Cloudinary كأداة تخزين ---
const upload = multer({ storage: storage });


// --- 3. تعديل مسار إضافة الفيلم ---
router.post('/add', 
    verifyToken, 
    // (نفس الكود لرفع الحقول)
    upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'movie_file', maxCount: 1 }]), 
    async (req, res) => {

    if (!req.user.isAdmin) {
        return res.status(403).json('أنت غير مصرح لك بإضافة أفلام!');
    }

    // طباعة للتحقق (يمكن حذفها لاحقاً)
    console.log('ملف البوستر المستلم:', req.files.poster[0]);
    console.log('ملف الفيلم المستلم:', req.files.movie_file[0]);

    try {
        const newMovie = new Movie({
            title: req.body.title,
            description: req.body.description,

            // --- 4. هذا هو التغيير الأهم: نحفظ الروابط من Cloudinary ---
            posterPath: req.files.poster[0].path, 
            moviePath: req.files.movie_file[0].path,
            // (ملف multer-storage-cloudinary يضع الرابط في .path)

            genre: req.body.genre.split(','),
            country: req.body.country,
            year: req.body.year,
            rating: req.body.rating,
            classification: req.body.classification
        });

        const movie = await newMovie.save();
        res.status(201).json(movie);
    } catch (err) {
        console.error(err); 
        res.status(500).json(err);
    }
});

// --- (باقي المسارات تبقى كما هي) ---
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/find/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
