import usersModel from "./users.model.js";
import vendorsModel from "./vendors.model.js";
import productsModel from "./products.model.js";
import riderShippingModel from "./riderShipping.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const vendors = vendorsModel(sequelize, Sequelize);
    const products = productsModel(sequelize, Sequelize);
    const rider_shipping = riderShippingModel(sequelize, Sequelize);

    const carts = sequelize.define("cart", {
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
        user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        vendor_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: vendors,
                key: "unique_id"
            }
        },
        product_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: products,
                key: "unique_id"
            }
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        shipping_fee_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: true,
            references: {
                model: rider_shipping,
                key: "unique_id"
            }
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_carts_tbl'
    });
    return carts;
};