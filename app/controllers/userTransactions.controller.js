import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
    default_delete_status, default_status, tag_admin, true_status, false_status, deposit, processing, user_payment_methods,
    currency, withdrawal, cancelled, completed, anonymous
} from '../config/config.js';
import db from "../models/index.js";

const USER_TRANSACTIONS = db.user_transactions;
const USERS = db.users;
const USER_ACCOUNT = db.user_account;
const Op = db.Sequelize.Op;

export function rootGetUsersTransactions(req, res) {
    USER_TRANSACTIONS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
            }
        ]
    }).then(user_transactions => {
        if (!user_transactions || user_transactions.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Transactions Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Transactions loaded" }, user_transactions);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetUserTransaction(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        USER_TRANSACTIONS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                }
            ]
        }).then(user_transaction => {
            if (!user_transaction) {
                NotFoundError(res, { unique_id: tag_admin, text: "Transaction not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transaction loaded" }, user_transaction);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetUsersTransactionsSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        USER_TRANSACTIONS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                }
            ]
        }).then(user_transactions => {
            if (!user_transactions || user_transactions.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transactions Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Transactions loaded" }, user_transactions);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUserTransactions(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    USER_TRANSACTIONS.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id'] },
        where: {
            user_unique_id,
            status: default_status
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(user_transactions => {
        if (!user_transactions || user_transactions.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Transactions loaded" }, user_transactions);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserTransaction(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        USER_TRANSACTIONS.findOne({
            attributes: { exclude: ['user_unique_id', 'id'] },
            where: {
                user_unique_id,
                ...payload,
                status: default_status
            }
        }).then(user_transaction => {
            if (!user_transaction) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Transaction not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Transaction loaded" }, user_transaction);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function addUserTransaction(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const user_transaction = await USER_TRANSACTIONS.create(
                    {
                        unique_id: uuidv4(),
                        user_unique_id,
                        ...payload,
                        status: default_status
                    }, { transaction }
                );

                if (user_transaction) {
                    CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" });
                } else {
                    throw new Error("Error creating transaction");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function addTransactionInternally(req, res, data, transaction) {

    let msg;
    let param;
    let return_data = { status: 0 };

    if (data.user_unique_id === "" || data.user_unique_id === undefined) {
        msg = "User Unique ID is required";
        param = "user_unique_id";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.type === "" || data.type === undefined) {
        msg = "Type is required";
        param = "type";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.type.length > 50) {
        msg = "Type max length reached";
        param = "type";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.amount === "" || data.amount === undefined) {
        msg = "Amount is required";
        param = "amount";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (!Number.isInteger(data.amount)) {
        msg = "Amount should be integer";
        param = "amount";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.transaction_status === "" || data.transaction_status === undefined) {
        msg = "Transaction Status is required";
        param = "transaction_status";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if (data.transaction_status.length > 50) {
        msg = "Transaction Status max length reached";
        param = "transaction_status";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else if ((data.details !== "" && data.details !== undefined) && data.details.length > 500) {
        msg = "Detials max length reached";
        param = "details";
        logger.warn({ unique_id: data.user_unique_id, text: `Transactions | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else {
        try {
            const user_transaction = USER_TRANSACTIONS.create({
                ...data,
                unique_id: uuidv4(),
                status: default_status
            }, { transaction });
            return_data.status = 1;
            return { ...return_data, err: null };
            logger.info({ unique_id: data.user_unique_id, text: `Transactions - ${data.type}` });
        } catch (err) {
            logger.error({ unique_id: data.user_unique_id, text: err.message });
            return { ...return_data, err: err.message };
        }
    }
};

export async function addDeposit(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_deposit = await USER_TRANSACTIONS.findAll({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        type: deposit,
                        transaction_status: processing,
                        status: default_status
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: 1,
                    transaction
                });

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (last_deposit.length > 0) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "You have a pending deposit payment!" }, null);
                } else {
                    if (payload.payment_method === user_payment_methods.card) {
                        if (user_account) {
                            const details = `${currency} ${payload.amount} ${deposit.toLowerCase()}, payment via ${payload.payment_method}`;

                            const user_transaction = await USER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    type: deposit,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );

                            if (user_transaction) {
                                CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: user_transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction");
                            }
                        } else {
                            BadRequestError(res, { unique_id: user_unique_id, text: "User's balance not found!" }, null);
                        }
                    } else if (payload.payment_method === user_payment_methods.transfer) {
                        if (user_account) {
                            // Might want to change the details later on, to add the default bank account details
                            const details = `${currency} ${payload.amount} ${deposit.toLowerCase()}, payment via ${payload.payment_method}`;

                            const user_transaction = await USER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    type: deposit,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );

                            if (user_transaction) {
                                CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: user_transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction");
                            }
                        } else {
                            BadRequestError(res, { unique_id: user_unique_id, text: "User's balance not found!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "Choose a viable payment method!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function addDepositExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_deposit = await USER_TRANSACTIONS.findAll({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        type: deposit,
                        transaction_status: processing,
                        status: default_status
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: 1,
                    transaction
                });

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (last_deposit.length > 0) {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "You have a pending deposit payment!" }, null);
                } else {
                    if (payload.payment_method === user_payment_methods.card) {
                        if (user_account) {
                            const details = `${currency} ${payload.amount} ${deposit.toLowerCase()}, payment via ${payload.payment_method}`;

                            const user_transaction = await USER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    type: deposit,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );

                            if (user_transaction) {
                                CreationSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: user_transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction");
                            }
                        } else {
                            BadRequestError(res, { unique_id: payload.user_unique_id, text: "User's balance not found!" }, null);
                        }
                    } else if (payload.payment_method === user_payment_methods.transfer) {
                        if (user_account) {
                            // Might want to change the details later on, to add the default bank account details
                            const details = `${currency} ${payload.amount} ${deposit.toLowerCase()}, payment via ${payload.payment_method}`;

                            const user_transaction = await USER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    type: deposit,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );

                            if (user_transaction) {
                                CreationSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: user_transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction");
                            }
                        } else {
                            BadRequestError(res, { unique_id: payload.user_unique_id, text: "User's balance not found!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: payload.user_unique_id, text: "Choose a viable payment method!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function addWithdrawal(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_withdrawal = await USER_TRANSACTIONS.findAll({
                    where: {
                        user_unique_id: payload.user_unique_id,
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

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (last_withdrawal.length > 0) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "You have a pending withdrawal!" }, null);
                } else {
                    if (user_account) {
                        if (payload.amount > user_account.balance) {
                            BadRequestError(res, { unique_id: user_unique_id, text: "Insufficient balance!" }, null);
                        } else {
                            const details = `${currency} ${payload.amount} ${withdrawal.toLowerCase()}. Bank account details : ${payload.name} ${payload.account_number} ${payload.bank}`;

                            const user_transaction = await USER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    type: withdrawal,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );

                            if (user_transaction) {
                                CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: user_transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction!");
                            }
                        }
                    } else {
                        BadRequestError(res, { unique_id: user_unique_id, text: "User's balance not found!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function addWithdrawalExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const last_withdrawal = await USER_TRANSACTIONS.findAll({
                    where: {
                        user_unique_id: payload.user_unique_id,
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

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (last_withdrawal.length > 0) {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "You have a pending withdrawal!" }, null);
                } else {
                    if (user_account) {
                        if (payload.amount > user_account.balance) {
                            BadRequestError(res, { unique_id: payload.user_unique_id, text: "Insufficient balance!" }, null);
                        } else {
                            const details = `${currency} ${payload.amount} ${withdrawal.toLowerCase()}. Bank account details : ${payload.name} ${payload.account_number} ${payload.bank}`;

                            const user_transaction = await USER_TRANSACTIONS.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    type: withdrawal,
                                    amount: payload.amount,
                                    transaction_status: processing,
                                    details,
                                    status: default_status
                                }, { transaction }
                            );

                            if (user_transaction) {
                                CreationSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction created successfully!" }, { amount: payload.amount, transaction_unique_id: user_transaction.unique_id });
                            } else {
                                throw new Error("Error adding transaction!");
                            }
                        }
                    } else {
                        BadRequestError(res, { unique_id: payload.user_unique_id, text: "User's balance not found!" }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelDeposit(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id: payload.user_unique_id,
                        type: deposit,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });

                if (current_transaction) {
                    const user_transaction = await USER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                user_unique_id: payload.user_unique_id,
                                type: deposit,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (user_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelDepositExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id: payload.user_unique_id,
                        type: deposit,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });

                if (current_transaction) {
                    const user_transaction = await USER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                user_unique_id: payload.user_unique_id,
                                type: deposit,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (user_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelWithdrawal(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id: payload.user_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });

                if (current_transaction) {
                    const user_transaction = await USER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                user_unique_id: payload.user_unique_id,
                                type: withdrawal,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (user_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function cancelWithdrawalExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id: payload.user_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });

                if (current_transaction) {
                    const user_transaction = await USER_TRANSACTIONS.update(
                        {
                            transaction_status: cancelled,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                user_unique_id: payload.user_unique_id,
                                type: withdrawal,
                                status: default_status
                            },
                            transaction
                        }
                    );

                    if (user_transaction > 0) {
                        OtherSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction was cancelled successfully!" });
                    } else {
                        throw new Error("Error cancelling transaction!");
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function completeDeposit(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id: payload.user_unique_id,
                        type: deposit,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (current_transaction) {
                    if (user_account) {
                        const updated_deposit = user_account.balance + current_transaction.amount;

                        const deposit_update = await USER_ACCOUNT.update(
                            {
                                balance: updated_deposit,
                            }, {
                                where: {
                                    user_unique_id: payload.user_unique_id,
                                    status: default_status
                                },
                                transaction
                            }
                        );

                        if (deposit_update > 0) {
                            const user_transaction = await USER_TRANSACTIONS.update(
                                {
                                    transaction_status: completed,
                                }, {
                                    where: {
                                        unique_id: payload.unique_id,
                                        user_unique_id: payload.user_unique_id,
                                        type: deposit,
                                        status: default_status
                                    },
                                    transaction
                                }
                            );

                            if (user_transaction > 0) {
                                OtherSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction was completed successfully!" });
                            } else {
                                throw new Error("Error completing transaction!");
                            }
                        } else {
                            throw new Error("Error updating deposit!");
                        }

                    } else {
                        BadRequestError(res, { unique_id: payload.user_unique_id, text: "User's balance not found!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function completeWithdrawal(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const current_transaction = await USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id: payload.user_unique_id,
                        type: withdrawal,
                        transaction_status: processing,
                        status: default_status
                    },
                    transaction
                });

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (current_transaction) {
                    if (user_account) {
                        const updated_balance = user_account.balance - current_transaction.amount;

                        const balance_update = await USER_ACCOUNT.update(
                            {
                                balance: updated_balance,
                            }, {
                                where: {
                                    user_unique_id: payload.user_unique_id,
                                    status: default_status
                                },
                                transaction
                            }
                        );

                        if (balance_update > 0) {
                            const user_transaction = await USER_TRANSACTIONS.update(
                                {
                                    transaction_status: completed,
                                }, {
                                    where: {
                                        unique_id: payload.unique_id,
                                        user_unique_id: payload.user_unique_id,
                                        type: withdrawal,
                                        status: default_status
                                    },
                                    transaction
                                }
                            );

                            if (user_transaction > 0) {
                                OtherSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction was completed successfully!" });
                            } else {
                                throw new Error("Error completing transaction!");
                            }
                        } else {
                            throw new Error("Error updating balance!");
                        }

                    } else {
                        BadRequestError(res, { unique_id: payload.user_unique_id, text: "User's balance not found!" }, null);
                    }
                } else {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "Processing transaction not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateTransaction(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const user_transaction = await USER_TRANSACTIONS.update(
                    {
                        ...payload,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );

                if (user_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was updated successfully!" });
                } else {
                    throw new Error("Error updating transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateTransactionExternally(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id || anonymous, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const user_transaction = await USER_TRANSACTIONS.update(
                    {
                        ...payload,
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id: payload.user_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );

                if (user_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: payload.user_unique_id, text: "Transaction was updated successfully!" });
                } else {
                    throw new Error("Error updating transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};

export async function removeTransaction(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const user_transaction = await USER_TRANSACTIONS.update(
                    {
                        status: default_delete_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );

                if (user_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was removed successfully!" });
                } else {
                    throw new Error("Error removing transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function restoreTransaction(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
                const user_transaction = await USER_TRANSACTIONS.update(
                    {
                        status: default_status
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_delete_status
                        },
                        transaction
                    }
                );

                if (user_transaction > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Transaction was restored successfully!" });
                } else {
                    throw new Error("Error restoring transaction!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
