import vendorsModel from "./vendors.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);

    const vendorUsers = sequelize.define("vendor_user", {
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
        firstname: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        middlename: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        lastname: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true
        },
        mobile_number: {
            type: Sequelize.STRING(20),
            allowNull: true,
            unique: true
        },
        gender: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        routes: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        access: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_vendor_users_tbl'
    });
    return vendorUsers;
};