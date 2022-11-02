import vendorsModel from "./vendors.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);

    const vendorAddress = sequelize.define("vendor_address", {
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
        address: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        additional_information: {
            type: Sequelize.STRING(200),
            allowNull: true,
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
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_vendor_address_tbl'
    });
    return vendorAddress;
};