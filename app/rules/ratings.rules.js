import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status, validate_ratings } from '../config/config.js';

const USERS = db.users;
const RATINGS = db.ratings;
const PRODUCTS = db.products;

export const rating_rules = {
    forFindingRating: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return RATINGS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rating not found!');
                });
            })
    ],
    forFindingRatingViaProduct: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('product_unique_id', "Product Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((product_unique_id, { req }) => {
                return RATINGS.findOne({
                    where: {
                        product_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rating not found!');
                });
            })
    ],
    forFindingRatingFalsy: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return RATINGS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rating not found!');
                });
            })
    ],
    forFindingRatingViaProductFalsy: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('product_unique_id', "Product Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((product_unique_id, { req }) => {
                return RATINGS.findOne({
                    where: {
                        product_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rating not found!');
                });
            })
    ],
    forFindingRatingAlt: [
        check('rating_unique_id', "Rating Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rating_unique_id => {
                return RATINGS.findOne({ where: { unique_id: rating_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rating not found!');
                });
            })
    ],
    forAdding: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('product_unique_id', "Product Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(product_unique_id => {
                return PRODUCTS.findOne({
                    where: {
                        unique_id: product_unique_id,
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Product not found!');
                });
            }),
        check('rating', "Rating is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(rating => !!validate_ratings(rating)).withMessage(`Invalid rating, accepts min = ${get_min_and_max_ratings().min}, max = ${get_min_and_max_ratings().max}`)
    ],
    forUpdatingRating: [
        check('rating', "Rating is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(rating => !!validate_ratings(rating)).withMessage(`Invalid rating, accepts min = ${get_min_and_max_ratings().min}, max = ${get_min_and_max_ratings().max}`)
    ]
};  