import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { 
    default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status, debt, processing, 
    vendor_payment_methods, currency, super_admin_routes, withdrawal, max_debt, cancelled, completed, anonymous
} from '../config/config.js';
import db from "../models/index.js";

const TRANSACTIONS = db.transactions;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const VENDOR_ACCOUNT = db.vendor_account;
const VENDOR_BANK_ACCOUNTS = db.vendor_bank_accounts;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export function rootGetTransactions(req, res) {
    TRANSACTIONS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
            }
        ]
    }).then(transactions => {
        if (!transactions || transactions.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Transactions Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Transactions loaded" }, transactions);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetTransaction(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        TRANSACTIONS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
                }
            ]
        }).then(transaction => {
            if (!transaction) {
                NotFoundError(res, { unique_id: tag_admin, text: "Transaction not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transaction loaded" }, transaction);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetTransactionsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        TRANSACTIONS.findAndCountAll({
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
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
                }
            ]
        }).then(transactions => {
            if (!transactions || transactions.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transactions Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transactions loaded" }, transactions);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getTransactions(req, res) {
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
        TRANSACTIONS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id', 'status'] },
            where: {
                vendor_unique_id,
                status: default_status
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(transactions => {
            if (!transactions || transactions.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Transactions Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Transactions loaded" }, transactions);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getTransaction(req, res) {
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
            TRANSACTIONS.findOne({
                attributes: { exclude: ['vendor_unique_id', 'id', 'status'] },
                where: {
                    vendor_unique_id,
                    ...payload,
                    status: default_status
                }
            }).then(transaction => {
                if (!transaction) {
                    NotFoundError(res, { unique_id: vendor_unique_id, text: "Transaction not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction loaded" }, transaction);
                }
            }).catch(err => {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            });
        }
    }
};

export async function addTransaction(req, res) {
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
                    
                    const transactions = await TRANSACTIONS.create(
                        {
                            unique_id: uuidv4(),
                            vendor_unique_id,
                            ...payload,
                            status: default_status
                        }, { transaction }
                    );
    
                    if (transactions) {
                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction created successfully!" });
                    } else {
                        throw new Error("Error creating transaction");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function addTransactionInternally(req, res, data, transaction) {

    let msg;
    let param;
    let return_data = { status: 0 };

    if (data.vendor_unique_id === "" || data.vendor_unique_id === undefined) {
        msg = "Vendor Unique ID is required";
        param = "vendor_unique_id";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if (data.type === "" || data.type === undefined) {
        msg = "Type is required";
        param = "type";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if (data.type.length > 50) {
        msg = "Type max length reached";
        param = "type";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if (data.amount === "" || data.amount === undefined) {
        msg = "Amount is required";
        param = "amount";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if (!Number.isInteger(data.amount)) {
        msg = "Amount should be integer";
        param = "amount";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if (data.transaction_status === "" || data.transaction_status === undefined) {
        msg = "Transaction Status is required";
        param = "transaction_status";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if (data.transaction_status.length > 50) {
        msg = "Transaction Status max length reached";
        param = "transaction_status";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else if ((data.details !== "" && data.details !== undefined) && data.details.length > 500) {
        msg = "Detials max length reached";
        param = "details";
        logger.warn({ unique_id: data.vendor_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg};
    } else {
        try {
            const transaction = TRANSACTIONS.create({
                ...data,
                unique_id: uuidv4(),
                status: default_status
            }, { transaction });
            return_data.status = 1;
            return { ...return_data, err: null };
            logger.info({ unique_id: data.vendor_unique_id, text: `Transactions - ${data.type}` });
        } catch (err) {
            logger.error({ unique_id: data.vendor_unique_id, text: err.message });
            return { ...return_data, err: err.message };
        }
    }
};

export async function addServiceChargePayment(req, res) {
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

                    const last_debt = await TRANSACTIONS.findAll({
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
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
    
                    const vendor_account = await VENDOR_ACCOUNT.findOne({
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
                            status: default_status
                        },
                        transaction
                    });
    
                    if (last_debt.length > 0) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "You have a pending service charge payment!" }, null);
                    } else {
                        if (payload.payment_method === vendor_payment_methods.card || payload.payment_method === vendor_payment_methods.wallet) {
                            if (vendor_account) {
                                if (vendor_account.service_charge == 0) {
                                    BadRequestError(res, { unique_id: vendor_unique_id, text: "No service charge!" }, null);
                                } else if (payload.amount > vendor_account.service_charge) {
                                    BadRequestError(res, { unique_id: vendor_unique_id, text: `Amount is greater than service charge` }, { service_charge: vendor_account.service_charge });
                                } else {
                                    const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                    const transactions = await TRANSACTIONS.create(
                                        {
                                            unique_id: uuidv4(),
                                            vendor_unique_id,
                                            type: debt,
                                            amount: payload.amount,
                                            transaction_status: processing,
                                            details,
                                            status: default_status
                                        }, { transaction }
                                    );
    
                                    if (transactions) {
                                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transactions.unique_id});
                                    } else {
                                        throw new Error("Error adding transaction");
                                    }
                                }
                            } else {
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Vendor's balance not found!" }, null);
                            }
                        } else if (payload.payment_method === vendor_payment_methods.transfer) {
                            if (vendor_account) {
                                if (vendor_account.service_charge == 0) {
                                    BadRequestError(res, { unique_id: vendor_unique_id, text: "No service charge!" }, null);
                                } else if (payload.amount > vendor_account.service_charge) {
                                    BadRequestError(res, { unique_id: vendor_unique_id, text: `Amount is greater than service charge` }, { service_charge: vendor_account.service_charge });
                                } else {
                                    // Might want to change the details later on, to add the default bank account details
                                    const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                    const transactions = await TRANSACTIONS.create(
                                        {
                                            unique_id: uuidv4(),
                                            vendor_unique_id,
                                            type: debt,
                                            amount: payload.amount,
                                            transaction_status: processing,
                                            details,
                                            status: default_status
                                        }, { transaction }
                                    );
    
                                    if (transactions) {
                                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transactions.unique_id });
                                    } else {
                                        throw new Error("Error adding transaction");
                                    }
                                }
                            } else {
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Vendor's balance not found!" }, null);
                            }
                        } else {
                            BadRequestError(res, { unique_id: vendor_unique_id, text: "Choose a viable payment method!" }, null);
                        }
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function addServiceChargePaymentExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const last_debt = await TRANSACTIONS.findAll({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
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
    
                const vendor_account = await VENDOR_ACCOUNT.findOne({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (last_debt.length > 0) {
                    BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "You have a pending service charge payment!" }, null);
                } else {
                    if (payload.payment_method === vendor_payment_methods.card || payload.payment_method === vendor_payment_methods.wallet) {
                        if (vendor_account) {
                            if (vendor_account.service_charge == 0) {
                                BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "No service charge!" }, null);
                            } else if (payload.amount > vendor_account.service_charge) {
                                BadRequestError(res, { unique_id: payload.vendor_unique_id, text: `Amount is greater than service charge` }, { service_charge: vendor_account.service_charge });
                            } else {
                                const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                const transactions = await TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        vendor_unique_id,
                                        type: debt,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (transactions) {
                                    CreationSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transactions.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    } else if (payload.payment_method === vendor_payment_methods.transfer) {
                        if (vendor_account) {
                            if (vendor_account.service_charge == 0) {
                                BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "No service charge!" }, null);
                            } else if (payload.amount > vendor_account.service_charge) {
                                BadRequestError(res, { unique_id: payload.vendor_unique_id, text: `Amount is greater than service charge` }, { service_charge: vendor_account.service_charge });
                            } else {
                                // Might want to change the details later on, to add the default bank account details
                                const details = `${currency} ${payload.amount} ${debt.toLowerCase()}, payment via ${payload.payment_method}`;
    
                                const transactions = await TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        vendor_unique_id,
                                        type: debt,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (transactions) {
                                    CreationSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transactions.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Choose a viable payment method!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function addWithdrawal(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    /* 
        For now only the root user can withdraw, if you want other users to be able to perform this action
        then uncomment the lines of code below and remove the present if statement.
    */

    // if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
    //     BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    // } 
    if (vendor_user_routes.routes !== super_admin_routes) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const last_withdrawal = await TRANSACTIONS.findAll({
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
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
    
                    const vendor_account = await VENDOR_ACCOUNT.findOne({
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
                            status: default_status
                        },
                        transaction
                    });
    
                    const vendor_bank_accounts = await VENDOR_BANK_ACCOUNTS.findOne({
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
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
    
                    if (last_withdrawal.length > 0) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "You have a pending withdrawal!" }, null);
                    } else {
                        if (vendor_account) {
                            if (payload.amount > vendor_account.balance) {
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Insufficient balance!" }, null);
                            } else if (vendor_account.service_charge >= app_defaults.value) {
                                BadRequestError(res, { unique_id: vendor_unique_id, text: `Pay outstanding service charge to enable withdrawal` }, { service_charge: vendor_account.service_charge });
                            } else if (!vendor_bank_accounts) {
                                BadRequestError(res, { unique_id: vendor_unique_id, text: "Bank Account Unavailable" }, null);
                            } else {
                                const details = `${currency} ${payload.amount} ${withdrawal.toLowerCase()}. Bank account details : ${vendor_bank_accounts.name} ${vendor_bank_accounts.account_number} ${vendor_bank_accounts.bank}`;
    
                                const transactions = await TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        vendor_unique_id,
                                        type: withdrawal,
                                        amount: payload.amount,
                                        transaction_status: processing,
                                        details,
                                        status: default_status
                                    }, { transaction }
                                );
    
                                if (transactions) {
                                    CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transactions.unique_id });
                                } else {
                                    throw new Error("Error adding transaction");
                                }
                            }
                        } else {
                            BadRequestError(res, { unique_id: vendor_unique_id, text: "Vendor's balance not found!" }, null);
                        }
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function addWithdrawalExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const last_withdrawal = await TRANSACTIONS.findAll({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
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
    
                const vendor_account = await VENDOR_ACCOUNT.findOne({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                const vendor_bank_accounts = await VENDOR_BANK_ACCOUNTS.findOne({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
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
    
                if (last_withdrawal.length > 0) {
                    BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "You have a pending withdrawal!" }, null);
                } else {
                    if (vendor_account) {
                        if (payload.amount > vendor_account.balance) {
                            BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Insufficient balance!" }, null);
                        } else if (vendor_account.service_charge >= app_defaults.value) {
                            BadRequestError(res, { unique_id: payload.vendor_unique_id, text: `Pay outstanding service charge to enable withdrawal` }, { service_charge: vendor_account.service_charge });
                        } else if (!vendor_bank_accounts) {
                            BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Bank Account Unavailable" }, null);
                        } else {
                            const details = `${currency} ${payload.amount} ${withdrawal.toLowerCase()}. Bank account details : ${vendor_bank_accounts.name} ${vendor_bank_accounts.account_number} ${vendor_bank_accounts.bank}`;
    
                            const transactions = await TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    vendor_unique_id,
                                    type: withdrawal,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );
    
                            if (transactions) {
                                CreationSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: transactions.unique_id });
                            } else {
                                throw new Error("Error adding transaction");
                            }
                        }
                    } else {
                        BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelServiceChargePayment(req, res) {
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

                    const current_transaction = await TRANSACTIONS.findOne({
                        where: {
                            unique_id: payload.unique_id,
                            vendor_unique_id: payload.vendor_unique_id,
                            type: debt,
                            transaction_status: processing,
                            status: default_status
                        },
                        transaction
                    });
    
                    if (current_transaction) {
                        const transactions = TRANSACTIONS.update(
                            {
                                transaction_status: cancelled,
                            }, {
                                where: {
                                    unique_id: payload.unique_id,
                                    vendor_unique_id: payload.vendor_unique_id,
                                    type: debt,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (transactions > 0) {
                            OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction was cancelled successfully!" });
                        } else {
                            throw new Error("Error cancelling transaction");
                        }
                    } else {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Processing transaction not found!" }, null);
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function cancelServiceChargePaymentExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_transaction = await TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        vendor_unique_id: payload.vendor_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    const transactions = await TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id: payload.vendor_unique_id,
                                type: debt,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    if (transactions > 0) {
                        OtherSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction");
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelWithdrawal(req, res) {
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

                    const current_transaction = await TRANSACTIONS.findOne({
                        where: {
                            unique_id: payload.unique_id,
                            vendor_unique_id: payload.vendor_unique_id,
                            type: withdrawal,
                            transaction_status: processing,
                            status: default_status
                        },
                        transaction
                    });
    
                    if (current_transaction) {
                        const transactions = await TRANSACTIONS.update(
                            {
                                transaction_status: cancelled,
                            }, {
                                where: {
                                    unique_id: payload.unique_id,
                                    vendor_unique_id: payload.vendor_unique_id,
                                    type: withdrawal,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
    
                        if (transactions > 0) {
                            OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction was cancelled successfully!" });
                        } else {
                            throw new Error("Error cancelling transaction");
                        }
                    } else {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Processing transaction not found!" }, null);
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function cancelWithdrawalExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_transaction = await TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        vendor_unique_id: payload.vendor_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    const transactions = await db.sequelize.transaction((t) => {
                        return TRANSACTIONS.update({
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id: payload.vendor_unique_id,
                                type: withdrawal,
                                status: default_status
                            }
                        }, { transaction: t });
                    });
    
                    if (transactions > 0) {
                        OtherSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Error cancelling transaction!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function completeServiceChargePayment(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_transaction = await TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        vendor_unique_id: payload.vendor_unique_id,
                        type: debt,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                const vendor_account = await VENDOR_ACCOUNT.findOne({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    if (vendor_account) {
                        const updated_service_charge = vendor_account.service_charge - current_transaction.amount;
    
                        const service_charge_update = await VENDOR_ACCOUNT.update(
                            {
                                service_charge: updated_service_charge,
                            }, {
                                where: {
                                    vendor_unique_id: payload.vendor_unique_id,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
    
                        if (service_charge_update > 0) {
                            const transactions = await TRANSACTIONS.update(
                                {
                                    transaction_status: completed,
                                }, {
                                    where: {
                                        unique_id: payload.unique_id,
                                        vendor_unique_id: payload.vendor_unique_id,
                                        type: debt,
                                        status: default_status
                                    }, 
                                    transaction
                                }
                            );
    
                            if (transactions > 0) {
                                OtherSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction was completed successfully!" });
                            } else {
                                throw new Error("Error completing transaction");
                            }
                        } else {
                            throw new Error("Error updating service charge");
                        }
    
                    } else {
                        BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function completeWithdrawal(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_transaction = await TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        vendor_unique_id: payload.vendor_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });
    
                const vendor_account = await VENDOR_ACCOUNT.findOne({
                    where: {
                        vendor_unique_id: payload.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });
    
                if (current_transaction) {
                    if (vendor_account) {
                        const updated_balance = vendor_account.balance - current_transaction.amount;
    
                        const balance_update = await VENDOR_ACCOUNT.update(
                            {
                                balance: updated_balance,
                            }, {
                                where: {
                                    vendor_unique_id: payload.vendor_unique_id,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
    
                        if (balance_update > 0) {
                            const transactions = await TRANSACTIONS.update(
                                {
                                    transaction_status: completed,
                                }, {
                                    where: {
                                        unique_id: payload.unique_id,
                                        vendor_unique_id: payload.vendor_unique_id,
                                        type: withdrawal,
                                        status: default_status
                                    }, 
                                    transaction
                                }
                            );
    
                            if (transactions > 0) {
                                OtherSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction was completed successfully!" });
                            } else {
                                throw new Error("Error completing transaction");
                            }
                        } else {
                            throw new Error("Error updating balance");
                        }
    
                    } else {
                        BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Vendor's balance not found!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.vendor_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function updateTransaction(req, res) {
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

                    const transactions = await TRANSACTIONS.update(
                        {
                            ...payload,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (transactions > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction was updated successfully!" });
                    } else {
                        throw new Error("Error updating transaction");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateTransactionExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_unique_id || anonymous, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const transactions = await TRANSACTIONS.update(
                    {
                        ...payload,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            vendor_unique_id: payload.vendor_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );

                if (transactions > 0) {
                    OtherSuccessResponse(res, { unique_id: payload.vendor_unique_id, text: "Transaction was updated successfully!" });
                } else {
                    throw new Error("Error updating transaction");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function removeTransaction(req, res) {
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

                    const transactions = await TRANSACTIONS.update(
                        {
                            status: default_delete_status
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    if (transactions > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction was removed successfully!" });
                    } else {
                        throw new Error("Error removing transaction");
                    }
                });

            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function restoreTransaction(req, res) {
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

                    const transactions = await TRANSACTIONS.update(
                        {
                            status: default_status
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_delete_status
                            }, 
                            transaction
                        }
                    );
    
                    if (transactions > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Transaction was restored successfully!" });
                    } else {
                        throw new Error("Error restoring transaction");
                    }
                });

            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};
