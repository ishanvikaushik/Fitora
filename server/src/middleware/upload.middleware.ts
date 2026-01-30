import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
//this middleware is to upload images and will be written after cloudinary config file
//after this make the upload controller file