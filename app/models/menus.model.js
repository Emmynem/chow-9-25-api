import vendorsModel from "./vendors.model.js";
import vendorUsersModel from "./vendorUsers.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);
    const vendor_users = vendorUsersModel(sequelize, Sequelize);

    const menus = sequelize.define("menu", {
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
        vendor_user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: vendor_users,
                key: "unique_id"
            }
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        stripped: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        start_time: {
            type: Sequelize.TIME,
            allowNull: true,
        },
        end_time: {
            type: Sequelize.TIME,
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_menus_tbl'
    });
    return menus;
};