import usersModel from "./users.model.js";
import vendorsModel from "./vendors.model.js";
import ordersModel from "./orders.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const vendors = vendorsModel(sequelize, Sequelize);
    const orders = ordersModel(sequelize, Sequelize);

    const ordersCompleted = sequelize.define("order_completed", {
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
        order_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: orders,
                key: "unique_id"
            }
        },
        tracking_number: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        payment_method: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        product_name: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        address_fullname: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        full_address: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        state: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        country: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        shipping_fee_price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        total_price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_orders_completed_tbl'
    });
    return ordersCompleted;
};