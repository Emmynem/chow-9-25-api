import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status } from '../config/config.js';
import db from "../models/index.js";

const DISPUTES = db.disputes;
const USERS = db.users;
const ORDERS = db.orders;
const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const VENDORS = db.vendors;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export function rootGetDisputes(req, res) {
    DISPUTES.findAndCountAll({
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
                        attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
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
    }).then(disputes => {
        if (!disputes || disputes.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Disputes Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Disputes loaded" }, disputes);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetDispute(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        DISPUTES.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.dispute_unique_id,
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
                            attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
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
        }).then(dispute => {
            if (!dispute) {
                NotFoundError(res, { unique_id: tag_admin, text: "Dispute not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Dispute loaded" }, dispute);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetDisputesSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        DISPUTES.findAndCountAll({
            attributes: { exclude: ['id'] },
            where : {
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
                            attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
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
        }).then(disputes => {
            if (!disputes || disputes.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Disputes Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Disputes loaded" }, disputes);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getDisputes(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    DISPUTES.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt', 'updatedAt'] },
        where: {
            user_unique_id
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
                        attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
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
    }).then(disputes => {
        if (!disputes || disputes.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Disputes Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Disputes loaded" }, disputes);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getDisputesSpecifically(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        DISPUTES.findAndCountAll({
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
                            attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
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
        }).then(disputes => {
            if (!disputes || disputes.length == 0) {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Disputes Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Disputes loaded" }, disputes);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export function getDispute(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        DISPUTES.findOne({
            attributes: { exclude: ['id'] },
            where: {
                user_unique_id,
                ...payload,
            },
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
                            attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
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
        }).then(dispute => {
            if (!dispute) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Dispute not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Dispute loaded" }, dispute);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};