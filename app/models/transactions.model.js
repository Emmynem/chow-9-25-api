import vendorsModel from "./vendors.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);

    const transactions = sequelize.define("transaction", {
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
        tableName: 'chow_925_transactions_tbl'
    });
    return transactions;
};