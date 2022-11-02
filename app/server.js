import express, { json, urlencoded } from "express";
import path from 'path';
import cors from "cors";
import helmet from "helmet";
import { SuccessResponse } from './common/index.js';
import { chow_925_header_key, chow_925_header_token } from './config/config.js';
import logger from "./common/logger.js";
import morganMiddleware from "./middleware/morgan.js";
import db from "./models/index.js";
import { createApiKeys, createAppDefaults, createDefaultVendor } from './config/default.config.js';

const app = express();

//options for cors midddleware
const options = cors.CorsOptions = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        chow_925_header_key,
        chow_925_header_token
    ],
    methods: 'GET,PUT,POST,DELETE',
};

app.use(json({ limit: '100mb' }));
app.use(urlencoded({ extended: true, limit: '100mb' }));
app.use(helmet());
app.use(morganMiddleware);

// add cors
app.use(cors(options));

// simple route
app.get("/", (request, response) => {
    SuccessResponse(response, "Chow 9:25 server activated.");
})

// Sequelize initialization
db.sequelize.sync().then(() => {
    logger.info("DB Connected 🚀");
    // creating defaults
    createApiKeys();
    createAppDefaults();
    createDefaultVendor();
});

app.use(express.static(path.join(__dirname, '../public')));

// Binding routes

// change timezone for app
process.env.TZ = "Africa/Lagos";

export default app;

