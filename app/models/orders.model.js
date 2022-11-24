import usersModel from "./users.model.js";
import vendorsModel from "./vendors.model.js";
import productsModel from "./products.model.js";
import riderShippingModel from "./riderShipping.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const vendors = vendorsModel(sequelize, Sequelize);
    const products = productsModel(sequelize, Sequelize);
    const rider_shipping = riderShippingModel(sequelize, Sequelize);

    const orders = sequelize.define("order", {
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
        tracking_number: {
            type: Sequelize.STRING(15),
            allowNull: false,
            unique: true
        },
        shipping_fee_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: true,
            references: {
                model: rider_shipping,
                key: "unique_id"
            }
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        shipping_fee: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        rider_credit: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        rider_service_charge: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        credit: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        service_charge: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        payment_method: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        paid: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        shipped: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        disputed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        delivery_status: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_orders_tbl'
    });
    return orders;
};