import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, false_status, tag_admin, true_status } from '../config/config.js';
import db from "../models/index.js";

const CARTS = db.carts;
const USERS = db.users;
const VENDORS = db.vendors;
const ADDRESSESS = db.addressess;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const Op = db.Sequelize.Op;

export function rootGetCarts(req, res) {
    CARTS.findAndCountAll({
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
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
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
    }).then(carts => {
        if (!carts || carts.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Carts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Carts loaded" }, carts);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetCartsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        CARTS.findAndCountAll({
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
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
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
        }).then(carts => {
            if (!carts || carts.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Carts Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Carts loaded" }, carts);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetCart(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        CARTS.findOne({
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
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
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
        }).then(cart => {
            if (!cart) {
                NotFoundError(res, { unique_id: tag_admin, text: "Cart not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Cart loaded" }, cart);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUserCarts(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    CARTS.findAndCountAll({
        attributes: { exclude: ['user_unique_id', 'id', 'status', 'createdAt', 'updatedAt'] },
        where: {
            user_unique_id,
            status: default_status
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
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
    }).then(carts => {
        if (!carts || carts.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Carts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Carts loaded" }, carts);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserCart(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        CARTS.findOne({
            attributes: { exclude: ['user_unique_id', 'id', 'status', 'createdAt', 'updatedAt'] },
            where: {
                ...payload,
                user_unique_id,
                status: default_status
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                },
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
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
        }).then(cart => {
            if (!cart) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Cart not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Cart loaded" }, cart);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function addCart(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const address = await ADDRESSESS.findOne({
                    where: {
                        user_unique_id,
                        default_address: true_status,
                        status: default_status
                    },
                    transaction
                });
    
                const product = await PRODUCTS.findOne({
                    where: {
                        unique_id: payload.product_unique_id,
                        vendor_unique_id: payload.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                const rider_shipping = await RIDER_SHIPPING.findOne({
                    where: {
                        unique_id: payload.shipping_fee_unique_id,
                        status: default_status
                    }, 
                    transaction
                });
    
                const existing_cart = await CARTS.findOne({
                    where: {
                        user_unique_id,
                        vendor_unique_id: payload.vendor_unique_id,
                        product_unique_id: payload.product_unique_id,
                        status: default_status
                    }, 
                    transaction
                });
    
                if (address) {
                    if (product.remaining >= payload.quantity) {
                        if (existing_cart) {
                            const new_quantity = existing_cart.quantity + 1;
    
                            const cart = await CARTS.update(
                                {
                                    quantity: new_quantity,
                                }, {
                                    where: {
                                        user_unique_id,
                                        vendor_unique_id: payload.vendor_unique_id,
                                        product_unique_id: payload.product_unique_id,
                                        status: default_status
                                    }, 
                                    transaction
                                }
                            );
    
                            if (cart > 0) {
                                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Cart updated successfully!" });
                            } else {
                                throw new Error("Error updating cart!");
                            }
                        } else {
                            const carts = await CARTS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    ...payload,
                                    shipping_fee_unique_id: rider_shipping ? rider_shipping.unique_id : null,
                                    status: default_status
                                }, { transaction }
                            );
    
                            if (carts) {
                                CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Cart added successfully!" });
                            } else {
                                throw new Error("Error adding cart!");
                            }
                        }
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "Product is out of stock!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Address not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateCart(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const cart = await CARTS.update(
                    {
                        ...payload
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );
    
                if (cart > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Cart updated successfully!" });
                } else {
                    throw new Error("Error updating cart!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function deleteCart(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const cart = await CARTS.destroy(
                    {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (cart > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Cart was deleted successfully!" });
                } else {
                    throw new Error("Error deleting cart!");
                }
            });

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
