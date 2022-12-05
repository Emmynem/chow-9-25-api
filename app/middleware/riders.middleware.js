import multer, { diskStorage } from "multer";
import { promisify } from "util";
import { user_documents_path } from "../config/config.js";

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|jfif|JFIF)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    } else {
        cb(null, true);
    }
};

let storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, user_documents_path + req.RIDER_UNIQUE_ID + "/");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

let uploadFiles = multer({ storage: storage, fileFilter: imageFilter }).fields([{ name: 'profile_image', maxCount: 1 }]);
export const ridersMiddleware = promisify(uploadFiles);
