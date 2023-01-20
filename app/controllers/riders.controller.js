import { validationResult, matchedData } from 'express-validator';
import fs from "fs";
import path from 'path';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { 
    access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, 
    tag_admin, user_documents_path, user_rename_document, profile_image_document_name, save_user_document_path, save_document_domain,
    save_user_document_dir, user_join_path_and_file, user_remove_unwanted_file, user_remove_file, user_documents_path_alt, file_length_5Mb,
    super_admin_routes, url_path_without_limits, check_user_route
} from '../config/config.js';
import db from "../models/index.js";

const RIDERS = db.riders;
const RIDER_ACCOUNT = db.rider_account;
const RIDER_BANK_ACCOUNTS = db.rider_bank_accounts;
const RIDER_SHIPPING = db.rider_shipping;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

const { existsSync, rmdirSync, rename } = fs;

export function rootGetRiders(req, res) {
    RIDERS.findAndCountAll({
        attributes: { exclude: ['rider_private', 'id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
            },
            {
                model: RIDER_ACCOUNT,
                attributes: ['balance', 'service_charge', 'updatedAt']
            }
        ]
    }).then(riders => {
        if (!riders || riders.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders loaded" }, riders);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDERS.findOne({
            attributes: { exclude: ['rider_private', 'id'] },
            where: {
                ...payload
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
                },
                {
                    model: RIDER_ACCOUNT,
                    attributes: ['balance', 'service_charge', 'updatedAt']
                }
            ]
        }).then(rider => {
            if (!rider) {
                NotFoundError(res, { unique_id: tag_admin, text: "Rider not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Rider loaded" }, rider);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootSearchRiders(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDERS.findAndCountAll({
            attributes: { exclude: ['rider_private', 'id'] },
            where: {
                [Op.or]: [
                    {
                        firstname: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    },
                    {
                        lastname: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    },
                    {
                        middlename: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    },
                    {
                        email: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    },
                    {
                        mobile_number: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    },
                    {
                        gender: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    },
                    {
                        dob: {
                            [Op.or]: {
                                [Op.like]: `%${payload.search}`,
                                [Op.startsWith]: `${payload.search}`,
                                [Op.endsWith]: `${payload.search}`,
                                [Op.substring]: `${payload.search}`,
                            }
                        }
                    }
                ]
            },
            order: [
                ['firstname', 'ASC'],
                ['lastname', 'ASC'],
                ['middlename', 'ASC'],
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
                },
                {
                    model: RIDER_ACCOUNT,
                    attributes: ['balance', 'service_charge', 'updatedAt']
                }
            ]
        }).then(riders => {
            if (!riders || riders.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Riders Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Riders loaded" }, riders);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getVendorRiders(req, res) {
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
        RIDERS.findAndCountAll({
            attributes: { exclude: ['rider_private', 'id', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'method'] },
            where: {
                vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(riders => {
            if (!riders || riders.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Riders Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Riders loaded" }, riders);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getVendorRider(req, res) {
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
            RIDERS.findOne({
                attributes: { exclude: ['rider_private', 'id', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'method'] },
                where: {
                    vendor_unique_id,
                    ...payload
                },
                include: [
                    {
                        model: RIDER_ACCOUNT,
                        attributes: ['balance', 'service_charge', 'updatedAt']
                    }
                ]
            }).then(rider => {
                if (!rider) {
                    NotFoundError(res, { unique_id: vendor_unique_id, text: "Rider not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider loaded" }, rider);
                }
            }).catch(err => {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            });
        }
    }
};

export function getRider(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    RIDERS.findOne({
        attributes: { exclude: ['rider_private', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'id', 'unique_id', 'method', 'access', 'status', 'createdAt', 'updatedAt'] },
        where: {
            unique_id: rider_unique_id,
            status: default_status
        },
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'profile_image', 'cover_image', 'verification']
            },
            {
                model: RIDER_ACCOUNT,
                attributes: ['balance', 'service_charge']
            }
        ]
    }).then(rider => {
        if (!rider) {
            NotFoundError(res, { unique_id: rider_unique_id, text: "Rider not found" }, null);
        } else {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider loaded" }, rider);
        }
    }).catch(err => {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    });
};

export async function updateRider(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const rider = await RIDERS.update(
                    { 
                        ...payload 
                    }, {
                        where: {
                            unique_id: rider_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider > 0) {
                    SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider details updated successfully!" }, null);
                } else {
                    throw new Error("Rider not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateProfileImage(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        if (req.files !== undefined && req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', rider_unique_id, req);
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        if (req.files === undefined || req.files['profile_image'] === undefined) {
            BadRequestError(res, { unique_id: rider_unique_id, text: "Profile Image is required" });
        } else {
            if (req.files['profile_image'][0].size > file_length_5Mb) {
                if (req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', rider_unique_id, req);
                BadRequestError(res, { unique_id: rider_unique_id, text: "File size limit reached (5MB)" });
            } else {
                try {
                    const rider = await RIDERS.findOne({
                        where: {
                            unique_id: rider_unique_id,
                            status: default_status
                        }
                    });

                    const profile_image_renamed = user_rename_document(rider.firstname, rider.lastname, profile_image_document_name, req.files['profile_image'][0].originalname);
                    const saved_profile_image = save_user_document_path + profile_image_renamed;
                    const profile_image_size = req.files['profile_image'][0].size;

                    rename(user_join_path_and_file('profile_image', rider_unique_id, req), path.join(user_documents_path_alt(), rider_unique_id, profile_image_renamed), async function (err) {
                        if (err) {
                            if (req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', rider_unique_id, req);
                            BadRequestError(res, { unique_id: rider_unique_id, text: "Error uploading file ..." });
                        } else {
                            await db.sequelize.transaction(async (transaction) => {
                                const profile_image = await RIDERS.update(
                                    {
                                        profile_image_base_url: save_document_domain,
                                        profile_image_dir: save_user_document_dir,
                                        profile_image: saved_profile_image,
                                        profile_image_file: profile_image_renamed,
                                        profile_image_size,
                                    }, {
                                        where: {
                                            unique_id: rider_unique_id,
                                            status: default_status
                                        },
                                        transaction
                                    }
                                );

                                if (profile_image > 0) {
                                    if (rider.profile_image_file !== null) user_remove_file(rider.profile_image_file, rider_unique_id);
                                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: `${rider.firstname + (rider.middlename !== null ? " " + rider.middlename + " " : " ") + rider.lastname} Profile Image was updated successfully!` });
                                } else {
                                    throw new Error("Error saving profile image");
                                }
                            });
                        }
                    })
                } catch (err) {
                    if (req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', rider_unique_id, req);
                    ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
                }
            }
        }
    }
};

export async function changeRiderAvailability(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID || payload.unique_id || '';
    
    try {
        await db.sequelize.transaction(async (transaction) => {

            const rider_availability = await RIDERS.findOne({
                where: {
                    unique_id: rider_unique_id,
                    status: default_status
                }, 
                transaction
            });

            const rider = await RIDERS.update(
                { 
                    availability: rider_availability.availability ? false_status : true_status
                }, {
                    where: {
                        unique_id: rider_unique_id,
                        status: default_status
                    }, 
                    transaction
                }
            );

            if (rider > 0) {
                SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider availability updated successfully!" }, rider);
            } else {
                throw new Error("Rider not found");
            }
        });
    } catch (err) {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    }
};

export async function updateRiderEmailVerified(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateRiderEmailVerified | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                
                const rider = await RIDERS.update(
                    {
                        email_verification: true_status
                    }, {
                        where: {
                            ...payload,
                            email_verification: {
                                [Op.ne]: true_status
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider > 0) {
                    OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "Rider email verified successfully!" });
                } else {
                    throw new Error("Rider email verified already");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderMobileNumberVerified(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateRiderMobileNumberVerified | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                
                const rider = await RIDERS.update(
                    {
                        mobile_number_verification: true_status
                    }, {
                        where: {
                            ...payload,
                            mobile_number_verification: {
                                [Op.ne]: true_status
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider > 0) {
                    OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "Rider mobile number verified successfully!" });
                } else {
                    throw new Error("Rider mobile number verified already");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderAccessGranted(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateRiderAccessGranted | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
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
    
                if (rider > 0) {
                    const rider_shipping = await RIDER_SHIPPING.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider's access was granted successfully!" });
                } else {
                    throw new Error("Rider access already granted");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderAccessSuspended(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateRiderAccessSuspended | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
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
    
                if (rider > 0) {
                    const rider_shipping = await RIDER_SHIPPING.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider's access was suspended successfully!" });
                } else {
                    throw new Error("Rider access already suspended");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderAccessRevoked(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateRiderAccessRevoked | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
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
    
                if (rider > 0) {
                    const rider_shipping = await RIDER_SHIPPING.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider's access was revoked successfully!" });
                } else {
                    throw new Error("Rider access already revoked");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderAccessGrantedViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            access: access_granted
                        }, {
                            where: {
                                ...payload,
                                vendor_unique_id,
                                access: {
                                    [Op.ne]: access_granted
                                },
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        const rider_shipping = await RIDER_SHIPPING.update(
                            {
                                status: default_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id
                                },
                                transaction
                            }
                        );

                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider's access was granted successfully!" });
                    } else {
                        throw new Error("Rider access already granted");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateRiderAccessSuspendedViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            access: access_suspended
                        }, {
                            where: {
                                ...payload,
                                vendor_unique_id,
                                access: {
                                    [Op.ne]: access_suspended
                                },
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        const rider_shipping = await RIDER_SHIPPING.update(
                            {
                                status: default_delete_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id
                                },
                                transaction
                            }
                        );

                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider's access was suspended successfully!" });
                    } else {
                        throw new Error("Rider access already suspended");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateRiderAccessRevokedViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            access: access_revoked
                        }, {
                            where: {
                                ...payload,
                                vendor_unique_id,
                                access: {
                                    [Op.ne]: access_revoked
                                },
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        const rider_shipping = await RIDER_SHIPPING.update(
                            {
                                status: default_delete_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id
                                },
                                transaction
                            }
                        );

                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider's access was revoked successfully!" });
                    } else {
                        throw new Error("Rider access already revoked");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function verifyRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "verifyRider | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
                    {
                        verification: true_status
                    }, {
                        where: {
                            ...payload,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider > 0) {
                    SuccessResponse(res, { unique_id: payload.unique_id, text: "Rider verified successfully!" });
                } else {
                    throw new Error("Rider account is actively verified");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function unverifyRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "unverifyRider | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
                    {
                        verification: false_status
                    }, {
                        where: {
                            ...payload,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider > 0) {
                    SuccessResponse(res, { unique_id: payload.unique_id, text: "Rider unverified successfully!" });
                } else {
                    throw new Error("Rider account is actively unverified");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function verifyRiderViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            verification: true_status
                        }, {
                            where: {
                                vendor_unique_id,
                                ...payload,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider verified successfully!" });
                    } else {
                        throw new Error("Rider account is actively verified");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function unverifyRiderViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            verification: false_status
                        }, {
                            where: {
                                ...payload,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider unverified successfully!" });
                    } else {
                        throw new Error("Rider account is actively unverified");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function removeRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeRider | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
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
    
                if (rider > 0) {
                    const rider_account = await RIDER_ACCOUNT.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    const rider_shipping = await RIDER_SHIPPING.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider removed successfully!" });
                } else {
                    throw new Error("Rider not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeRiderViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                ...payload,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        const rider_account = await RIDER_ACCOUNT.update(
                            {
                                status: default_delete_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id,
                                    status: default_status
                                },
                                transaction
                            }
                        );

                        const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.update(
                            {
                                status: default_delete_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id,
                                    status: default_status
                                },
                                transaction
                            }
                        );

                        const rider_shipping = await RIDER_SHIPPING.update(
                            {
                                status: default_delete_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id
                                },
                                transaction
                            }
                        );

                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider removed successfully!" });
                    } else {
                        throw new Error("Rider not found");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function restoreRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | restoreRider | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider = await RIDERS.update(
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
    
                if (rider > 0) {
                    const rider_account = await RIDER_ACCOUNT.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    const rider_shipping = await RIDER_SHIPPING.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                rider_unique_id: payload.unique_id
                            }, 
                            transaction
                        }
                    );
    
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider restored successfully!" });
                } else {
                    throw new Error("Rider not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function restoreRiderViaVendor(req, res) {
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

                    const rider = await RIDERS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                ...payload,
                                vendor_unique_id,
                                status: default_delete_status
                            },
                            transaction
                        }
                    );

                    if (rider > 0) {
                        const rider_account = await RIDER_ACCOUNT.update(
                            {
                                status: default_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id,
                                    status: default_delete_status
                                },
                                transaction
                            }
                        );

                        const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.update(
                            {
                                status: default_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id,
                                    status: default_delete_status
                                },
                                transaction
                            }
                        );

                        const rider_shipping = await RIDER_SHIPPING.update(
                            {
                                status: default_status
                            }, {
                                where: {
                                    rider_unique_id: payload.unique_id
                                },
                                transaction
                            }
                        );

                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Rider restored successfully!" });
                    } else {
                        throw new Error("Rider not found");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function removeRiderPermanently(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeRiderPermanently | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider_account = await RIDER_ACCOUNT.destroy({ where: { rider_unique_id: payload.unique_id }, transaction });
                const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.destroy({ where: { rider_unique_id: payload.unique_id }, transaction });
                const rider_shipping = await RIDER_SHIPPING.destroy({ where: { rider_unique_id: payload.unique_id }, transaction });
    
                const affected_rows = rider_account + rider_bank_accounts + rider_shipping;
    
                if (affected_rows > 0) {
                    const action_2 = await RIDERS.destroy({ where: { ...payload }, transaction });
    
                    if (action_2 > 0) {
                        const folder_name = user_documents_path + payload.unique_id;
                        if (existsSync(folder_name)) rmdirSync(folder_name);
                        if (!existsSync(folder_name)) {
                            logger.info(`Rider directory deleted successfully [${folder_name}]`)
                            OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Rider deleted permanently! ${affected_rows + action_2} rows affected.` })
                        };
                    } else {
                        throw new Error("Rider not found");
                    }
                } else {
                    const action_2 = await RIDERS.destroy({ where: { ...payload }, transaction });
    
                    if (action_2 > 0) {
                        const folder_name = user_documents_path + payload.unique_id;
                        if (existsSync(folder_name)) rmdirSync(folder_name);
                        if (!existsSync(folder_name)) {
                            logger.info(`Rider directory deleted successfully [${folder_name}]`)
                            OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Rider deleted permanently! ${action_2} rows affected.` })
                        };
                    } else {
                        throw new Error("Rider not found");
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeRiderPermanentlyViaVendor(req, res) {
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

                    const rider_account = await RIDER_ACCOUNT.destroy({ where: { rider_unique_id: payload.unique_id }, transaction });
                    const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.destroy({ where: { rider_unique_id: payload.unique_id }, transaction });
                    const rider_shipping = await RIDER_SHIPPING.destroy({ where: { rider_unique_id: payload.unique_id }, transaction });

                    const affected_rows = rider_account + rider_bank_accounts + rider_shipping;

                    if (affected_rows > 0) {
                        const action_2 = await RIDERS.destroy({ where: { ...payload, vendor_unique_id }, transaction });

                        if (action_2 > 0) {
                            const folder_name = user_documents_path + payload.unique_id;
                            if (existsSync(folder_name)) rmdirSync(folder_name);
                            if (!existsSync(folder_name)) {
                                logger.info(`Rider directory deleted successfully [${folder_name}]`)
                                OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: `Rider deleted permanently! ${affected_rows + action_2} rows affected.` })
                            };
                        } else {
                            throw new Error("Rider not found");
                        }
                    } else {
                        const action_2 = await RIDERS.destroy({ where: { ...payload, vendor_unique_id }, transaction });

                        if (action_2 > 0) {
                            const folder_name = user_documents_path + payload.unique_id;
                            if (existsSync(folder_name)) rmdirSync(folder_name);
                            if (!existsSync(folder_name)) {
                                logger.info(`Rider directory deleted successfully [${folder_name}]`)
                                OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: `Rider deleted permanently! ${action_2} rows affected.` })
                            };
                        } else {
                            throw new Error("Rider not found");
                        }
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};