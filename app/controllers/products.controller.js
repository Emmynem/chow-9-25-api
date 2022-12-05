import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import path from 'path';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { 
    default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status, zero, strip_text, 
    platform_rename_document, product_image_document_name, save_platform_document_path, save_document_domain, save_platform_document_dir, platform_join_path_and_file, 
    platform_remove_unwanted_file, platform_remove_file, platform_documents_path_alt, file_length_5Mb
} from '../config/config.js';
import db from "../models/index.js";

const PRODUCTS = db.products;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const MENUS = db.menus;
const CATEGORIES = db.categories;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

const { rename } = fs;

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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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
                            remaining: !payload.remaining ? payload.quantity : payload.remaining,
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

export async function addProductImage(req, res) {
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
        if (req.files !== undefined && req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            if (req.files !== undefined && req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (req.files === undefined || req.files['image'] === undefined) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Image is required" });
            } else {
                if (req.files['image'][0].size > file_length_5Mb) {
                    if (req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
                    BadRequestError(res, { unique_id: vendor_unique_id, text: "File size limit reached (5MB)" });
                } else {
                    try {
    
                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: payload.product_unique_id,
                                status: default_status
                            }
                        });
    
                        const image_renamed = platform_rename_document(product.name, product_image_document_name, req.files['image'][0].originalname);
                        const saved_image = save_platform_document_path + image_renamed;
                        const image_size = req.files['image'][0].size;
    
                        rename(platform_join_path_and_file('image', vendor_unique_id, req), path.join(platform_documents_path_alt(), vendor_unique_id, image_renamed), async function (err) {
                            if (err) {
                                if (req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Error uploading file ..." });
                            } else {
                                await db.sequelize.transaction(async (transaction) => {
                                    const product_images = await PRODUCT_IMAGES.create(
                                        {
                                            unique_id: uuidv4(),
                                            product_unique_id: payload.product_unique_id,
                                            image_base_url: save_document_domain,
                                            image_dir: save_platform_document_dir,
                                            image: saved_image,
                                            image_file: image_renamed,
                                            image_size,
                                            status: default_status
                                        }, { transaction }
                                    );
    
                                    if (product_images) {
                                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: `${product.name} Product Image was saved successfully!` });
                                    } else {
                                        throw new Error("Error saving product image");
                                    }
    
                                })
                            }
                        });
                    } catch (err) {
                        if (req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
                        ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                    }
                }
            }
        }
    }
};

export async function editProductImage(req, res) {
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
        if (req.files !== undefined && req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            if (req.files !== undefined && req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (req.files === undefined || req.files['image'] === undefined) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Image is required" });
            } else {
                if (req.files['image'][0].size > file_length_5Mb) {
                    if (req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
                    BadRequestError(res, { unique_id: vendor_unique_id, text: "File size limit reached (5MB)" });
                } else {
                    try {
                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: payload.product_unique_id,
                                status: default_status
                            }
                        });

                        const product_images = await PRODUCT_IMAGES.findOne({
                            where: {
                                unique_id: payload.unique_id,
                                product_unique_id: payload.product_unique_id,
                                status: default_status
                            }
                        });

                        const image_renamed = platform_rename_document(product.name, product_image_document_name, req.files['image'][0].originalname);
                        const saved_image = save_platform_document_path + image_renamed;
                        const image_size = req.files['image'][0].size;

                        rename(platform_join_path_and_file('image', vendor_unique_id, req), path.join(platform_documents_path_alt(), vendor_unique_id, image_renamed), async function (err) {
                            if (err) {
                                if (req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Error uploading file ..." });
                            } else {
                                await db.sequelize.transaction(async (transaction) => {
                                    const product_image = await PRODUCT_IMAGES.update(
                                        {
                                            image_base_url: save_document_domain,
                                            image_dir: save_platform_document_dir,
                                            image: saved_image,
                                            image_file: image_renamed,
                                            image_size,
                                        }, {
                                            where: {
                                                unique_id: payload.unique_id,
                                                product_unique_id: payload.product_unique_id,
                                                status: default_status
                                            },
                                            transaction
                                        }
                                    );

                                    if (product_image > 0) {
                                        if (product_images.image_file !== null) platform_remove_file(product_images.image_file, vendor_unique_id);
                                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: `${product.name} Product Image was updated successfully!` });
                                    } else {
                                        throw new Error("Error saving product image");
                                    }
                                });
                            }
                        })
                    } catch (err) {
                        if (req.files['image'] !== undefined) platform_remove_unwanted_file('image', vendor_unique_id, req);
                        ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                    }
                }
            }
        }
    }
};

export async function deleteProductImage(req, res) {
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
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const product = await PRODUCTS.findOne({
                        where: {
                            unique_id: payload.product_unique_id,
                            status: default_status
                        }, 
                        transaction
                    });
    
                    const product_images = await PRODUCT_IMAGES.findOne({
                        where: {
                            unique_id: payload.unique_id,
                            product_unique_id: payload.product_unique_id,
                            status: default_status
                        }, 
                        transaction
                    });

                    const product_image = await PRODUCT_IMAGES.destroy(
                        {
                            where: {
                                unique_id: payload.unique_id,
                                product_unique_id: payload.product_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (product_image > 0) {
                        if (product_images.image_file !== null) platform_remove_file(product_images.image_file, vendor_unique_id);
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: `${product.name} Product Image was deleted successfully!` });
                    } else {
                        throw new Error("Error deleting product image");
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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
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
