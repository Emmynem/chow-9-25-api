export default (sequelize, Sequelize) => {

    const appDefaults = sequelize.define("app_default", {
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
        criteria: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        data_type: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        value: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_app_defaults_tbl'
    });
    return appDefaults;
};
