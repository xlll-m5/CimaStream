const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// هذا الكود يقرأ المفاتيح السرية التي وضعتها في Render
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// هذا يحدد كيف سيتم رفع الملفات
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        let resourceType = 'auto';
        let folder = 'CimaStream/others';

        if (file.fieldname === 'poster') {
            resourceType = 'image';
            folder = 'CimaStream/posters';
        } else if (file.fieldname === 'movie_file') {
            resourceType = 'video';
            folder = 'CimaStream/movies';
        }

        return {
            folder: folder,
            resource_type: resourceType,
            public_id: file.originalname // اسم الملف الأصلي
        };
    }
});

module.exports = storage;
