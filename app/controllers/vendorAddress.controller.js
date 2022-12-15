import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route } from '../config/config.js';
import db from "../models/index.js";

const VENDOR_ADDRESS = db.vendor_address;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

export function rootGetVendorsAddress(req, res) {
    VENDOR_ADDRESS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
            }
        ]
    }).then(vendors_address => {
        if (!vendors_address || vendors_address.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Address Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Address loaded" }, vendors_address);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetVendorsAddressSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        VENDOR_ADDRESS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                }
            ]
        }).then(vendors_address => {
            if (!vendors_address || vendors_address.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Address Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Address loaded" }, vendors_address);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getVendorAddress(req, res) {
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
        VENDOR_ADDRESS.findOne({
            attributes: { exclude: ['vendor_unique_id', 'id'] },
            where: {
                vendor_unique_id
            }
        }).then(vendor_address => {
            if (!vendor_address) {
                NotFoundError(res, { unique_id: vendor_unique_id, text: "Address not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Address loaded" }, vendor_address);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function addVendorAddress(req, res) {
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
                    
                    const vendor_address = await VENDOR_ADDRESS.create(
                        {
                            unique_id: uuidv4(),
                            vendor_unique_id,
                            ...payload,
                            status: default_status
                        }, { transaction }
                    );
        
                    if (vendor_address) {
                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Address created successfully!" });
                    } else {
                        throw new Error("Error creating address");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateVendorAddress(req, res) {
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

                    const vendor_address = await VENDOR_ADDRESS.update(
                        {
                            ...payload
                        }, {
                            where: {
                                // unique_id: payload.unique_id, // No need for this for now
                                vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
        
                    if (vendor_address > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Address was updated successfully!" });
                    } else {
                        throw new Error("Error updating address details");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};
