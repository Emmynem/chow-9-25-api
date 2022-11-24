import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin } from '../config/config.js';
import db from "../models/index.js";

const CATEGORIES = db.categories;
const CATEGORY_IMAGES = db.category_images;
const PRODUCTS = db.products;
const Op = db.Sequelize.Op;

export function rootGetCategories(req, res) {
    CATEGORIES.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(categories => {
        if (!categories || categories.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Categories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Categories loaded" }, categories);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetCategory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        CATEGORIES.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.category_unique_id,
            }
        }).then(category => {
            if (!category) {
                NotFoundError(res, { unique_id: tag_admin, text: "Category not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Category loaded" }, category);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getCategoriesForUsers(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    CATEGORIES.findAndCountAll({
        attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
        where: {
            status: default_status
        },
        order: [
            ['name', 'ASC']
        ]
    }).then(categories => {
        if (!categories || categories.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Categories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Categories loaded" }, categories);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getCategoriesForVendors(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    CATEGORIES.findAndCountAll({
        attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
        where: {
            status: default_status
        },
        order: [
            ['name', 'ASC']
        ]
    }).then(categories => {
        if (!categories || categories.length == 0) {
            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Categories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Categories loaded" }, categories);
        }
    }).catch(err => {
        ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
    });
};

export async function addCategory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const category_name = payload.name;
                const stripped = strip_text(category_name);
    
                const categories = await CATEGORIES.create(
                    {
                        unique_id: uuidv4(),
                        name: category_name,
                        stripped,
                        status: default_status
                    }, { transaction }
                );
    
                if (categories) {
                    CreationSuccessResponse(res, { unique_id: tag_admin, text: "Category created successfully!" });
                } else {
                    throw new Error("Error creating category");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        }
    }
};

export async function updateCategory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                
                const category_name = payload.name;
                const stripped = strip_text(category_name);
    
                const category = await CATEGORIES.update(
                    {
                        name: category_name,
                        stripped,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (category > 0) {
                    OtherSuccessResponse(res, { unique_id: tag_admin, text: "Category was updated successfully!" });
                } else {
                    throw new Error("Error updating category!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        }
    }
};

export async function removeCategory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const category = await CATEGORIES.update(
                    {
                        status: default_delete_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (category > 0) {
                    const products = await PRODUCTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                category_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    const category_images = await CATEGORY_IMAGES.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                category_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    OtherSuccessResponse(res, { unique_id: tag_admin, text: `Category was removed successfully, ${products} product(s) affected!` });
                } else {
                    throw new Error("Error removing category!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        }
    }
};

export async function restoreCategory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const category = await CATEGORIES.update(
                    {
                        status: default_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            status: default_delete_status
                        }, 
                        transaction
                    }
                );
    
                if (category > 0) {
                    const products = await PRODUCTS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                category_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    const category_images = await CATEGORY_IMAGES.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                category_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    OtherSuccessResponse(res, { unique_id: tag_admin, text: `Category was restored successfully, ${products} product(s) affected!` });
                } else {
                    throw new Error("Error restoring category!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        }
    }
};
