import { validationResult, matchedData } from 'express-validator';
import fs from "fs";
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, user_documents_path } from '../config/config.js';
import db from "../models/index.js";

const RIDERS = db.riders;
const RIDER_ACCOUNT = db.rider_account;
const RIDER_BANK_ACCOUNTS = db.rider_bank_accounts;
const RIDER_SHIPPING = db.rider_shipping;
const Op = db.Sequelize.Op;

const { existsSync, rmdirSync } = fs;

export function rootGetRiders(req, res) {
    RIDERS.findAndCountAll({
        attributes: { exclude: ['rider_private', 'id'] },
        order: [
            ['createdAt', 'DESC']
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
    }
    else {
        RIDERS.findOne({
            attributes: { exclude: ['rider_private', 'id'] },
            where: {
                ...payload
            }
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

export function getRider(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    RIDERS.findOne({
        attributes: { exclude: ['rider_private', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'id', 'access'] },
        where: {
            rider_unique_id,
            status: default_status
        }
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
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({ ...payload }, {
                    where: {
                        unique_id: rider_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider details updated successfully!" }, rider);
            } else {
                BadRequestError(res, { unique_id: rider_unique_id, text: "Rider not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderEmailVerified(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "updateRiderEmailVerified | Validation Error Occured", errors.array())
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    email_verification: true_status
                }, {
                    where: {
                        ...payload,
                        email_verification: {
                            [Op.ne]: true_status
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "Rider email verified successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Rider email verified already!" }, null);
            }
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
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    mobile_number_verification: true_status
                }, {
                    where: {
                        ...payload,
                        mobile_number_verification: {
                            [Op.ne]: true_status
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                OtherSuccessResponse(res, { unique_id: payload.unique_id, text: "Rider mobile number verified successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Rider mobile number verified already!" }, null);
            }
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
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    access: access_granted
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne]: access_granted
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                const rider_shipping = await db.sequelize.transaction((t) => {
                    return RIDER_SHIPPING.update({
                        status: default_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider's access was granted successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider access already granted!" }, null);
            }
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
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    access: access_suspended
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne]: access_suspended
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                const rider_shipping = await db.sequelize.transaction((t) => {
                    return RIDER_SHIPPING.update({
                        status: default_delete_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider's access was suspended successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider access already suspended!" }, null);
            }
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
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    access: access_revoked
                }, {
                    where: {
                        ...payload,
                        access: {
                            [Op.ne]: access_revoked
                        },
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                const rider_shipping = await db.sequelize.transaction((t) => {
                    return RIDER_SHIPPING.update({
                        status: default_delete_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider's access was revoked successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider access already revoked!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function verifyRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, "verifyRider | Validation Error Occured", errors.array())
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    verification: true_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                SuccessResponse(res, { unique_id: payload.unique_id, text: "Rider verified successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Rider account is actively verified!" }, null);
            }
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
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    verification: false_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                SuccessResponse(res, { unique_id: payload.unique_id, text: "Rider unverified successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Rider account is actively unverified!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeRider | Validation Error Occured`, errors.array())
    }
    else {
        try {

            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    status: default_delete_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                const rider_account = await db.sequelize.transaction((t) => {
                    return RIDER_ACCOUNT.update({
                        status: default_delete_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const rider_bank_accounts = await db.sequelize.transaction((t) => {
                    return RIDER_BANK_ACCOUNTS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const rider_shipping = await db.sequelize.transaction((t) => {
                    return RIDER_SHIPPING.update({
                        status: default_delete_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider removed successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function restoreRider(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | restoreRider | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const rider = await db.sequelize.transaction((t) => {
                return RIDERS.update({
                    status: default_status
                }, {
                    where: {
                        ...payload,
                        status: default_delete_status
                    }
                }, { transaction: t });
            });

            if (rider > 0) {
                const rider_account = await db.sequelize.transaction((t) => {
                    return RIDER_ACCOUNT.update({
                        status: default_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const rider_bank_accounts = await db.sequelize.transaction((t) => {
                    return RIDER_BANK_ACCOUNTS.update({
                        status: default_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const rider_shipping = await db.sequelize.transaction((t) => {
                    return RIDER_SHIPPING.update({
                        status: default_status
                    }, {
                        where: {
                            rider_unique_id: payload.unique_id
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider restored successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};

export async function removeRiderPermanently(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | removeRiderPermanently | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const rider_account = await db.sequelize.transaction((t) => { return RIDER_ACCOUNT.destroy({ where: { rider_unique_id: payload.unique_id } }, { transaction: t }) });
            const rider_bank_accounts = await db.sequelize.transaction((t) => { return RIDER_BANK_ACCOUNTS.destroy({ where: { rider_unique_id: payload.unique_id } }, { transaction: t }) });
            const rider_shipping = await db.sequelize.transaction((t) => { return RIDER_SHIPPING.destroy({ where: { rider_unique_id: payload.unique_id } }, { transaction: t }) });

            const affected_rows = rider_account + rider_bank_accounts + rider_shipping;

            if (affected_rows > 0) {
                const action_2 = await db.sequelize.transaction((t) => {
                    const riders = RIDERS.destroy({ where: { ...payload } }, { transaction: t })
                    return riders;
                });

                if (action_2 > 0) {
                    const folder_name = user_documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`Rider directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Rider deleted permanently! ${affected_rows + action_2} rows affected.` })
                    };
                } else {
                    BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider not found!" }, null);
                }
            } else {
                const action_2 = await db.sequelize.transaction((t) => {
                    const riders = RIDERS.destroy({ where: { ...payload } }, { transaction: t })
                    return riders;
                });

                if (action_2 > 0) {
                    const folder_name = user_documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`Rider directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Rider deleted permanently! ${action_2} rows affected.` })
                    };
                } else {
                    BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Rider not found!" }, null);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};