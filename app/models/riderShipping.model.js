import ridersModel from "./riders.model.js";

export default (sequelize, Sequelize) => {

    const riders = ridersModel(sequelize, Sequelize);

    const riderShipping = sequelize.define("rider_shipping", {
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
        min_weight: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        max_weight: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        from_city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        from_state: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        from_country: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        to_city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        to_state: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        to_country: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_rider_shipping_tbl'
    });
    return riderShipping;
};