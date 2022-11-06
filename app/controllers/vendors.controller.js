import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import fs from "fs";
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, platform_documents_path } from '../config/config.js';
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

const { existsSync, rmdirSync } = fs;

export function rootGetVendors(req, res) {
    VENDORS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(vendors => {
        if (!vendors || vendors.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors loaded" }, vendors);
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
    }
    else {
        VENDORS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            }
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

export function getVendor(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;

    VENDORS.findOne({
        attributes: { exclude: ['unique_id', 'profile_image_base_url', 'profile_image_dir', 'profile_image_file', 'profile_image_size', 'cover_image_base_url', 'cover_image_dir', 'cover_image_file', 'cover_image_size', 'id', 'access'] },
        where: {
            vendor_unique_id,
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
};

export async function updateVendor(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({ ...payload }, {
                    where: {
                        unique_id: vendor_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (vendor > 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor details updated successfully!" }, null);
            } else {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Vendor not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function updateVendorAccessGranted(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, `${tag_admin} | updateVendorAccessGranted | Validation Error Occured`, errors.array())
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
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

            if (vendor > 0) {
                const vendor_users = await db.sequelize.transaction((t) => {
                    return VENDOR_USERS.update({
                        access: access_granted
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_granted
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor's access was granted successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor access already granted!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
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

            if (vendor > 0) {
                const vendor_users = await db.sequelize.transaction((t) => {
                    return VENDOR_USERS.update({
                        access: access_suspended
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_suspended
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor's access was suspended successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor access already suspended!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
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

            if (vendor > 0) {
                const vendor_users = await db.sequelize.transaction((t) => {
                    return VENDOR_USERS.update({
                        access: access_revoked
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            access: {
                                [Op.ne]: access_revoked
                            },
                            status: default_status
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor's access was revoked successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor access already revoked!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
                    verification: true_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (vendor > 0) {
                SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor verified successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Vendor account is actively verified!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
                    verification: false_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (vendor > 0) {
                SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor unverified successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Vendor account is actively unverified!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
                    pro: true_status,
                    pro_expiring: moment().day(30).toDate()
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (vendor > 0) {
                SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor upgraded to pro successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Vendor account is actively upgraded!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
                    pro: false_status,
                    pro_expiring: null
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            })

            if (vendor > 0) {
                SuccessResponse(res, { unique_id: payload.unique_id, text: "Vendor downgraded from pro successfully!" });
            } else {
                BadRequestError(res, { unique_id: payload.unique_id, text: "Vendor account is actively downgraded!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
                    status: default_delete_status
                }, {
                    where: {
                        ...payload,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (vendor > 0) {
                const vendor_users = await db.sequelize.transaction((t) => {
                    return VENDOR_USERS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const vendor_account = await db.sequelize.transaction((t) => {
                    return VENDOR_ACCOUNT.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const vendor_address = await db.sequelize.transaction((t) => {
                    return VENDOR_ADDRESS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const vendor_bank_accounts = await db.sequelize.transaction((t) => {
                    return VENDOR_BANK_ACCOUNTS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const menus = await db.sequelize.transaction((t) => {
                    return MENUS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const products = await db.sequelize.transaction((t) => {
                    return PRODUCTS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                const transactions = await db.sequelize.transaction((t) => {
                    return TRANSACTIONS.update({
                        status: default_delete_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor removed successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor not found!" }, null);
            }
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
    }
    else {
        try {
            const vendor = await db.sequelize.transaction((t) => {
                return VENDORS.update({
                    status: default_status
                }, {
                    where: {
                        ...payload,
                        status: default_delete_status
                    }
                }, { transaction: t });
            })

            if (vendor > 0) {
                const vendor_users = await db.sequelize.transaction((t) => {
                    return VENDOR_USERS.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const vendor_account = await db.sequelize.transaction((t) => {
                    return VENDOR_ACCOUNT.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const vendor_address = await db.sequelize.transaction((t) => {
                    return VENDOR_ADDRESS.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const vendor_bank_accounts = await db.sequelize.transaction((t) => {
                    return VENDOR_BANK_ACCOUNTS.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const menus = await db.sequelize.transaction((t) => {
                    return MENUS.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const products = await db.sequelize.transaction((t) => {
                    return PRODUCTS.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                const transactions = await db.sequelize.transaction((t) => {
                    return TRANSACTIONS.update({
                        status: default_status
                    }, {
                        where: {
                            vendor_unique_id: payload.unique_id,
                            status: default_delete_status
                        }
                    }, { transaction: t });
                });

                SuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor restored successfully!" });
            } else {
                BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor not found!" }, null);
            }
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
    }
    else {
        try {
            const transactions = await db.sequelize.transaction((t) => { return TRANSACTIONS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const products = await db.sequelize.transaction((t) => { return PRODUCTS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const menus = await db.sequelize.transaction((t) => { return MENUS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const otps = await db.sequelize.transaction((t) => { return OTPS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const vendor_account = await db.sequelize.transaction((t) => { return VENDOR_ACCOUNT.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const vendor_address = await db.sequelize.transaction((t) => { return VENDOR_ADDRESS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const vendor_bank_accounts = await db.sequelize.transaction((t) => { return VENDOR_BANK_ACCOUNTS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });
            const vendor_users = await db.sequelize.transaction((t) => { return VENDOR_USERS.destroy({ where: { vendor_unique_id: payload.unique_id } }, { transaction: t }) });

            const affected_rows = transactions + products + menus + otps + vendor_address + vendor_bank_accounts + vendor_account + vendor_users;

            if (affected_rows > 0) {
                const action_2 = await db.sequelize.transaction((t) => {
                    const vendors = VENDORS.destroy({ where: { ...payload } }, { transaction: t })
                    return vendors;
                });

                if (action_2 > 0) {
                    const folder_name = platform_documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`Vendor directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Vendor deleted permanently! ${affected_rows + action_2} rows affected.` })
                    };
                } else {
                    BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor not found!" }, null);
                }
            } else {
                const action_2 = await db.sequelize.transaction((t) => {
                    const vendors = VENDORS.destroy({ where: { ...payload } }, { transaction: t })
                    return vendors;
                });

                if (action_2 > 0) {
                    const folder_name = platform_documents_path + payload.unique_id;
                    if (existsSync(folder_name)) rmdirSync(folder_name);
                    if (!existsSync(folder_name)) {
                        logger.info(`Vendor directory deleted successfully [${folder_name}]`)
                        OtherSuccessResponse(res, { unique_id: tag_admin + " | " + payload.unique_id, text: `Vendor deleted permanently! ${action_2} rows affected.` })
                    };
                } else {
                    BadRequestError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: "Vendor not found!" }, null);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_admin + " | " + payload.unique_id, text: err.message }, null);
        }
    }
};