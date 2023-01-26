import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status, paginate } from '../config/config.js';
import db from "../models/index.js";

const RIDER_BANK_ACCOUNTS = db.rider_bank_accounts;
const RIDERS = db.riders;
const Op = db.Sequelize.Op;

export async function rootGetRidersBankAccounts(req, res) {
    const total_records = await RIDER_BANK_ACCOUNTS.count();
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    RIDER_BANK_ACCOUNTS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [
            {
                model: RIDERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'verification', 'profile_image']
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(riders_bank_accounts => {
        if (!riders_bank_accounts || riders_bank_accounts.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Bank Accounts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Bank Accounts loaded" }, { ...riders_bank_accounts, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export async function rootGetRidersBankAccountsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await RIDER_BANK_ACCOUNTS.count({ where: { ...payload } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        RIDER_BANK_ACCOUNTS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: RIDERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'verification', 'profile_image']
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(riders_bank_accounts => {
            if (!riders_bank_accounts || riders_bank_accounts.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Rider Bank Accounts Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Rider Bank Accounts loaded" }, { ...riders_bank_accounts, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function rootGetDefaultRidersBankAccounts(req, res) {
    const total_records = await RIDER_BANK_ACCOUNTS.count({ where: { default_bank: true_status } });
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    RIDER_BANK_ACCOUNTS.findAndCountAll({
        attributes: { exclude: ['id'] },
        where: {
            default_bank: true_status
        },
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [
            {
                model: RIDERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'verification', 'profile_image']
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(riders_bank_accounts => {
        if (!riders_bank_accounts || riders_bank_accounts.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Bank Accounts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Bank Accounts loaded" }, { ...riders_bank_accounts, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export async function getRiderBankAccounts(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const total_records = await RIDER_BANK_ACCOUNTS.count({ where: { rider_unique_id } });
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    RIDER_BANK_ACCOUNTS.findAndCountAll({
        attributes: { exclude: ['id', 'rider_unique_id'] },
        where: {
            rider_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(rider_bank_accounts => {
        if (!rider_bank_accounts || rider_bank_accounts.length == 0) {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Bank Accounts Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Bank Accounts loaded" }, { ...rider_bank_accounts, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    });
};

export function getRiderDefaultBankAccount(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    RIDER_BANK_ACCOUNTS.findOne({
        attributes: { exclude: ['rider_unique_id', 'id'] },
        where: {
            rider_unique_id,
            default_bank: true_status,
            status: default_status
        }
    }).then(rider_bank_account => {
        if (!rider_bank_account) {
            NotFoundError(res, { unique_id: rider_unique_id, text: "Default Rider Bank Account not found" }, null);
        } else {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Default Rider Bank Account loaded" }, rider_bank_account);
        }
    }).catch(err => {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    });
};

export function getRiderBankAccount(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDER_BANK_ACCOUNTS.findOne({
            attributes: { exclude: ['rider_unique_id', 'id'] },
            where: {
                rider_unique_id,
                ...payload,
                status: default_status
            }
        }).then(rider_bank_account => {
            if (!rider_bank_account) {
                NotFoundError(res, { unique_id: rider_unique_id, text: "Rider Bank Account not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Bank Account loaded" }, rider_bank_account);
            }
        }).catch(err => {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        });
    }
};

export async function addRiderBankAccount(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider_bank_account_count = await RIDER_BANK_ACCOUNTS.count({ where: { rider_unique_id }, transaction });
    
                const rider_bank_account = await RIDER_BANK_ACCOUNTS.create(
                    {
                        unique_id: uuidv4(),
                        rider_unique_id,
                        ...payload,
                        default_bank: rider_bank_account_count === 0 ? true_status : false_status,
                        status: default_status
                    }, { transaction }
                );
    
                if (rider_bank_account) {
                    CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Bank Account added successfully!" });
                } else {
                    throw new Error("Error adding rider bank account");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderBankAccount(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider_bank_account = await RIDER_BANK_ACCOUNTS.update(
                    {
                        ...payload
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider_bank_account > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Bank Account was updated successfully!" });
                } else {
                    throw new Error("Error updating rider bank account details");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function changeRiderDefaultBankAccount(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const not_default_rider_bank_account = await RIDER_BANK_ACCOUNTS.update(
                    {
                        default_bank: false_status
                    }, {
                        where: {
                            unique_id: {
                                [Op.ne]: payload.unique_id,
                            },
                            rider_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                const rider_bank_account = await RIDER_BANK_ACCOUNTS.update(
                    {
                        default_bank: true_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider_bank_account > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Rider default bank account was updated successfully!" });
                } else {
                    throw new Error("Error updating rider default bank account!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function deleteRiderBankAccount(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.findOne({
                    where: {
                        rider_unique_id,
                        default_bank: true_status,
                        status: default_status
                    },
                    transaction
                });
    
                if (rider_bank_accounts.unique_id === payload.unique_id) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Error deleting rider default bank account!" }, null);
                } else {
                    const rider_bank_account = await RIDER_BANK_ACCOUNTS.destroy(
                        {
                            where: {
                                unique_id: payload.unique_id,
                                rider_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (rider_bank_account > 0) {
                        OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Bank Account was deleted successfully!" });
                    } else {
                        throw new Error("Error deleting rider bank account");
                    }
                }
            });

        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};
