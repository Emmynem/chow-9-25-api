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
import authRoutes from "./routes/auth.routes.js";
import addressessRoutes from "./routes/addressess.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import disputesRoutes from "./routes/disputes.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import menusRoutes from "./routes/menus.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import ordersCompletedRoutes from "./routes/ordersCompleted.routes.js";
import ordersHistoryRoutes from "./routes/ordersHistory.routes.js";
import otpsRoutes from "./routes/otps.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ratingsRoutes from "./routes/ratings.routes.js";
import riderBankAccountsRoutes from "./routes/riderBankAccounts.routes.js";
import vendorBankAccountsRoutes from "./routes/vendorBankAccounts.routes.js";
import ridersRoutes from "./routes/riders.routes.js";
import usersRoutes from "./routes/users.routes.js";
import userTransactionsRoutes from "./routes/userTransactions.routes.js";
import riderShippingRoutes from "./routes/riderShipping.routes.js";
import riderTransactionsRoutes from "./routes/riderTransactions.routes.js";
import searchHistoryRoutes from "./routes/searchHistory.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import vendorAddressRoutes from "./routes/vendorAddress.routes.js";
import vendorsRoutes from "./routes/vendors.routes.js";
import cartsRoutes from "./routes/carts.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import viewHistoryRoutes from "./routes/viewHistory.routes.js";
import vendorUsersRoutes from "./routes/vendorUsers.routes.js";

const app = express();

//options for cors midddleware
const options = cors.CorsOptions = {
    allowedHeaders: [
        'Access-Control-Allow-Headers',
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
authRoutes(app);
addressessRoutes(app);
categoriesRoutes(app);
disputesRoutes(app);
favoritesRoutes(app);
menusRoutes(app);
notificationsRoutes(app);
ordersCompletedRoutes(app);
ordersHistoryRoutes(app);
otpsRoutes(app);
productsRoutes(app);
ratingsRoutes(app);
riderBankAccountsRoutes(app);
vendorBankAccountsRoutes(app);
ridersRoutes(app);
usersRoutes(app);
userTransactionsRoutes(app);
riderShippingRoutes(app);
riderTransactionsRoutes(app);
searchHistoryRoutes(app);
transactionsRoutes(app);
vendorAddressRoutes(app);
vendorsRoutes(app);
cartsRoutes(app);
ordersRoutes(app);
viewHistoryRoutes(app);
vendorUsersRoutes(app);

// change timezone for app
process.env.TZ = "Africa/Lagos";

export default app;
