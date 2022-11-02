import usersModel from "./users.model.js";
import ordersModel from "./orders.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const orders = ordersModel(sequelize, Sequelize);

    const disputes = sequelize.define("dispute", {
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
        message: {
            type: Sequelize.STRING(1000),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_disputes_tbl'
    });
    return disputes;
};