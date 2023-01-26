import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status, paginate } from '../config/config.js';
import db from "../models/index.js";

const VENDOR_BANK_ACCOUNTS = db.vendor_bank_accounts;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

export async function rootGetVendorsBankAccounts(req, res) {
    const total_records = await VENDOR_BANK_ACCOUNTS.count();
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    VENDOR_BANK_ACCOUNTS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(vendors_bank_accounts => {
        if (!vendors_bank_accounts || vendors_bank_accounts.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Bank Accounts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Bank Accounts loaded" }, { ...vendors_bank_accounts, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export async function rootGetVendorsBankAccountsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await VENDOR_BANK_ACCOUNTS.count({ where: { ...payload } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        VENDOR_BANK_ACCOUNTS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(vendors_bank_accounts => {
            if (!vendors_bank_accounts || vendors_bank_accounts.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Bank Accounts Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Bank Accounts loaded" }, { ...vendors_bank_accounts, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function rootGetDefaultVendorsBankAccounts(req, res) {
    const total_records = await VENDOR_BANK_ACCOUNTS.count({ where: { default_bank: true_status } });
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    VENDOR_BANK_ACCOUNTS.findAndCountAll({
        attributes: { exclude: ['id'] },
        where: {
            default_bank: true_status
        },
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(vendors_bank_accounts => {
        if (!vendors_bank_accounts || vendors_bank_accounts.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Bank Accounts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendors Bank Accounts loaded" }, { ...vendors_bank_accounts, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export async function getVendorBankAccounts(req, res) {
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
        const total_records = await VENDOR_BANK_ACCOUNTS.count({ where: { vendor_unique_id } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        VENDOR_BANK_ACCOUNTS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id'] },
            where: {
                vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(vendor_bank_accounts => {
            if (!vendor_bank_accounts || vendor_bank_accounts.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Bank Accounts Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Bank Accounts loaded" }, { ...vendor_bank_accounts, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getVendorDefaultBankAccount(req, res) {
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
        VENDOR_BANK_ACCOUNTS.findOne({
            attributes: { exclude: ['vendor_unique_id', 'id'] },
            where: {
                vendor_unique_id,
                default_bank: true_status,
                status: default_status
            }
        }).then(vendor_bank_account => {
            if (!vendor_bank_account) {
                NotFoundError(res, { unique_id: vendor_unique_id, text: "Default Vendor Bank Account not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Default Vendor Bank Account loaded" }, vendor_bank_account);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getVendorBankAccount(req, res) {
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
            VENDOR_BANK_ACCOUNTS.findOne({
                attributes: { exclude: ['vendor_unique_id', 'id'] },
                where: {
                    vendor_unique_id,
                    ...payload,
                    status: default_status
                }
            }).then(vendor_bank_account => {
                if (!vendor_bank_account) {
                    NotFoundError(res, { unique_id: vendor_unique_id, text: "Vendor Bank Account not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Bank Account loaded" }, vendor_bank_account);
                }
            }).catch(err => {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            });
        }
    }
};

export async function addVendorBankAccount(req, res) {
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

                    const vendor_bank_account_count = await VENDOR_BANK_ACCOUNTS.count({ where: { vendor_unique_id }, transaction });
    
                    const vendor_bank_account = await VENDOR_BANK_ACCOUNTS.create(
                        {
                            unique_id: uuidv4(),
                            vendor_unique_id,
                            ...payload,
                            default_bank: vendor_bank_account_count === 0 ? true_status : false_status,
                            status: default_status
                        }, { transaction }
                    );
    
                    if (vendor_bank_account) {
                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Bank Account added successfully!" });
                    } else {
                        throw new Error("Error adding vendor bank account");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateVendorBankAccount(req, res) {
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
                    
                    const vendor_bank_account = await VENDOR_BANK_ACCOUNTS.update(
                        {
                            ...payload
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );

                    if (vendor_bank_account > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Bank Account was updated successfully!" });
                    } else {
                        throw new Error("Error updating vendor bank account details");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function changeVendorDefaultBankAccount(req, res) {
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

                    const not_default_vendor_bank_account = await VENDOR_BANK_ACCOUNTS.update(
                        {
                            default_bank: false_status
                        }, {
                            where: {
                                unique_id: {
                                    [Op.ne]: payload.unique_id,
                                },
                                vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
        
                    const vendor_bank_account = await VENDOR_BANK_ACCOUNTS.update(
                        {
                            default_bank: true_status
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
        
                    if (vendor_bank_account > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor default bank account was updated successfully!" });
                    } else {
                        throw new Error("Error updating vendor default bank account");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function deleteVendorBankAccount(req, res) {
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

                    const vendor_bank_accounts = await VENDOR_BANK_ACCOUNTS.findOne({
                        where: {
                            vendor_unique_id,
                            default_bank: true_status,
                            status: default_status
                        },
                        transaction
                    });
        
                    if (vendor_bank_accounts.unique_id === payload.unique_id) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Error deleting vendor default bank account!" }, null);
                    } else {
                        const vendor_bank_account = await VENDOR_BANK_ACCOUNTS.destroy(
                            {
                                where: {
                                    unique_id: payload.unique_id,
                                    vendor_unique_id,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_bank_account > 0) {
                            OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Bank Account was deleted successfully!" });
                        } else {
                            throw new Error("Error deleting vendor bank account");
                        }
                    }
                });

            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};
