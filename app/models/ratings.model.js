import usersModel from "./users.model.js";
import productsModel from "./products.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);
    const products = productsModel(sequelize, Sequelize);

    const ratings = sequelize.define("rating", {
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
        product_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: products,
                key: "unique_id"
            }
        },
        rating: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_ratings_tbl'
    });
    return ratings;
};