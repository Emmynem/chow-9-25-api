import usersModel from "./users.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);

    const notifications = sequelize.define("notification", {
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
        type: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        action: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        details: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        seen: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_notifications_tbl'
    });
    return notifications;
};