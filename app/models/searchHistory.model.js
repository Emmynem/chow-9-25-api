import usersModel from "./users.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);

    const searchHistory = sequelize.define("search_history", {
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
            allowNull: true,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        search: {
            type: Sequelize.STRING(300),
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING(20),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_search_history_tbl'
    });
    return searchHistory;
};