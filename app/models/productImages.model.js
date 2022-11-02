import productsModel from "./products.model.js";

export default (sequelize, Sequelize) => {

    const products = productsModel(sequelize, Sequelize);

    const productImages = sequelize.define("product_image", {
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
        product_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: products,
                key: "unique_id"
            }
        },
        image_base_url: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        image_dir: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        image: {
            type: Sequelize.STRING(500),
            allowNull: false,
        },
        image_file: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        image_size: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_product_images_tbl'
    });
    return productImages;
};