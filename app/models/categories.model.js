export default (sequelize, Sequelize) => {

    const categories = sequelize.define("category", {
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
        name: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        stripped: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_categories_tbl'
    });
    return categories;
};