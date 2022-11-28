import e from 'express';
import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
    default_delete_status, default_status, tag_admin, true_status, false_status, debt, processing, vendor_payment_methods, 
    currency, withdrawal, max_debt, cancelled, completed
} from '../config/config.js';
import db from "../models/index.js";

const RIDER_TRANSACTIONS = db.rider_transactions;
const RIDERS = db.riders;
const RIDER_ACCOUNT = db.rider_account;
const RIDER_BANK_ACCOUNTS = db.rider_bank_accounts;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export function rootGetRiderTransactions(req, res) {
    RIDER_TRANSACTIONS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: RIDERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification', 'availability']
            }
        ]
    }).then(rider_transactions => {
        if (!rider_transactions || rider_transactions.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Transactions Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Transactions loaded" }, rider_transactions);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetRiderTransaction(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDER_TRANSACTIONS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.transaction_unique_id,
            },
            include: [
                {
                    model: RIDERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification', 'availability']
                }
            ]
        }).then(rider_transaction => {
            if (!rider_transaction) {
                NotFoundError(res, { unique_id: tag_admin, text: "Transaction not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transaction loaded" }, rider_transaction);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getRiderTransactions(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    RIDER_TRANSACTIONS.findAndCountAll({
        attributes: { exclude: ['id', 'rider_unique_id'] },
        where: {
            rider_unique_id,
            status: default_status
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(rider_transactions => {
        if (!rider_transactions || rider_transactions.length == 0) {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Transactions Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Transactions loaded" }, rider_transactions);
        }
    }).catch(err => {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    });
};

export function getRiderTransaction(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDER_TRANSACTIONS.findOne({
            attributes: { exclude: ['rider_unique_id', 'id'] },
            where: {
                rider_unique_id,
                ...payload,
                status: default_status
            }
        }).then(rider_transaction => {
            if (!rider_transaction) {
                NotFoundError(res, { unique_id: rider_unique_id, text: "Transaction not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction loaded" }, rider_transaction);
            }
        }).catch(err => {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        });
    }
};

export async function addRiderTransaction(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const rider_transaction = await RIDER_TRANSACTIONS.create(
                    {
                        unique_id: uuidv4(),
                        rider_unique_id,
                        ...payload,
                        status: default_status
                    }, { transaction }
                );
    
                if (rider_transaction) {
                    CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction created successfully!" });
                } else {
                    throw new Error("Error creating transaction");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function addTransactionInternally(req, res, data, transaction) {

    let msg;
    let param;
    let return_data = { status: 0 };

    if (data.rider_unique_id === "" || data.rider_unique_id === undefined) {
        msg = "Vendor Unique ID is required";
        param = "rider_unique_id";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.type === "" || data.type === undefined) {
        msg = "Type is required";
        param = "type";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.type.length > 50) {
        msg = "Type max length reached";
        param = "type";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.amount === "" || data.amount === undefined) {
        msg = "Amount is required";
        param = "amount";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (!Number.isInteger(data.amount)) {
        msg = "Amount should be integer";
        param = "amount";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.transaction_status === "" || data.transaction_status === undefined) {
        msg = "Transaction Status is required";
        param = "transaction_status";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.transaction_status.length > 50) {
        msg = "Transaction Status max length reached";
        param = "transaction_status";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if ((data.details !== "" && data.details !== undefined) && data.details.length > 500) {
        msg = "Detials max length reached";
        param = "details";
        logger.warn({ unique_id: data.rider_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else {
        try {
            const rider_transaction = RIDER_TRANSACTIONS.create({
                ...data,
                unique_id: uuidv4(),
                status: default_status
            }, { transaction });
            return_data.status = 1;
            return { ...return_data, err: null };
            logger.info({ unique_id: data.rider_unique_id, text: `Transactions - ${data.type}` });
        } catch (err) {
            logger.error({ unique_id: data.rider_unique_id, text: err.message });
            return { ...return_data, err: err.message };
        }
    }
};

export async function addServiceChargePayment(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_debt = await RIDER_TRANSACTIONS.findAll({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: 1,
                    transaction
                });
    
                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (last_debt) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "You have a pending service charge payment!" }, null);
                } else {
                    if (payload.payment_method === vendor_payment_methods.card || payload.payment_method === vendor_payment_methods.wallet) {
                        if (rider_account) {
                            if (rider_account.service_charge == 0) {
                                BadRequestError(res, { unique_id: rider_unique_id, text: "No service charge!" }, null);
                            } else if (payload.amount > rider_account.service_charge) {
                                BadRequestError(res, { unique_id: rider_unique_id, text: `Amount is greater than service charge` }, { service_charge: rider_account.service_charge });
                            } else {
                                const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                const rider_transaction = await RIDER_TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id,
                                        type: debt,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (rider_transaction) {
                                    CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transaction.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: rider_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    } else if (payload.payment_method === vendor_payment_methods.transfer) {
                        if (rider_account) {
                            if (rider_account.service_charge == 0) {
                                BadRequestError(res, { unique_id: rider_unique_id, text: "No service charge!" }, null);
                            } else if (payload.amount > rider_account.service_charge) {
                                BadRequestError(res, { unique_id: rider_unique_id, text: `Amount is greater than service charge` }, { service_charge: rider_account.service_charge });
                            } else {
                                // Might want to change the details later on, to add the default bank account details
                                const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                const rider_transaction = await RIDER_TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id,
                                        type: debt,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (rider_transaction) {
                                    CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transaction.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: rider_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: rider_unique_id, text: "Choose a viable payment method!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function addServiceChargePaymentExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_debt = await RIDER_TRANSACTIONS.findAll({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: 1,
                    transaction
                });
    
                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (last_debt) {
                    BadRequestError(res, { unique_id: payload.rider_unique_id, text: "You have a pending service charge payment!" }, null);
                } else {
                    if (payload.payment_method === vendor_payment_methods.card || payload.payment_method === vendor_payment_methods.wallet) {
                        if (rider_account) {
                            if (rider_account.service_charge == 0) {
                                BadRequestError(res, { unique_id: payload.rider_unique_id, text: "No service charge!" }, null);
                            } else if (payload.amount > rider_account.service_charge) {
                                BadRequestError(res, { unique_id: payload.rider_unique_id, text: `Amount is greater than service charge` }, { service_charge: rider_account.service_charge });
                            } else {
                                const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                const rider_transaction = await RIDER_TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id,
                                        type: debt,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (rider_transaction) {
                                    CreationSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transaction.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    } else if (payload.payment_method === vendor_payment_methods.transfer) {
                        if (rider_account) {
                            if (rider_account.service_charge == 0) {
                                BadRequestError(res, { unique_id: payload.rider_unique_id, text: "No service charge!" }, null);
                            } else if (payload.amount > rider_account.service_charge) {
                                BadRequestError(res, { unique_id: payload.rider_unique_id, text: `Amount is greater than service charge` }, { service_charge: rider_account.service_charge });
                            } else {
                                // Might want to change the details later on, to add the default bank account details
                                const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                const rider_transaction = await RIDER_TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id,
                                        type: debt,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (rider_transaction) {
                                    CreationSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transaction.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Choose a viable payment method!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.rider_unique_id, text: err.message }, null);
        }
    }
};

export async function addWithdrawal(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_withdrawal = await RIDER_TRANSACTIONS.findAll({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: 1,
                    transaction
                });
    
                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        default_bank: true_status,
                        status: default_status
                    },
                    transaction
                });
    
                const app_defaults = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: max_debt.criteria
                    },
                    transaction
                });
    
                if (last_withdrawal) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "You have a pending withdrawal!" }, null);
                } else {
                    if (rider_account) {
                        if (payload.amount > rider_account.balance) {
                            BadRequestError(res, { unique_id: rider_unique_id, text: "Insufficient balance!" }, null);
                        } else if (rider_account.service_charge >= app_defaults.value) {
                            BadRequestError(res, { unique_id: rider_unique_id, text: `Pay outstanding service charge to enable withdrawal` }, { service_charge: rider_account.service_charge });
                        } else {
                            const details = `${currency} ${payload.amount} ${withdrawal.toLowerCase()}. Bank account details : ${rider_bank_accounts.name} ${rider_bank_accounts.account_number} ${rider_bank_accounts.bank}`;
    
                            const rider_transaction = await RIDER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    rider_unique_id,
                                    type: withdrawal,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );
    
                            if (rider_transaction) {
                                CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction!");
                            }
                        }
                    } else {
                        BadRequestError(res, { unique_id: rider_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function addWithdrawalExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_withdrawal = await RIDER_TRANSACTIONS.findAll({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: 1,
                    transaction
                });
    
                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                const rider_bank_accounts = await RIDER_BANK_ACCOUNTS.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        default_bank: true_status,
                        status: default_status
                    },
                    transaction
                });
    
                const app_defaults = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: max_debt.criteria
                    },
                    transaction
                });
    
                if (last_withdrawal) {
                    BadRequestError(res, { unique_id: payload.rider_unique_id, text: "You have a pending withdrawal!" }, null);
                } else {
                    if (rider_account) {
                        if (payload.amount > rider_account.balance) {
                            BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Insufficient balance!" }, null);
                        } else if (rider_account.service_charge >= app_defaults.value) {
                            BadRequestError(res, { unique_id: payload.rider_unique_id, text: `Pay outstanding service charge to enable withdrawal` }, { service_charge: rider_account.service_charge });
                        } else {
                            const details = `${currency} ${payload.amount} ${withdrawal.toLowerCase()}. Bank account details : ${rider_bank_accounts.name} ${rider_bank_accounts.account_number} ${rider_bank_accounts.bank}`;
    
                            const rider_transaction = await RIDER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    rider_unique_id,
                                    type: withdrawal,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );
    
                            if (rider_transaction) {
                                CreationSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction!");
                            }
                        }
                    } else {
                        BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.rider_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelServiceChargePayment(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await RIDER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id: payload.rider_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    const rider_transaction = await RIDER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                rider_unique_id: payload.rider_unique_id,
                                type: debt,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (rider_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelServiceChargePaymentExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await RIDER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id: payload.rider_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    const rider_transaction = await RIDER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                rider_unique_id: payload.rider_unique_id,
                                type: debt,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (rider_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.rider_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelWithdrawal(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await RIDER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id: payload.rider_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    const rider_transaction = await RIDER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                rider_unique_id: payload.rider_unique_id,
                                type: withdrawal,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    if (rider_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelWithdrawalExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await RIDER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id: payload.rider_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    const rider_transaction = await RIDER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                rider_unique_id: payload.rider_unique_id,
                                type: withdrawal,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (rider_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.rider_unique_id, text: err.message }, null);
        }
    }
};

export async function completeServiceChargePayment(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await RIDER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id: payload.rider_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    if (rider_account) {
                        const updated_service_charge = rider_account.service_charge - current_transaction.amount;
    
                        const service_charge_update = await RIDER_ACCOUNT.update(
                            {
                                service_charge: updated_service_charge,
                            }, {
                                where: {
                                    rider_unique_id: payload.rider_unique_id,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
    
                        if (service_charge_update > 0) {
                            const rider_transaction = await RIDER_TRANSACTIONS.update(
                                {
                                    transaction_status: completed,
                                }, {
                                    where: {
                                        unique_id: payload.unique_id,
                                        rider_unique_id: payload.rider_unique_id,
                                        type: debt,
                                        status: default_status
                                    },
                                    transaction
                                }
                            );
    
                            if (rider_transaction > 0) {
                                OtherSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction was completed successfully!" });
                            } else {
                                throw new Error("Error completing transaction!");
                            }
                        } else {
                            throw new Error("Error updating service charge!");
                        }
    
                    } else {
                        BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.rider_unique_id, text: err.message }, null);
        }
    }
};

export async function completeWithdrawal(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await RIDER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id: payload.rider_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: payload.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    if (rider_account) {
                        const updated_balance = rider_account.balance - current_transaction.amount;
    
                        const balance_update = await RIDER_ACCOUNT.update(
                            {
                                balance: updated_balance,
                            }, {
                                where: {
                                    rider_unique_id: payload.rider_unique_id,
                                    status: default_status
                                },
                                transaction
                            }
                        );
    
                        if (balance_update > 0) {
                            const rider_transaction = await RIDER_TRANSACTIONS.update(
                                {
                                    transaction_status: completed,
                                }, {
                                    where: {
                                        unique_id: payload.unique_id,
                                        rider_unique_id: payload.rider_unique_id,
                                        type: withdrawal,
                                        status: default_status
                                    },
                                    transaction
                                }
                            );
    
                            if (rider_transaction > 0) {
                                OtherSuccessResponse(res, { unique_id: payload.rider_unique_id, text: "Transaction was completed successfully!" });
                            } else {
                                throw new Error("Error completing transaction!");
                            }
                        } else {
                            throw new Error("Error updating balance!");
                        }
    
                    } else {
                        BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.rider_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateTransaction(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const rider_transaction = await RIDER_TRANSACTIONS.update(
                    {
                        ...payload,
                        rider_user_unique_id,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );
    
                if (rider_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction was updated successfully!" });
                } else {
                    throw new Error("Error updating transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function removeTransaction(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const rider_transaction = await RIDER_TRANSACTIONS.update(
                    {
                        status: default_delete_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );
    
                if (rider_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction was removed successfully!" });
                } else {
                    throw new Error("Error removing transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function restoreTransaction(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const rider_transaction = await RIDER_TRANSACTIONS.update(
                    {
                        status: default_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_delete_status
                        }, 
                        transaction
                    }
                );
    
                if (rider_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Transaction was restored successfully!" });
                } else {
                    throw new Error("Error restoring transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};
