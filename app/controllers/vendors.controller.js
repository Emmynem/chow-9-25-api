import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import fs from "fs";
import path from 'path';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { 
    access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, 
    platform_documents_path, platform_rename_document, cover_image_document_name, profile_image_document_name, save_platform_document_path, save_document_domain, 
    save_platform_document_dir, platform_join_path_and_file, platform_remove_unwanted_file, platform_remove_file, platform_documents_path_alt, 
    file_length_5Mb, url_path_without_limits, check_user_route, strip_text, anonymous, super_admin_routes, paginate
} from '../config/config.js';
import db from "../models/index.js";

const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const VENDOR_ADDRESS = db.vendor_address;
const VENDOR_ACCOUNT = db.vendor_account;
const VENDOR_BANK_ACCOUNTS = db.vendor_bank_accounts;
const MENUS = db.menus;
const PRODUCTS = db.products;
const TRANSACTIONS = db.transactions;
const OTPS = db.otps;
const Op = db.Sequelize.Op;

const { existsSync, rmdirSync, rename } = fs;

export async function rootGetVendors(req, res) {
    const total_records = await VENDORS.count();
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    VENDORS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDOR_ACCOUNT,
                attributes: ['balance', 'service_charge', 'updatedAt']
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(vendors => {
        if (!vendors || vendors.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors loaded" }, { ...vendors, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetVendor(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        VENDORS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            include: [
                {
                    model: VENDOR_ACCOUNT,
                    attributes: ['balance', 'service_charge', 'updatedAt']
                }
            ]
        }).then(vendor => {
            if (!vendor) {
                NotFoundError(res, { unique_id: tag_admin, text: "Vendor not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor loaded" }, vendor);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function rootGetVendorsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await VENDORS.count({ where: { ...payload } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        VENDORS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDOR_ACCOUNT,
                    attributes: ['balance', 'service_charge', 'updatedAt']
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(vendors => {
            if (!vendors || vendors.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendors loaded" }, { ...vendors, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function rootSearchVendors(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await VENDORS.count({ 
            where: {
                name: {
                    [Op.or]: {
                        [Op.like]: `%${payload.search}`,
                        [Op.startsWith]: `${payload.search}`,
                        [Op.endsWith]: `${payload.search}`,
                        [Op.substring]: `${payload.search}`,
                    }
                }
            }
        });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        VENDORS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                name: {
                    [Op.or]: {
                        [Op.like]: `%${payload.search}`,
                        [Op.startsWith]: `${payload.search}`,
                        [Op.endsWith]: `${payload.search}`,
                        [Op.substring]: `${payload.search}`,
                    }
                }
            },
            order: [
                ['name', 'ASC'],
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDOR_ACCOUNT,
                    attributes: ['balance', 'service_charge', 'updatedAt']
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(vendors => {
            if (!vendors || vendors.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendors loaded" }, { ...vendors, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function searchVendors(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await VENDORS.count({ 
            where: {
                name: {
                    [Op.or]: {
                        [Op.like]: `%${payload.search}`,
                        [Op.startsWith]: `${payload.search}`,
                        [Op.endsWith]: `${payload.search}`,
                        [Op.substring]: `${payload.search}`,
                    }
                },
                status: default_status
            }
        });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        VENDORS.findAndCountAll({
            attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification'],
            where: {
                name: {
                    [Op.or]: {
                        [Op.like]: `%${payload.search}`,
                        [Op.startsWith]: `${payload.search}`,
                        [Op.endsWith]: `${payload.search}`,
                        [Op.substring]: `${payload.search}`,
                    }
                },
                status: default_status
            },
            order: [
                ['name', 'ASC'],
                ['createdAt', 'DESC']
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(vendors => {
            if (!vendors || vendors.length == 0) {
                SuccessResponse(res, { unique_id: anonymous, text: "Vendors Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: anonymous, text: "Vendors loaded" }, { ...vendors, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: anonymous, text: err.message }, null);
        });
    }
};

export async function getVendor(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (vendor_user_routes.routes === super_admin_routes) {
        VENDORS.findOne({
            attributes: { exclude: ['unique_id', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'cover_image_base_url', 'cover_image_dir', 'cover_image_file', 'cover_image_size', 'id', 'access', 'status', 'createdAt', 'updatedAt'] },
            where: {
                unique_id: vendor_unique_id,
                status: default_status
            },
            include: [
                {
                    model: VENDOR_ACCOUNT,
                    attributes: ['balance', 'service_charge']
                }
            ]
        }).then(vendor => {
            if (!vendor) {
                NotFoundError(res, { unique_id: vendor_unique_id, text: "Vendor not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor loaded" }, vendor);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    } else {
        VENDORS.findOne({
            attributes: { exclude: ['unique_id', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'cover_image_base_url', 'cover_image_dir', 'cover_image_file', 'cover_image_size', 'id', 'access', 'status', 'createdAt', 'updatedAt'] },
            where: {
                unique_id: vendor_unique_id,
                status: default_status
            }
        }).then(vendor => {
            if (!vendor) {
                NotFoundError(res, { unique_id: vendor_unique_id, text: "Vendor not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor loaded" }, vendor);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function updateVendorName(req, res) {
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
                    const name = payload.name;
                    const stripped = strip_text(name);

                    const vendor = await VENDORS.update(
                        {
                            name,
                            stripped,
                        }, {
                            where: {
                                unique_id: vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (vendor > 0) {
                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor details updated successfully!" }, null);
                    } else {
                        throw new Error("Vendor not found");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateVendorOthers(req, res) {
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
                    
                    const vendor = await VENDORS.update(
                        { 
                            ...payload 
                        }, {
                            where: {
                                unique_id: vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
        
                    if (vendor > 0) {
                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor details updated successfully!" }, null);
                    } else {
                        throw new Error("Vendor not found");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateProfileImage(req, res) {
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
        if (req.files !== undefined && req.files['profile_image'] !== undefined) platform_remove_unwanted_file('profile_image', vendor_unique_id, req);
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            if (req.files !== undefined && req.files['profile_image'] !== undefined) platform_remove_unwanted_file('profile_image', vendor_unique_id, req);
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (req.files === undefined || req.files['profile_image'] === undefined) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Profile Image is required" });
            } else {
                if (req.files['profile_image'][0].size > file_length_5Mb) {
                    if (req.files['profile_image'] !== undefined) platform_remove_unwanted_file('profile_image', vendor_unique_id, req);
                    BadRequestError(res, { unique_id: vendor_unique_id, text: "File size limit reached (5MB)" });
                } else {
                    try {
                        const vendor = await VENDORS.findOne({
                            where: {
                                unique_id: vendor_unique_id,
                                status: default_status
                            }
                        });
    
                        const profile_image_renamed = platform_rename_document(vendor.name, profile_image_document_name, req.files['profile_image'][0].originalname);
                        const saved_profile_image = save_platform_document_path + profile_image_renamed;
                        const profile_image_size = req.files['profile_image'][0].size;
    
                        rename(platform_join_path_and_file('profile_image', vendor_unique_id, req), path.join(platform_documents_path_alt(), vendor_unique_id, profile_image_renamed), async function (err) {
                            if (err) {
                                if (req.files['profile_image'] !== undefined) platform_remove_unwanted_file('profile_image', vendor_unique_id, req);
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Error uploading file ..." });
                            } else {
                                await db.sequelize.transaction(async (transaction) => {
                                    const profile_image = await VENDORS.update(
                                        {
                                            profile_image_base_url: save_document_domain,
                                            profile_image_dir: save_platform_document_dir,
                                            profile_image: saved_profile_image,
                                            profile_image_file: profile_image_renamed,
                                            profile_image_size,
                                        }, {
                                            where: {
                                                unique_id: vendor_unique_id,
                                                status: default_status
                                            },
                                            transaction
                                        }
                                    );
    
                                    if (profile_image > 0) {
                                        if (vendor.profile_image_file !== null) platform_remove_file(vendor.profile_image_file, vendor_unique_id);
                                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: `${vendor.name} Profile Image was updated successfully!` });
                                    } else {
                                        throw new Error("Error saving profile image");
                                    }
                                });
                            }
                        })
                    } catch (err) {
                        if (req.files['profile_image'] !== undefined) platform_remove_unwanted_file('profile_image', vendor_unique_id, req);
                        ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                    }
                }
            }
        }
    }
};

export async function updateCoverImage(req, res) {
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
        if (req.files !== undefined && req.files['cover_image'] !== undefined) platform_remove_unwanted_file('cover_image', vendor_unique_id, req);
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            if (req.files !== undefined && req.files['cover_image'] !== undefined) platform_remove_unwanted_file('cover_image', vendor_unique_id, req);
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (req.files === undefined || req.files['cover_image'] === undefined) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Cover Image is required" });
            } else {
                if (req.files['cover_image'][0].size > file_length_5Mb) {
                    if (req.files['cover_image'] !== undefined) platform_remove_unwanted_file('cover_image', vendor_unique_id, req);
                    BadRequestError(res, { unique_id: vendor_unique_id, text: "File size limit reached (5MB)" });
                } else {
                    try {
                        const vendor = await VENDORS.findOne({
                            where: {
                                unique_id: vendor_unique_id,
                                status: default_status
                            }
                        });
    
                        const cover_image_renamed = platform_rename_document(vendor.name, cover_image_document_name, req.files['cover_image'][0].originalname);
                        const saved_cover_image = save_platform_document_path + cover_image_renamed;
                        const cover_image_size = req.files['cover_image'][0].size;
    
                        rename(platform_join_path_and_file('cover_image', vendor_unique_id, req), path.join(platform_documents_path_alt(), vendor_unique_id, cover_image_renamed), async function (err) {
                            if (err) {
                                if (req.files['cover_image'] !== undefined) platform_remove_unwanted_file('cover_image', vendor_unique_id, req);
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Error uploading file ..." });
                            } else {
                                await db.sequelize.transaction(async (transaction) => {
                                    const cover_image = await VENDORS.update(
                                        {
                                            cover_image_base_url: save_document_domain,
                                            cover_image_dir: save_platform_document_dir,
                                            cover_image: saved_cover_image,
                                            cover_image_file: cover_image_renamed,
                                            cover_image_size,
                                        }, {
                                            where: {
                                                unique_id: vendor_unique_id,
                                                status: default_status
                                            },
                                            transaction
                                        }
                                    );
    
                                    if (cover_image > 0) {
                                        if (vendor.cover_image_file !== null) platform_remove_file(vendor.cover_image_file, vendor_unique_id);
                                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: `${vendor.name} Cover Image was updated successfully!` });
                                    } else {
                                        throw new Error("Error saving cover image");
                                    }
                                });
                            }
                        })
                    } catch (err) {
                        if (req.files['cover_image'] !== undefined) platform_remove_unwanted_file('cover_image', vendor_unique_id, req);
                        ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                    }
                }
            }
        }
    }
};

export async function updateVendorAccessGranted(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateVendorAccessGranted | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        access: access_granted
                    }, {
                        where: {
                            ...payload,
                            access: {
                                [Op.ne]: access_granted
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    const vendor_users = await VENDOR_USERS.update(
                        {
                            access: access_granted
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                access: {
                                    [Op.ne]: access_granted
                                },
                                status: default_status
                            }, 
                            transaction
                        }
                    );

                    const menus = await MENUS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            },
                            transaction
                        }
                    );

                    const products = await PRODUCTS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            },
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor's access was granted successfully!" });
                } else {
                    throw new Error("Vendor access already granted");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateVendorAccessSuspended(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateVendorAccessSuspended | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        access: access_suspended
                    }, {
                        where: {
                            ...payload,
                            access: {
                                [Op.ne]: access_suspended
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    const vendor_users = await VENDOR_USERS.update(
                        {
                            access: access_suspended
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                access: {
                                    [Op.ne]: access_suspended
                                },
                                status: default_status
                            }, 
                            transaction
                        }
                    );

                    const menus = await MENUS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    const products = await PRODUCTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor's access was suspended successfully!" });
                } else {
                    throw new Error("Vendor access already suspended");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateVendorAccessRevoked(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateVendorAccessRevoked | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        access: access_revoked
                    }, {
                        where: {
                            ...payload,
                            access: {
                                [Op.ne]: access_revoked
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    const vendor_users = await VENDOR_USERS.update(
                        {
                            access: access_revoked
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                access: {
                                    [Op.ne]: access_revoked
                                },
                                status: default_status
                            }, 
                            transaction
                        }
                    );

                    const menus = await MENUS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    const products = await PRODUCTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor's access was revoked successfully!" });
                } else {
                    throw new Error("Vendor access already revoked");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function verifyVendor(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "verifyVendor | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        verification: true_status
                    }, {
                        where: {
                            ...payload,
                            verification: {
                                [Op.ne]: true_status
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor verified successfully!" });
                } else {
                    throw new Error("Vendor account is actively verified");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function unverifyVendor(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "unverifyVendor | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        verification: false_status
                    }, {
                        where: {
                            ...payload,
                            verification: {
                                [Op.ne]: false_status
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor unverified successfully!" });
                } else {
                    throw new Error("Vendor account is actively unverified");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function proVendorUpgrade(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "proVendorUpgrade | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        pro: true_status,
                        pro_expiring: moment().day(30).toDate()
                    }, {
                        where: {
                            ...payload,
                            pro: {
                                [Op.ne]: true_status
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor upgraded to pro successfully!" });
                } else {
                    throw new Error("Vendor account is actively upgraded");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function proVendorDowngrade(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "proVendorDowngrade | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        pro: false_status,
                        pro_expiring: null
                    }, {
                        where: {
                            ...payload,
                            pro: {
                                [Op.ne]: false_status
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor downgraded from pro successfully!" });
                } else {
                    throw new Error("Vendor account is actively downgraded");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeVendor(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeVendor | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        status: default_delete_status
                    }, {
                        where: {
                            ...payload,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (vendor > 0) {
                    const vendor_users = await VENDOR_USERS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const vendor_account = await VENDOR_ACCOUNT.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const vendor_address = await VENDOR_ADDRESS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const vendor_bank_accounts = await VENDOR_BANK_ACCOUNTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const menus = await MENUS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const products = await PRODUCTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const transactions = await TRANSACTIONS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );

                    if (vendor_users > 0 && vendor_account > 0) {
                        SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor removed successfully!" });
                    } else {
                        throw new Error("Error removing other vendor properties");
                    }
    
                } else {
                    throw new Error("Vendor not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function restoreVendor(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | restoreVendor | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const vendor = await VENDORS.update(
                    {
                        status: default_status
                    }, {
                        where: {
                            ...payload,
                            status: default_delete_status
                        }, 
                        transaction
                    }
                );    

                if (vendor > 0) {
                    const vendor_users = await VENDOR_USERS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const vendor_account = await VENDOR_ACCOUNT.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const vendor_address = await VENDOR_ADDRESS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const vendor_bank_accounts = await VENDOR_BANK_ACCOUNTS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const menus = await MENUS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const products = await PRODUCTS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const transactions = await TRANSACTIONS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                vendor_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );

                    if (vendor_users > 0 && vendor_account > 0) {
                        SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor restored successfully!" });
                    } else {
                        throw new Error("Error restoring other vendor properties");
                    }
                } else {
                    throw new Error("Vendor not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeVendorPermanently(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeVendorPermanently | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const transactions = await TRANSACTIONS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const products = await PRODUCTS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const menus = await MENUS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const otps = await OTPS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const vendor_account = await VENDOR_ACCOUNT.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const vendor_address = await VENDOR_ADDRESS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const vendor_bank_accounts = await VENDOR_BANK_ACCOUNTS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
                const vendor_users = await VENDOR_USERS.destroy({ where: { vendor_unique_id: payload.unique_id }, transaction });
    
                const affected_rows = transactions + products + menus + otps + vendor_address + vendor_bank_accounts + vendor_account + vendor_users;
    
                if (affected_rows > 0) {
                    const action_2 = await VENDORS.destroy({ where: { ...payload }, transaction });
    
                    if (action_2 > 0) {
                        const folder_name = platform_documents_path + payload.unique_id;
                        if (existsSync(folder_name)) rmdirSync(folder_name);
                        if (!existsSync(folder_name)) {
                            logger.info(`Vendor directory deleted successfully [${folder_name}]`)
                            OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Vendor deleted permanently! ${affected_rows + action_2} rows affected.` })
                        };
                    } else {
                        throw new Error("Vendor not found");
                    }
                } else {
                    const action_2 = await VENDORS.destroy({ where: { ...payload }, transaction });
    
                    if (action_2 > 0) {
                        const folder_name = platform_documents_path + payload.unique_id;
                        if (existsSync(folder_name)) rmdirSync(folder_name);
                        if (!existsSync(folder_name)) {
                            logger.info(`Vendor directory deleted successfully [${folder_name}]`)
                            OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Vendor deleted permanently! ${action_2} rows affected.` })
                        };
                    } else {
                        throw new Error("Vendor not found");
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};