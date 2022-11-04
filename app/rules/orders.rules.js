import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status, validate_payment_method, payment_methods } from '../config/config.js';

const USERS = db.users;
const ORDERS = db.orders;
const PRODUCTS = db.products;
const VENDORS = db.vendors;
const RIDER_SHIPPING = db.rider_shipping;

export const order_rules = {
    forFindingOrder: [
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
                return ORDERS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order not found!');
                });
            })
    ],
    forFindingOrdersViaTrackingNumber: [
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
                return ORDERS.findOne({
                    where: {
                        tracking_number,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Orders not found!');
                });
            })
    ],
    forFindingOrderFalsy: [
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
                return ORDERS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Order not found!');
                });
            })
    ],
    forFindingOrdersViaTrackingNumberFalsy: [
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
                return ORDERS.findOne({
                    where: {
                        tracking_number,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Orders not found!');
                });
            })
    ],
    forFindingOrderAlt: [
        check('order_unique_id', "Order Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(order_unique_id => {
                return ORDERS.findOne({ where: { unique_id: order_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Order not found!');
                });
            })
    ],
    forFindingOrderViaTrackingNumberAlt: [
        check('tracking_number', "Tracking Number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(tracking_number => {
                return ORDERS.findOne({ where: { tracking_number, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Orders not found!');
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
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('product_unique_id', "Product Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(product_unique_id => {
                return PRODUCTS.findOne({
                    where: {
                        unique_id: product_unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Product not found!');
                });
            }),
        check('shipping_fee_unique_id')
            .exists({ checkFalsy: false })
            .bail()
            .custom(shipping_fee_unique_id => {
                return RIDER_SHIPPING.findOne({ where: { unique_id: shipping_fee_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Shipping Fee not found!');
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
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount === 0) return false;
                else if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('shipping_fee', "Shipping Fee is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(shipping_fee => {
                if (shipping_fee === 0) return false;
                else if (shipping_fee < 0) return false;
                else return true;
            })
            .withMessage("Shipping Fee invalid"),
        check('credit', "Credit is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(credit => {
                if (credit === 0) return false;
                else if (credit < 0) return false;
                else return true;
            })
            .withMessage("Credit invalid"),
        check('service_charge', "Service Charge is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(service_charge => {
                if (service_charge === 0) return false;
                else if (service_charge < 0) return false;
                else return true;
            })
            .withMessage("Service Charge invalid"),
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_payment_method(payment_method)).withMessage(`Invalid payment method, accepted methods (${payment_methods.toString()})`),
        check('delivery_status', "Delivery Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
    ],
    forUpdatingPaymentMethod: [
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_payment_method(payment_method)).withMessage(`Invalid payment method, accepted methods (${payment_methods.toString()})`)
    ]
};  