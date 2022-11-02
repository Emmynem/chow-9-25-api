import vendorsModel from "./vendors.model.js";
import vendorUsersModel from "./vendorUsers.model.js";

export default (sequelize, Sequelize) => {

    const vendors = vendorsModel(sequelize, Sequelize);
    const vendor_users = vendorUsersModel(sequelize, Sequelize);

    const otp_2fas = sequelize.define("otp_2fa", {
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
        origin: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: vendor_users,
                key: "unique_id"
            }
        },
        code: {
            type: Sequelize.STRING(6),
            allowNull: false,
        },
        valid: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        expiration: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_otp_2fas_tbl'
    });
    return otp_2fas;
};