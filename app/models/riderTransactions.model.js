import ridersModel from "./riders.model.js";

export default (sequelize, Sequelize) => {

    const riders = ridersModel(sequelize, Sequelize);

    const riderTransactions = sequelize.define("rider_transaction", {
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
        rider_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: riders,
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
        tableName: 'chow_925_rider_transactions_tbl'
    });
    return riderTransactions;
};