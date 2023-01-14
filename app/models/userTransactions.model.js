import usersModel from "./users.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);

    const userTransactions = sequelize.define("user_transaction", {
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
        type: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        transaction_status: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        details: {
            type: Sequelize.STRING(500),
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_user_transactions_tbl'
    });
    return userTransactions;
};