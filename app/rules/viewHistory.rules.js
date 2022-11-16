import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const USERS = db.users;
const VIEW_HISTORY = db.view_history;
const PRODUCTS = db.products;

export const view_history_rules = {
    forFindingViewHistory: [
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
                return VIEW_HISTORY.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('View History not found!');
                });
            })
    ],
    forFindingViewHistoryFalsy: [
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
                return VIEW_HISTORY.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('View History not found!');
                });
            })
    ],
    forFindingViewHistoryAlt: [
        check('view_history_unique_id', "View History Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(view_history_unique_id => {
                return VIEW_HISTORY.findOne({ where: { unique_id: view_history_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('View History not found!');
                });
            })
    ],
    forFindingViewHistoryViaProductId: [
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
                return VIEW_HISTORY.findOne({
                    where: {
                        product_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('View History not found!');
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
                return PRODUCTS.findOne({ where: { unique_id: product_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Product not found!');
                });
            }),
    ]
};  