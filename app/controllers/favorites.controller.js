import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status } from '../config/config.js';
import db from "../models/index.js";

const FAVORITES = db.favorites;
const USERS = db.users;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export function rootGetFavorites(req, res) {
    FAVORITES.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
            },
            {
                model: PRODUCTS,
                attributes: ['name', 'stripped', 'duration', 'weight', 'price', 'sales_price', 'views', 'favorites', 'good_rating', 'bad_rating'],
                include: [
                    {
                        model: PRODUCT_IMAGES,
                        attributes: ['image']
                    }
                ]
            }
        ]
    }).then(favorites => {
        if (!favorites || favorites.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Favorites Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Favorites loaded" }, favorites);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetFavorite(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        FAVORITES.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.favorite_unique_id,
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                },
                {
                    model: PRODUCTS,
                    attributes: ['name', 'stripped', 'duration', 'weight', 'price', 'sales_price', 'views', 'favorites', 'good_rating', 'bad_rating'],
                    include: [
                        {
                            model: PRODUCT_IMAGES,
                            attributes: ['image']
                        }
                    ]
                }
            ]
        }).then(favorite => {
            if (!favorite) {
                NotFoundError(res, { unique_id: tag_admin, text: "Favorite not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Favorite loaded" }, favorite);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getFavorites(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    FAVORITES.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'updatedAt'] },
        where: {
            user_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: PRODUCTS,
                attributes: ['name', 'stripped', 'duration', 'weight', 'price', 'sales_price', 'views', 'favorites', 'good_rating', 'bad_rating'],
                include: [
                    {
                        model: PRODUCT_IMAGES,
                        attributes: ['image']
                    }
                ]
            }
        ]
    }).then(favorites => {
        if (!favorites || favorites.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Favorites Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Favorites loaded" }, favorites);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export async function addFavorite(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const last_favorite = await FAVORITES.findOne({
                where: {
                    user_unique_id: payload.user_unique_id,
                    product_unique_id: payload.product_unique_id,
                    status: default_status
                },
            });

            if (last_favorite) {
                const favorite = await db.sequelize.transaction((t) => {
                    return FAVORITES.destroy({
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                if (favorite > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Favorite was deleted successfully!" });
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Error deleting favorite!" }, null);
                }
            } else {
                const favorite = await db.sequelize.transaction((t) => {
                    return FAVORITES.create({
                        ...payload,
                        unique_id: uuidv4(),
                        status: default_status
                    }, { transaction: t });
                });
                
                if (favorite) {
                    CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Favorite added successfully!" });
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Error deleting favorite!" }, null);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function deleteFavorite(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const favorite = await db.sequelize.transaction((t) => {
                return FAVORITES.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (favorite > 0) {
                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Favorite was deleted successfully!" });
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error deleting favorite!" }, null);
            }

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};