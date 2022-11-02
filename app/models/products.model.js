import vendorsModel from "./vendors.model.js";
import vendorUsersModel from "./vendorUsers.model.js";
import menusModel from "./menus.model.js";
import categoriesModel from "./categories.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);
    const vendor_users = vendorUsersModel(sequelize, Sequelize);
    const menus = menusModel(sequelize, Sequelize);
    const categories = categoriesModel(sequelize, Sequelize);

    const products = sequelize.define("product", {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true
        },
        vendor_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: vendors,
                key: "unique_id"
            }
        },
        vendor_user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: vendor_users,
                key: "unique_id"
            }
        },
        menu_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: true,
            references: {
                model: menus,
                key: "unique_id"
            }
        },
        category_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: categories,
                key: "unique_id"
            }
        },
        name: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        stripped: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        duration: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        weight: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        remaining: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        sales_price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        views: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        favorites: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        good_rating: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        bad_rating: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_products_tbl'
    });
    return products;
};