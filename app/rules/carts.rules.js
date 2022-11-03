import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const USERS = db.users;
const CARTS = db.carts;
const PRODUCTS = db.products;
const VENDORS = db.vendors;
const RIDER_SHIPPING = db.rider_shipping;

export const cart_rules = {
    forFindingCart: [
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
                return CARTS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Cart not found!');
                });
            })
    ],
    forFindingCartFalsy: [
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
                return CARTS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Cart not found!');
                });
            })
    ],
    forFindingCartAlt: [
        check('cart_unique_id', "Cart Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(cart_unique_id => {
                return CARTS.findOne({ where: { unique_id: cart_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Cart not found!');
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
        check('shipping_fee_unique_id')
            .exists({ checkFalsy: false })
            .bail()
            .custom(shipping_fee_unique_id => {
                return RIDER_SHIPPING.findOne({ where: { unique_id: shipping_fee_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Shipping Fee not found!');
                });
            }),
    ],
    forUpdatingQuantity: [
        check('quantity', "Quantity is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(quantity => {
                if (quantity === 0) return false;
                else if (quantity < 0) return false;
                else return true;
            })
            .withMessage("Quantity invalid")
    ],
    forUpdatingShipping: [
        check('shipping_fee_unique_id', "Shipping Fee Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(shipping_fee_unique_id => {
                return RIDER_SHIPPING.findOne({ where: { unique_id: shipping_fee_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Shipping Fee not found!');
                });
            })
    ]
};  