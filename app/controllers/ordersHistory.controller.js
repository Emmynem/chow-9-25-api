import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status } from '../config/config.js';
import db from "../models/index.js";

const ORDERS_HISTORY = db.orders_history;
const USERS = db.users;
const ORDERS = db.orders;
const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const VENDORS = db.vendors;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export function rootGetOrdersHistory(req, res) {
    ORDERS_HISTORY.findAndCountAll({
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
                model: ORDERS,
                attributes: ['quantity', 'amount', 'shipping_fee', 'payment_method', 'paid', 'shipped', 'disputed', 'delivery_status', 'createdAt', 'updatedAt'],
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
                    },
                    {
                        model: VENDORS,
                        attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                    },
                    {
                        model: RIDER_SHIPPING,
                        attributes: ['min_weight', 'max_weight', 'price', 'city', 'state', 'country'],
                        include: [
                            {
                                model: RIDERS,
                                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                            }
                        ]
                    }
                ]
            }
        ]
    }).then(orders_history => {
        if (!orders_history || orders_history.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Orders History Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Orders History loaded" }, orders_history);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetOrderHistory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS_HISTORY.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload,
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                },
                {
                    model: ORDERS,
                    attributes: ['quantity', 'amount', 'shipping_fee', 'payment_method', 'paid', 'shipped', 'disputed', 'delivery_status', 'createdAt', 'updatedAt'],
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
                        },
                        {
                            model: VENDORS,
                            attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                        },
                        {
                            model: RIDER_SHIPPING,
                            attributes: ['min_weight', 'max_weight', 'price', 'city', 'state', 'country'],
                            include: [
                                {
                                    model: RIDERS,
                                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                                }
                            ]
                        }
                    ]
                }
            ]
        }).then(order_history => {
            if (!order_history || order_history.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Order History Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Order History loaded" }, order_history);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getOrderHistorySpecifically(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS_HISTORY.findAndCountAll({
            attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'updatedAt'] },
            where: {
                user_unique_id,
                ...payload,
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: ORDERS,
                    attributes: ['quantity', 'amount', 'shipping_fee', 'payment_method', 'paid', 'shipped', 'disputed', 'delivery_status', 'createdAt', 'updatedAt'],
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
                        },
                        {
                            model: VENDORS,
                            attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image']
                        },
                        {
                            model: RIDER_SHIPPING,
                            attributes: ['min_weight', 'max_weight', 'price', 'city', 'state', 'country'],
                            include: [
                                {
                                    model: RIDERS,
                                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                                }
                            ]
                        }
                    ]
                }
            ]
        }).then(order_history => {
            if (!order_history || order_history.length == 0) {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Order History Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Order History loaded" }, order_history);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};
