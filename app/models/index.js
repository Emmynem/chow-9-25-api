import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import apiKeysModel from "./apiKeys.model.js";
import appDefaultsModel from "./appDefaults.model.js";
import usersModel from "./users.model.js";
import privatesModel from "./privates.model.js";
import notificationsModel from "./notifications.model.js";
import addressessModel from "./addressess.model.js";
import cartsModel from "./carts.model.js";
import categoriesModel from "./categories.model.js";
import categoryImagesModel from "./categoryImages.model.js";
import disputesModel from "./disputes.model.js";
import favoritesModel from "./favorites.model.js";
import menusModel from "./menus.model.js";
import ordersModel from "./orders.model.js";
import ordersCompletedModel from "./ordersCompleted.model.js";
import ordersHistoryModel from "./ordersHistory.model.js";
import otpsModel from "./otps.model.js";
import productsModel from "./products.model.js";
import productImagesModel from "./productImages.model.js";
import ratingsModel from "./ratings.model.js";
import referralsModel from "./referrals.model.js";
import ridersModel from "./riders.model.js";
import riderAccountModel from "./riderAccount.model.js";
import riderBankAccountsModel from "./riderBankAccounts.model.js";
import riderShippingModel from "./riderShipping.model.js";
import searchHistoryModel from "./searchHistory.model.js";
import transactionsModel from "./transactions.model.js";
import vendorAccountModel from "./vendorAccount.model.js";
import vendorAddressModel from "./vendorAddress.model.js";
import vendorBankAccountsModel from "./vendorBankAccounts.model.js";
import vendorsModel from "./vendors.model.js";
import vendorUsersModel from "./vendorUsers.model.js";
import viewHistoryModel from "./viewHistory.model.js";

const sequelize = new Sequelize(
    DB,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: _dialect,
        logging: _logging,
        operatorsAliases: 0,
        pool: {
            max: _pool.max,
            min: _pool.min,
            acquire: _pool.acquire,
            idle: _pool.idle
        },
        dialectOptions: {
            // useUTC: _dialectOptions.useUTC, 
            dateStrings: _dialectOptions.dateStrings,
            typeCast: _dialectOptions.typeCast
        },
        timezone: timezone
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.api_keys = apiKeysModel(sequelize, Sequelize);
db.app_defaults = appDefaultsModel(sequelize, Sequelize);
db.users = usersModel(sequelize, Sequelize);
db.privates = privatesModel(sequelize, Sequelize);
db.notifications = notificationsModel(sequelize, Sequelize);
db.addressess = addressessModel(sequelize, Sequelize);
db.vendors = vendorsModel(sequelize, Sequelize);
db.vendor_users = vendorUsersModel(sequelize, Sequelize);
db.riders = ridersModel(sequelize, Sequelize);
db.products = productsModel(sequelize, Sequelize);
db.categories = categoriesModel(sequelize, Sequelize);
db.category_images = categoryImagesModel(sequelize, Sequelize);
db.favorites = favoritesModel(sequelize, Sequelize);
db.menus = menusModel(sequelize, Sequelize);
db.otps = otpsModel(sequelize, Sequelize);
db.product_images = productImagesModel(sequelize, Sequelize);
db.ratings = ratingsModel(sequelize, Sequelize);
db.referrals = referralsModel(sequelize, Sequelize);
db.rider_account = riderAccountModel(sequelize, Sequelize);
db.rider_bank_accounts = riderBankAccountsModel(sequelize, Sequelize);
db.rider_shipping = riderShippingModel(sequelize, Sequelize);
db.search_history = searchHistoryModel(sequelize, Sequelize);
db.transactions = transactionsModel(sequelize, Sequelize);
db.vendor_account = vendorAccountModel(sequelize, Sequelize);
db.vendor_address = vendorAddressModel(sequelize, Sequelize);
db.vendor_bank_accounts = vendorBankAccountsModel(sequelize, Sequelize);
db.view_history = viewHistoryModel(sequelize, Sequelize);
db.carts = cartsModel(sequelize, Sequelize);
db.disputes = disputesModel(sequelize, Sequelize);
db.orders = ordersModel(sequelize, Sequelize);
db.orders_completed = ordersCompletedModel(sequelize, Sequelize);
db.orders_history = ordersHistoryModel(sequelize, Sequelize);

// Associations
//    - Privates Associations
db.privates.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.privates, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Notifications Associations
db.notifications.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.notifications, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Addressess Associations
db.addressess.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.addressess, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - OTPs Associations
db.otps.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.otps, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.otps.hasMany(db.vendor_users, { foreignKey: 'unique_id', sourceKey: 'origin' });
db.vendor_users.belongsTo(db.otps, { foreignKey: 'unique_id', targetKey: 'origin' });

//    - Products Associations
db.products.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.products.hasMany(db.vendor_users, { foreignKey: 'unique_id', sourceKey: 'vendor_user_unique_id' });
db.vendor_users.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'vendor_user_unique_id' });

db.products.hasMany(db.categories, { foreignKey: 'unique_id', sourceKey: 'category_unique_id' });
db.categories.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'category_unique_id' });

db.products.hasMany(db.menus, { foreignKey: 'unique_id', sourceKey: 'menu_unique_id' });
db.menus.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'menu_unique_id' });

//    - Product Images Associations
db.product_images.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.product_images, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Category Images Associations
db.category_images.hasMany(db.categories, { foreignKey: 'unique_id', sourceKey: 'category_unique_id' });
db.categories.belongsTo(db.category_images, { foreignKey: 'unique_id', targetKey: 'category_unique_id' });

//    - Menus Associations
db.menus.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.menus, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.menus.hasMany(db.vendor_users, { foreignKey: 'unique_id', sourceKey: 'vendor_user_unique_id' });
db.vendor_users.belongsTo(db.menus, { foreignKey: 'unique_id', targetKey: 'vendor_user_unique_id' });

//    - Favorites Associations
db.favorites.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.favorites, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.favorites.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.favorites, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Ratings Associations
db.ratings.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.ratings, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.ratings.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.ratings, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Referrals Associations
db.referrals.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.referrals, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Rider Account Associations
db.rider_account.hasMany(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_account, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Rider Bank Accounts Associations
db.rider_bank_accounts.hasMany(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_bank_accounts, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Rider Shipping Associations
db.rider_shipping.hasMany(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_shipping, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Search History Associations
db.search_history.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.search_history, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Transactions Associations
db.transactions.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.transactions, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Account Associations
db.vendor_account.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_account, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Address Associations
db.vendor_address.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_address, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Bank Accounts Associations
db.vendor_bank_accounts.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_bank_accounts, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Users Associations
db.vendor_users.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_users, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - View History Associations
db.view_history.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.view_history, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.view_history.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.view_history, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Carts Associations
db.carts.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.carts.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.carts.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

db.carts.hasMany(db.rider_shipping, { foreignKey: 'unique_id', sourceKey: 'shipping_fee_unique_id' });
db.rider_shipping.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'shipping_fee_unique_id' });

//    - Carts Associations
db.carts.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.carts.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.carts.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

db.carts.hasMany(db.rider_shipping, { foreignKey: 'unique_id', sourceKey: 'shipping_fee_unique_id' });
db.rider_shipping.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'shipping_fee_unique_id' });

//    - Orders Associations
db.orders.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.orders.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.orders.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

db.orders.hasMany(db.rider_shipping, { foreignKey: 'unique_id', sourceKey: 'shipping_fee_unique_id' });
db.rider_shipping.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'shipping_fee_unique_id' });

//    - Disputes Associations
db.disputes.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.disputes, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.disputes.hasMany(db.orders, { foreignKey: 'unique_id', sourceKey: 'order_unique_id' });
db.orders.belongsTo(db.disputes, { foreignKey: 'unique_id', targetKey: 'order_unique_id' });

//    - Orders Completed Associations
db.orders_completed.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.orders_completed.hasMany(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.orders_completed.hasMany(db.orders, { foreignKey: 'unique_id', sourceKey: 'order_unique_id' });
db.orders.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'order_unique_id' });

db.orders_completed.hasMany(db.orders, { foreignKey: 'tracking_number', sourceKey: 'tracking_number' });
db.orders.belongsTo(db.orders_completed, { foreignKey: 'tracking_number', targetKey: 'tracking_number' });

//    - Orders History Associations
db.orders_completed.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.orders_completed.hasMany(db.orders, { foreignKey: 'unique_id', sourceKey: 'order_unique_id' });
db.orders.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'order_unique_id' });

export default db;