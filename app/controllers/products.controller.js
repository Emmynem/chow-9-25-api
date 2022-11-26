import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status, zero } from '../config/config.js';
import db from "../models/index.js";

const PRODUCTS = db.products;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const MENUS = db.menus;
const CATEGORIES = db.categories;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export function rootGetProducts(req, res) {
    PRODUCTS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
            },
            {
                model: VENDOR_USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            },
            {
                model: MENUS,
                attributes: ['name', 'stripped', 'start_time', 'end_time']
            },
            {
                model: CATEGORIES,
                attributes: ['name', 'stripped']
            }
        ]
    }).then(products => {
        if (!products || products.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Products Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Products loaded" }, products);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetProductsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        PRODUCTS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload,
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                },
                {
                    model: VENDOR_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: MENUS,
                    attributes: ['name', 'stripped', 'start_time', 'end_time']
                },
                {
                    model: CATEGORIES,
                    attributes: ['name', 'stripped']
                }
            ]
        }).then(products => {
            if (!products || products.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Products Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Products loaded" }, products);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetProduct(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        PRODUCTS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.product_unique_id,
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                },
                {
                    model: VENDOR_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: MENUS,
                    attributes: ['name', 'stripped', 'start_time', 'end_time']
                },
                {
                    model: CATEGORIES,
                    attributes: ['name', 'stripped']
                }
            ]
        }).then(product => {
            if (!product) {
                NotFoundError(res, { unique_id: tag_admin, text: "Product not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Product loaded" }, product);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getProducts(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        PRODUCTS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id'] },
            where: {
                vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDOR_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                },
                {
                    model: MENUS,
                    attributes: ['name', 'stripped', 'start_time', 'end_time']
                },
                {
                    model: CATEGORIES,
                    attributes: ['name', 'stripped']
                }
            ]
        }).then(products => {
            if (!products || products.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Products Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Products loaded" }, products);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getProduct(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            PRODUCTS.findOne({
                attributes: { exclude: ['vendor_unique_id', 'id'] },
                where: {
                    vendor_unique_id,
                    ...payload,
                    status: default_status
                },
                include: [
                    {
                        model: VENDOR_USERS,
                        attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                    },
                    {
                        model: MENUS,
                        attributes: ['name', 'stripped', 'start_time', 'end_time']
                    },
                    {
                        model: CATEGORIES,
                        attributes: ['name', 'stripped']
                    }
                ]
            }).then(product => {
                if (!product) {
                    NotFoundError(res, { unique_id: vendor_unique_id, text: "Product not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: vendor_unique_id, text: "Product loaded" }, product);
                }
            }).catch(err => {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            });
        }
    }
};

export async function addProduct(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const product_name = payload.name;
                    const stripped = strip_text(product_name);
    
                    const product = await PRODUCTS.create(
                        {
                            unique_id: uuidv4(),
                            vendor_unique_id,
                            vendor_user_unique_id,
                            name: product_name,
                            stripped,
                            ...payload,
                            views: zero,
                            favorites: zero,
                            good_rating: zero,
                            bad_rating: zero,
                            status: default_status
                        }, { transaction }
                    );
    
                    if (product) {
                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Product created successfully!" });
                    } else {
                        throw new Error("Error creating product");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateProductName(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {
                    const product_name = payload.name;
                    const stripped = strip_text(product_name);
    
                    const product = await PRODUCTS.update(
                        {
                            name: product_name,
                            stripped,
                            vendor_user_unique_id,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (product > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Product was updated successfully!" });
                    } else {
                        throw new Error("Error updating product");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateProductOthers(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const product = await PRODUCTS.update(
                        {
                            ...payload,
                            vendor_user_unique_id,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (product > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Product was updated successfully!" });
                    } else {
                        throw new Error("Error updating product");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function removeProduct(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const products = await PRODUCTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (products > 0) {
                        const product_images = await PRODUCT_IMAGES.update(
                            {
                                status: default_delete_status   
                            }, {
                                where: {
                                    product_unique_id: payload.unique_id,
                                    vendor_unique_id
                                },
                                transaction
                            }
                        );
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Product was removed successfully!" });
                    } else {
                        throw new Error("Error removing product");
                    }
                });

            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function restoreProduct(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const products = await PRODUCTS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_delete_status
                            },
                            transaction
                        }
                    );
    
                    if (products > 0) {
                        const product_images = await PRODUCT_IMAGES.update(
                            {
                                status: default_status
                            }, {
                                where: {
                                    product_unique_id: payload.unique_id,
                                    vendor_unique_id
                                },
                                transaction
                            }
                        );
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Product was restored successfully!" });
                    } else {
                        throw new Error("Error restoring product");
                    }
                });

            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};
