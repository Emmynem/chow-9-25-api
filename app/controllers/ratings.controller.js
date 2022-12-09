import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status, ratings } from '../config/config.js';
import db from "../models/index.js";

const RATINGS = db.ratings;
const USERS = db.users;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export function rootGetRatings(req, res) {
    RATINGS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['updatedAt', 'DESC']
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
    }).then(ratings => {
        if (!ratings || ratings.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Ratings Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Ratings loaded" }, ratings);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetRating(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        RATINGS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
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
        }).then(rating => {
            if (!rating) {
                NotFoundError(res, { unique_id: tag_admin, text: "Rating not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Rating loaded" }, rating);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetRatingsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        RATINGS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['updatedAt', 'DESC']
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
        }).then(ratings => {
            if (!ratings || ratings.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Ratings Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Ratings loaded" }, ratings);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getRatings(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    RATINGS.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'status'] },
        where: {
            user_unique_id
        },
        order: [
            ['updatedAt', 'DESC']
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
    }).then(ratings => {
        if (!ratings || ratings.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Ratings Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Ratings loaded" }, ratings);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getRatingSpecifically(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        RATINGS.findOne({
            attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'status'] },
            where: {
                user_unique_id,
                ...payload,
            },
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
        }).then(rating => {
            if (!rating) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Rating Not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Rating loaded" }, rating);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function addRating(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const last_rating = await RATINGS.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        product_unique_id: payload.product_unique_id,
                        status: default_status
                    },
                    transaction
                });
                
                const middle_rating_index = Math.floor(ratings.length / 2);
                const middle_rating = ratings[middle_rating_index];
                const good_or_bad = payload.rating < middle_rating.value ? false : true;

                if (last_rating) {
                    const product_rating = await PRODUCTS.increment({ good_rating: good_or_bad ? 1 : -1, bad_rating: good_or_bad ? -1 : 1 }, { where: { unique_id: payload.product_unique_id }, transaction });
                    
                    const rating = await RATINGS.update(
                        {
                            ...payload,
                        }, {
                            where: {
                                unique_id: last_rating.unique_id,
                                user_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    if (rating > 0) {
                        OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Rating was updated successfully!" });
                    } else {
                        throw new Error("Error updating rating");
                    }
                } else {
                    
                    const product_rating = await PRODUCTS.increment({ good_rating: good_or_bad ? 1 : 0, bad_rating: good_or_bad ? 0 : 1 }, { where: { unique_id: payload.product_unique_id }, transaction });
                    
                    const rating = await RATINGS.create(
                        {
                            ...payload,
                            unique_id: uuidv4(),
                            user_unique_id,
                            status: default_status
                        }, { transaction }
                    );
    
                    if (rating) {
                        CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Rating added successfully!" });
                    } else {
                        throw new Error("Error adding rating");
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function deleteRating(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const last_rating = await RATINGS.findOne({
                    where: {
                        user_unique_id,
                        ...payload,
                        status: default_status
                    },
                    transaction
                });

                const middle_rating_index = Math.floor(ratings.length / 2);
                const middle_rating = ratings[middle_rating_index];
                const good_or_bad = payload.rating < middle_rating.value ? false : true;

                const product_rating = await PRODUCTS.increment({ good_rating: good_or_bad ? 0 : -1, bad_rating: good_or_bad ? -1 : 0 }, { where: { unique_id: payload.product_unique_id }, transaction });

                const rating = await RATINGS.destroy(
                    {
                        where: {
                            ...payload,
                            user_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );
    
                if (rating > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Rating was deleted successfully!" });
                } else {
                    throw new Error("Error deleting rating");
                }
            });

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};