import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import path from 'path';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { 
    default_delete_status, default_status, tag_admin, image_rename_document, category_image_document_name, save_image_document_path,
    save_document_domain, save_image_dir, image_join_path_and_file, image_remove_unwanted_file, image_remove_file, image_documents_path_alt, 
    strip_text, file_length_5Mb, anonymous
} from '../config/config.js';
import db from "../models/index.js";

const CATEGORIES = db.categories;
const CATEGORY_IMAGES = db.category_images;
const PRODUCTS = db.products;
const Op = db.Sequelize.Op;

const { rename } = fs;

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
            SuccessResponse(res, { unique_id: user_unique_id || anonymous, text: "Categories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id || anonymous, text: "Categories loaded" }, categories);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id || anonymous, text: err.message }, null);
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

export async function addCategoryImage(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        if (req.files !== undefined && req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        if (req.files === undefined || req.files['image'] === undefined) {
            BadRequestError(res, { unique_id: tag_admin, text: "Image is required" });
        } else {
            if (req.files['image'][0].size > file_length_5Mb) {
                if (req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
                BadRequestError(res, { unique_id: tag_admin, text: "File size limit reached (5MB)" });
            } else {
                try {

                    const category = await CATEGORIES.findOne({
                        where: {
                            unique_id: payload.category_unique_id,
                            status: default_status
                        }
                    });

                    const image_renamed = image_rename_document(category.name, category_image_document_name, req.files['image'][0].originalname);
                    const saved_image = save_image_document_path + image_renamed;
                    const image_size = req.files['image'][0].size;

                    rename(image_join_path_and_file('image', req), path.join(image_documents_path_alt(), image_renamed), async function (err) {
                        if (err) {
                            if (req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
                            BadRequestError(res, { unique_id: tag_admin, text: "Error uploading file ..." });
                        } else {
                            await db.sequelize.transaction(async (transaction) => {
                                const category_images = await CATEGORY_IMAGES.create(
                                    {
                                        unique_id: uuidv4(),
                                        category_unique_id: payload.category_unique_id,
                                        image_base_url: save_document_domain,
                                        image_dir: save_image_dir,
                                        image: saved_image,
                                        image_file: image_renamed,
                                        image_size,
                                        status: default_status
                                    }, { transaction }
                                );

                                if (category_images) {
                                    CreationSuccessResponse(res, { unique_id: tag_admin, text: `${category.name} Category Image was saved successfully!` });
                                } else {
                                    throw new Error("Error saving category image");
                                }

                            })
                        }
                    });
                } catch (err) {
                    if (req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
                    ServerError(res, { unique_id: tag_admin, text: err.message }, null);
                }
            }
        }
    }
};

export async function editCategoryImage(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        if (req.files !== undefined && req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        if (req.files === undefined || req.files['image'] === undefined) {
            BadRequestError(res, { unique_id: tag_admin, text: "Image is required" });
        } else {
            if (req.files['image'][0].size > file_length_5Mb) {
                if (req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
                BadRequestError(res, { unique_id: tag_admin, text: "File size limit reached (5MB)" });
            } else {
                try {
                    const category = await CATEGORIES.findOne({
                        where: {
                            unique_id: payload.category_unique_id,
                            status: default_status
                        }
                    });

                    const category_images = await CATEGORY_IMAGES.findOne({
                        where: {
                            unique_id: payload.unique_id,
                            category_unique_id: payload.category_unique_id,
                            status: default_status
                        }
                    });

                    const image_renamed = image_rename_document(category.name, category_image_document_name, req.files['image'][0].originalname);
                    const saved_image = save_image_document_path + image_renamed;
                    const image_size = req.files['image'][0].size;

                    rename(image_join_path_and_file('image', req), path.join(image_documents_path_alt(), image_renamed), async function (err) {
                        if (err) { 
                            if (req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
                            BadRequestError(res, { unique_id: tag_admin, text: "Error uploading file ..." });
                        } else {
                            await db.sequelize.transaction(async (transaction) => {
                                const category_image = await CATEGORY_IMAGES.update(
                                    {
                                        image_base_url: save_document_domain,
                                        image_dir: save_image_dir,
                                        image: saved_image,
                                        image_file: image_renamed,
                                        image_size,
                                    }, {
                                        where: {
                                            unique_id: payload.unique_id,
                                            category_unique_id: payload.category_unique_id,
                                            status: default_status
                                        },
                                        transaction
                                    }
                                );
        
                                if (category_image > 0) {
                                    if (category_images.image_file !== null) image_remove_file(category_images.image_file);
                                    OtherSuccessResponse(res, { unique_id: tag_admin, text: `${category.name} Category Image was updated successfully!` });
                                } else {
                                    throw new Error("Error saving category image");
                                }
                            });
                        }
                    })
                } catch (err) {
                    if (req.files['image'] !== undefined) image_remove_unwanted_file('image', req);
                    ServerError(res, { unique_id: tag_admin, text: err.message }, null);
                }
            }
        }
    }
};

export async function deleteCategoryImage(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const category = await CATEGORIES.findOne({
                    where: {
                        unique_id: payload.category_unique_id,
                        status: default_status
                    }, 
                    transaction
                });
    
                const category_images = await CATEGORY_IMAGES.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        category_unique_id: payload.category_unique_id,
                        status: default_status
                    }, 
                    transaction
                });

                const category_image = await CATEGORY_IMAGES.destroy(
                    {
                        where: {
                            unique_id: payload.unique_id,
                            category_unique_id: payload.category_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );

                if (category_image > 0) {
                    if (category_images.image_file !== null) image_remove_file(category_images.image_file);
                    OtherSuccessResponse(res, { unique_id: tag_admin, text: `${category.name} Category Image was deleted successfully!` });
                } else {
                    throw new Error("Error deleting category image");
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
