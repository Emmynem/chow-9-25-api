import { validationResult, matchedData } from 'express-validator';
import fs from "fs";
import path from 'path';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { 
    access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, 
    tag_admin, user_documents_path, user_rename_document, profile_image_document_name, save_user_document_path, save_document_domain, 
    save_user_document_dir, user_join_path_and_file, user_remove_unwanted_file, user_remove_file, user_documents_path_alt, file_length_5Mb
} from '../config/config.js';
import db from "../models/index.js";

const USERS = db.users;
const USER_ACCOUNT = db.user_account;
const NOTIFICATIONS = db.notifications;
const PRIVATES = db.privates;
const REFERRALS = db.referrals;
const Op = db.Sequelize.Op;

const { existsSync, rmdirSync, rename } = fs;

export function rootGetUsers (req, res) {
    USERS.findAndCountAll({
        attributes: { exclude: ['user_private', 'id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USER_ACCOUNT,
                attributes: ['balance', 'updatedAt']
            }
        ]
    }).then(users => {
        if (!users || users.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Users Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Users loaded" }, users);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetUser (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        USERS.findOne({
            attributes: { exclude: ['user_private', 'id'] },
            where: {
                ...payload
            },
            include: [
                {
                    model: USER_ACCOUNT,
                    attributes: ['balance', 'updatedAt']
                }
            ]
        }).then(user => {
            if (!user) {
                NotFoundError(res, { unique_id: tag_admin, text: "User not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "User loaded" }, user);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootSearchUsers(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        USERS.findAndCountAll({
            attributes: { exclude: ['user_private', 'id'] },
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
                    model: USER_ACCOUNT,
                    attributes: ['balance', 'updatedAt']
                }
            ]
        }).then(users => {
            if (!users || users.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Users Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Users loaded" }, users);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUser (req, res) {
    const user_unique_id = req.UNIQUE_ID;

    USERS.findOne({
        attributes: { exclude: ['user_private', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'id', 'access', 'unique_id', 'method', 'status', 'createdAt', 'updatedAt'] },
        where: {
            unique_id: user_unique_id,
            status: default_status
        },
        include: [
            {
                model: USER_ACCOUNT,
                attributes: ['balance']
            }
        ]
    }).then(user => {
        if (!user) {
            NotFoundError(res, { unique_id: user_unique_id, text: "User not found"}, null);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "User loaded" }, user);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export async function updateUser (req, res) {
    const user_unique_id = req.UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
                    { 
                        ...payload 
                    }, {
                        where: {
                            unique_id: user_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (user > 0) {
                    SuccessResponse(res, { unique_id: user_unique_id, text: "User details updated successfully!" }, null);
                } else {
                    throw new Error("User not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateProfileImage(req, res) {
    const user_unique_id = req.UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        if (req.files !== undefined && req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', user_unique_id, req);
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        if (req.files === undefined || req.files['profile_image'] === undefined) {
            BadRequestError(res, { unique_id: user_unique_id, text: "Profile Image is required" });
        } else {
            if (req.files['profile_image'][0].size > file_length_5Mb) {
                if (req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', user_unique_id, req);
                BadRequestError(res, { unique_id: user_unique_id, text: "File size limit reached (5MB)" });
            } else {
                try {
                    const user = await USERS.findOne({
                        where: {
                            unique_id: user_unique_id,
                            status: default_status
                        }
                    });

                    const profile_image_renamed = user_rename_document(user.firstname, user.lastname, profile_image_document_name, req.files['profile_image'][0].originalname);
                    const saved_profile_image = save_user_document_path + profile_image_renamed;
                    const profile_image_size = req.files['profile_image'][0].size;

                    rename(user_join_path_and_file('profile_image', user_unique_id, req), path.join(user_documents_path_alt(), user_unique_id, profile_image_renamed), async function (err) {
                        if (err) {
                            if (req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', user_unique_id, req);
                            BadRequestError(res, { unique_id: user_unique_id, text: "Error uploading file ..." });
                        } else {
                            await db.sequelize.transaction(async (transaction) => {
                                const profile_image = await USERS.update(
                                    {
                                        profile_image_base_url: save_document_domain,
                                        profile_image_dir: save_user_document_dir,
                                        profile_image: saved_profile_image,
                                        profile_image_file: profile_image_renamed,
                                        profile_image_size,
                                    }, {
                                        where: {
                                            unique_id: user_unique_id,
                                            status: default_status
                                        },
                                        transaction
                                    }
                                );

                                if (profile_image > 0) {
                                    if (user.profile_image_file !== null) user_remove_file(user.profile_image_file, user_unique_id);
                                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: `${user.firstname + (user.middlename !== null ? " " + user.middlename + " " : " ") + user.lastname} Profile Image was updated successfully!` });
                                } else {
                                    throw new Error("Error saving profile image");
                                }
                            });
                        }
                    })
                } catch (err) {
                    if (req.files['profile_image'] !== undefined) user_remove_unwanted_file('profile_image', user_unique_id, req);
                    ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
                }
            }
        }
    }
};

export async function updateUserEmailVerified (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateUserEmailVerified | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
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
    
                if (user > 0) {
                    OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "User email verified successfully!" });
                } else {
                    throw new Error("User email verified already");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserMobileNumberVerified (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateUserMobileNumberVerified | Validation Error Occured", errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
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
    
                if (user > 0) {
                    OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "User mobile number verified successfully!" });
                } else {
                    throw new Error("User mobile number verified already");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAccessGranted (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateUserAccessGranted | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
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
    
                if (user > 0) {
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User's access was granted successfully!" });
                } else {
                    throw new Error("User access already granted");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAccessSuspended (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateUserAccessSuspended | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
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
    
                if (user > 0) {
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User's access was suspended successfully!" });
                } else {
                    throw new Error("User access already suspended");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAccessRevoked (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateUserAccessRevoked | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
                    {
                        access: access_revoked
                    }, {
                        where: {
                            ...payload,
                            access: {
                                [Op.ne] : access_revoked
                            },
                            status: default_status
                        }, 
                        transaction
                    }
                );
                
                if (user > 0) {
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User's access was revoked successfully!" });
                } else {
                    throw new Error("User access already revoked");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeUser (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeUser | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
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
    
                if (user > 0) {
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User removed successfully!" });
                } else {
                    throw new Error("User not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function restoreUser (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | restoreUser | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user = await USERS.update(
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
                
                if (user > 0) {
                    SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "User restored successfully!" });
                } else {
                    throw new Error("User not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeUserPermanently (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeUserPermanently | Validation Error Occured`, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const notifications = await NOTIFICATIONS.destroy({ where: { user_unique_id: payload.unique_id }, transaction });
                const privates = await PRIVATES.destroy({ where: { user_unique_id: payload.unique_id }, transaction });
                const referrals = await REFERRALS.destroy({ where: { user_unique_id: payload.unique_id }, transaction });
                const user_account = await USER_ACCOUNT.destroy({ where: { user_unique_id: payload.unique_id }, transaction });
    
                const affected_rows = notifications + privates + referrals + user_account;
    
                if (affected_rows > 0) {
                    const action_2 = await USERS.destroy({ where: { ...payload }, transaction });
        
                    if (action_2 > 0) {
                        const folder_name = user_documents_path + payload.unique_id;
                        if (existsSync(folder_name)) rmdirSync(folder_name);
                        if (!existsSync(folder_name)) { 
                            logger.info(`User directory deleted successfully [${folder_name}]`)
                            OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `User deleted permanently! ${affected_rows + action_2} rows affected.` })
                        };
                    } else {
                        throw new Error("User not found");
                    }
                } else {
                    const action_2 = await USERS.destroy({ where: { ...payload }, transaction });
    
                    if (action_2 > 0) {
                        const folder_name = user_documents_path + payload.unique_id;
                        if (existsSync(folder_name)) rmdirSync(folder_name);
                        if (!existsSync(folder_name)) {
                            logger.info(`User directory deleted successfully [${folder_name}]`)
                            OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `User deleted permanently! ${action_2} rows affected.` })
                        };
                    } else {
                        throw new Error("User not found");
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};