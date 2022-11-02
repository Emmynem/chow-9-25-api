export default (sequelize, Sequelize) => {

    const apiKeys = sequelize.define("api_key", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true
        },
        type: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        api_key: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_api_keys_tbl'
    });
    return apiKeys;
};
