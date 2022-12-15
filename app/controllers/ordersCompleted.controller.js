import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status } from '../config/config.js';
import db from "../models/index.js";

const ORDERS_COMPLETED = db.orders_completed;
const USERS = db.users;
const ORDERS = db.orders;
const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export function rootGetOrdersCompleted(req, res) {
    ORDERS_COMPLETED.findAndCountAll({
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
    }).then(orders_completed => {
        if (!orders_completed || orders_completed.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Orders Completed Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Orders Completed loaded" }, orders_completed);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetOrderCompleted(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS_COMPLETED.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload,
            },
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
        }).then(order_completed => {
            if (!order_completed || order_completed.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Order Completed Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Order Completed loaded" }, order_completed);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetOrdersCompletedSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS_COMPLETED.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
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
        }).then(orders_completed => {
            if (!orders_completed || orders_completed.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Orders Completed Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Orders Completed loaded" }, orders_completed);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getVendorOrdersCompleted(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        ORDERS_COMPLETED.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id', 'createdAt', 'updatedAt'] },
            where: {
                vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'profile_image']
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
        }).then(orders_completed => {
            if (!orders_completed || orders_completed.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Orders Completed Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Orders Completed loaded" }, orders_completed);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export function getRiderOrdersCompleted(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    ORDERS_COMPLETED.findAndCountAll({
        attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
        where: {
            '$rider_shipping.rider_unique_id$': rider_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'profile_image']
            },
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image']
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
                        model: RIDER_SHIPPING,
                        as: 'rider_shipping',
                        required: true,
                        attributes: ['rider_unique_id', 'min_weight', 'max_weight', 'price', 'city', 'state', 'country']
                    }
                ]
            }
        ]
    }).then(orders_completed => {
        if (!orders_completed || orders_completed.length == 0) {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Orders Completed Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Orders Completed loaded" }, orders_completed);
        }
    }).catch(err => {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    });
};

export function getOrdersCompleted(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    
    ORDERS_COMPLETED.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'updatedAt'] },
        where: {
            user_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image']
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
    }).then(orders_completed => {
        if (!orders_completed || orders_completed.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Orders Completed Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Orders Completed loaded" }, orders_completed);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getOrdersCompletedSpecifically(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS_COMPLETED.findAndCountAll({
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
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image']
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
        }).then(orders_completed => {
            if (!orders_completed || orders_completed.length == 0) {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Orders Completed Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Orders Completed loaded" }, orders_completed);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export function getOrderCompleted(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS_COMPLETED.findOne({
            attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'updatedAt'] },
            where: {
                user_unique_id,
                ...payload,
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image']
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
        }).then(order_completed => {
            if (!order_completed) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Order Completed Not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Order Completed loaded" }, order_completed);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};