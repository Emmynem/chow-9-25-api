import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import apiKeysModel from "./apiKeys.model.js";
import appDefaultsModel from "./appDefaults.model.js";
import usersModel from "./users.model.js";
import privatesModel from "./privates.model.js";
import userAccountModel from "./userAccount.model.js";
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
import riderTransactionsModel from "./riderTransactions.model.js";
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
            idle: _pool.idle,
            evict: _pool.evict
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
db.user_account = userAccountModel(sequelize, Sequelize);
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
db.rider_transactions = riderTransactionsModel(sequelize, Sequelize);
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
db.privates.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.privates, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - User Account Associations
db.user_account.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.user_account, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Notifications Associations
db.notifications.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.notifications, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Addressess Associations
db.addressess.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.addressess, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - OTPs Associations
db.otps.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.otps, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.otps.hasOne(db.vendor_users, { foreignKey: 'unique_id', sourceKey: 'origin' });
db.vendor_users.belongsTo(db.otps, { foreignKey: 'unique_id', targetKey: 'origin' });

//    - Riders Associations
db.riders.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.riders, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Products Associations
db.products.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.products.hasOne(db.vendor_users, { foreignKey: 'unique_id', sourceKey: 'vendor_user_unique_id' });
db.vendor_users.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'vendor_user_unique_id' });

db.products.hasOne(db.categories, { foreignKey: 'unique_id', sourceKey: 'category_unique_id' });
db.categories.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'category_unique_id' });

db.products.hasOne(db.menus, { foreignKey: 'unique_id', sourceKey: 'menu_unique_id' });
db.menus.belongsTo(db.products, { foreignKey: 'unique_id', targetKey: 'menu_unique_id' });

//    - Product Images Associations
db.product_images.hasMany(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.hasMany(db.product_images, { sourceKey: 'unique_id', foreignKey: 'product_unique_id' });

//    - Category Images Associations
db.category_images.hasMany(db.categories, { foreignKey: 'unique_id', sourceKey: 'category_unique_id' });
db.categories.hasMany(db.category_images, { sourceKey: 'unique_id', foreignKey: 'category_unique_id' });

//    - Menus Associations
db.menus.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.menus, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.menus.hasOne(db.vendor_users, { foreignKey: 'unique_id', sourceKey: 'vendor_user_unique_id' });
db.vendor_users.belongsTo(db.menus, { foreignKey: 'unique_id', targetKey: 'vendor_user_unique_id' });

//    - Favorites Associations
db.favorites.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.favorites, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.favorites.hasOne(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.favorites, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Ratings Associations
db.ratings.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.ratings, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.ratings.hasOne(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.ratings, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Referrals Associations
db.referrals.hasMany(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.referrals, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Rider Account Associations
db.rider_account.hasOne(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_account, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Rider Bank Accounts Associations
db.rider_bank_accounts.hasOne(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_bank_accounts, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Rider Shipping Associations
db.rider_shipping.hasOne(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_shipping, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Search History Associations
db.search_history.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.search_history, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

//    - Transactions Associations
db.transactions.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.transactions, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Rider Transactions Associations
db.rider_transactions.hasOne(db.riders, { foreignKey: 'unique_id', sourceKey: 'rider_unique_id' });
db.riders.belongsTo(db.rider_transactions, { foreignKey: 'unique_id', targetKey: 'rider_unique_id' });

//    - Vendor Account Associations
db.vendor_account.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_account, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Address Associations
db.vendor_address.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_address, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Bank Accounts Associations
db.vendor_bank_accounts.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_bank_accounts, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - Vendor Users Associations
db.vendor_users.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.vendor_users, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

//    - View History Associations
db.view_history.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.view_history, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.view_history.hasOne(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.view_history, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

//    - Carts Associations
db.carts.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.carts.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.carts.hasOne(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

db.carts.hasOne(db.rider_shipping, { foreignKey: 'unique_id', sourceKey: 'shipping_fee_unique_id' });
db.rider_shipping.belongsTo(db.carts, { foreignKey: 'unique_id', targetKey: 'shipping_fee_unique_id' });

//    - Orders Associations
db.orders.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.orders.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.orders.hasOne(db.products, { foreignKey: 'unique_id', sourceKey: 'product_unique_id' });
db.products.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'product_unique_id' });

db.orders.hasOne(db.rider_shipping, { foreignKey: 'unique_id', sourceKey: 'shipping_fee_unique_id' });
db.rider_shipping.belongsTo(db.orders, { foreignKey: 'unique_id', targetKey: 'shipping_fee_unique_id' });

//    - Disputes Associations
db.disputes.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.disputes, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.disputes.hasOne(db.orders, { foreignKey: 'unique_id', sourceKey: 'order_unique_id' });
db.orders.belongsTo(db.disputes, { foreignKey: 'unique_id', targetKey: 'order_unique_id' });

//    - Orders Completed Associations
db.orders_completed.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.orders_completed.hasOne(db.vendors, { foreignKey: 'unique_id', sourceKey: 'vendor_unique_id' });
db.vendors.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'vendor_unique_id' });

db.orders_completed.hasOne(db.orders, { foreignKey: 'unique_id', sourceKey: 'order_unique_id' });
db.orders.belongsTo(db.orders_completed, { foreignKey: 'unique_id', targetKey: 'order_unique_id' });

//    - Orders History Associations
db.orders_history.hasOne(db.users, { foreignKey: 'unique_id', sourceKey: 'user_unique_id' });
db.users.belongsTo(db.orders_history, { foreignKey: 'unique_id', targetKey: 'user_unique_id' });

db.orders_history.hasOne(db.orders, { foreignKey: 'unique_id', sourceKey: 'order_unique_id' });
db.orders.belongsTo(db.orders_history, { foreignKey: 'unique_id', targetKey: 'order_unique_id' });

export default db;