import ridersModel from "./riders.model.js";

export default (sequelize, Sequelize) => {

    const riders = ridersModel(sequelize, Sequelize);

    const riderAccount = sequelize.define("rider_account", {
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
        balance: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        service_charge: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_rider_account_tbl'
    });
    return riderAccount;
};