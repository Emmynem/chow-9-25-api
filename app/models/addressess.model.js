import usersModel from "./users.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);

    const addressess = sequelize.define("addressess", {
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
        firstname: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        lastname: {
            type: Sequelize.STRING(50),
            allowNull: false,
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
        default_address: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_addressess_tbl'
    });
    return addressess;
};