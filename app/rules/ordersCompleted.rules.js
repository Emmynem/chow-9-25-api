import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status, validate_payment_method, payment_methods } from '../config/config.js';

const USERS = db.users;
const ORDERS_COMPLETED = db.orders_completed;
const ORDERS = db.orders;

export const order_completed_rules = {
    forFindingOrderCompleted: [
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
                return ORDERS_COMPLETED.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
                });
            })
    ],
    forFindingOrderCompletedViaOrder: [
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
                return ORDERS_COMPLETED.findOne({
                    where: {
                        order_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
                });
            })
    ],
    forFindingOrderCompletedViaTrackingNumber: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('tracking_number', "Tracking Number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((tracking_number, { req }) => {
                return ORDERS_COMPLETED.findOne({
                    where: {
                        tracking_number,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
                });
            })
    ],
    forFindingOrderCompletedFalsy: [
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
                return ORDERS_COMPLETED.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
                });
            })
    ],
    forFindingOrderCompletedViaOrderFalsy: [
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
                return ORDERS_COMPLETED.findOne({
                    where: {
                        order_unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
                });
            })
    ],
    forFindingOrderCompletedViaTrackingNumberFalsy: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('tracking_number', "Tracking Number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((tracking_number, { req }) => {
                return ORDERS_COMPLETED.findOne({
                    where: {
                        tracking_number,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
                });
            })
    ],
    forFindingOrderCompletedAlt: [
        check('order_completed_unique_id', "Order Completed Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(order_completed_unique_id => {
                return ORDERS_COMPLETED.findOne({ where: { unique_id: order_completed_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Order Completed not found!');
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
        check('quantity', "Quantity is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(quantity => {
                if (quantity === 0) return false;
                else if (quantity < 0) return false;
                else return true;
            })
            .withMessage("Quantity invalid"),
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_payment_method(payment_method)).withMessage(`Invalid payment method, accepted methods (${payment_methods.card, payment_methods.wallet})`),        
        check('product_name', "Product Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('address_fullname', "Address Fullname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 100 })
            .withMessage("Invalid length (3 - 100) characters"),
        check('full_address', "Full Address is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('city', "City is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('state', "State is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('country', "Country is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('shipping_fee_price', "Shipping Fee Price is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(shipping_fee_price => {
                if (shipping_fee_price === 0) return false;
                else if (shipping_fee_price < 0) return false;
                else return true;
            })
            .withMessage("Shipping Fee Price invalid"),
        check('total_price', "Total Price is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(total_price => {
                if (total_price === 0) return false;
                else if (total_price < 0) return false;
                else return true;
            })
            .withMessage("Total Price invalid")
    ],
};  