import usersModel from "./users.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);

    const referrals = sequelize.define("referral", {
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
        referral_user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
        },
        user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        referral_link: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: 'chow_925_referrals_tbl'
    });
    return referrals;
};