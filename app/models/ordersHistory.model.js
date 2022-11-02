import usersModel from "./users.model.js";
import ordersModel from "./orders.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const orders = ordersModel(sequelize, Sequelize);

    const ordersHistory = sequelize.define("order_history", {
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
        order_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: orders,
                key: "unique_id"
            }
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        order_status: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_orders_history_tbl'
    });
    return ordersHistory;
};