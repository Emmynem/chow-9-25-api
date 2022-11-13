import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const USERS = db.users;
const ORDERS_HISTORY = db.orders_history;
const ORDERS = db.orders;

export const order_history_rules = {
    forFindingOrderHistory: [
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
                return ORDERS_HISTORY.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order History not found!');
                });
            })
    ],
    forFindingOrderHistoryViaOrder: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('order_unique_id', "Order Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((order_unique_id, { req }) => {
                return ORDERS_HISTORY.findOne({
                    where: {
                        order_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order History not found!');
                });
            })
    ],
    forFindingOrderHistoryFalsy: [
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
                return ORDERS_HISTORY.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order History not found!');
                });
            })
    ],
    forFindingOrderHistoryViaOrderFalsy: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('order_unique_id', "Order Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((order_unique_id, { req }) => {
                return ORDERS_HISTORY.findOne({
                    where: {
                        order_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order History not found!');
                });
            })
    ],
    forFindingOrderHistoryAlt: [
        check('order_history_unique_id', "Order History Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(order_history_unique_id => {
                return ORDERS_HISTORY.findOne({ where: { unique_id: order_history_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Order History not found!');
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
        check('order_unique_id', "Order Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(order_unique_id => {
                return ORDERS.findOne({
                    where: {
                        unique_id: order_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order not found!');
                });
            }),
        check('price')
            .optional({ checkFalsy: false })
            .bail()
            .isFloat()
            .custom(price => {
                if (price === 0) return false;
                else if (price < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('order_status', "Order Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
    ],
};  