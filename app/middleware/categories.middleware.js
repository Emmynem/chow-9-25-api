import multer, { diskStorage } from "multer";
import { promisify } from "util";
import { images_documents_path } from "../config/config.js";

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    } else {
        cb(null, true);
    }
};

let storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, images_documents_path);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

let uploadFiles = multer({ storage: storage, fileFilter: imageFilter }).fields([{ name: 'image', maxCount: 1 }]);
export const categoryMiddleware = promisify(uploadFiles);
