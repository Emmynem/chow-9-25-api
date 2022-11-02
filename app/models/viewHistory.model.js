import usersModel from "./users.model.js";
import productsModel from "./products.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const products = productsModel(sequelize, Sequelize);

    const viewHistory = sequelize.define("view_history", {
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
        product_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: products,
                key: "unique_id"
            }
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_view_history_tbl'
    });
    return viewHistory;
};