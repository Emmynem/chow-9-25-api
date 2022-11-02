import vendorsModel from "./vendors.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);

    const vendorBankAccounts = sequelize.define("vendor_bank_account", {
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
        name: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        bank: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        account_number: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        default_bank: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_vendor_bank_accounts_tbl'
    });
    return vendorBankAccounts;
};