import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status, validate_user_payment_method, user_payment_methods } from '../config/config.js';

const USERS = db.users;
const USER_TRANSACTIONS = db.user_transactions;

export const user_transaction_rules = {
    forFindingUserTransaction: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forFindingUserTransactionFalsy: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return USER_TRANSACTIONS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forFindingUserTransactionAlt: [
        check('transaction_unique_id', "Transaction Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(transaction_unique_id => {
                return USER_TRANSACTIONS.findOne({ where: { unique_id: transaction_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forAdding: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('type', "Type is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount === 0) return false;
                else if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('transaction_status', "Transaction Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('details', "Details is required")
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 500 })
            .withMessage("Invalid length (3 - 500) characters"),
    ],
    forUpdatingDetails: [
        check('details', "Details is required")
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 500 })
            .withMessage("Invalid length (3 - 500) characters")
    ],
    forUpdatingStatus: [
        check('transaction_status', "Transaction Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forDeposit: [
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount === 0) return false;
                else if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid"),
        check('payment_method', "Payment Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
            .bail()
            .custom(payment_method => !!validate_user_payment_method(payment_method))
            .withMessage(`Invalid payment method, accepted methods (${user_payment_methods.card + ", " + user_payment_methods.transfer})`)
    ],
    forWithdrawal: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('bank', "Bank is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('account_number', "Account Number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 10 })
            .withMessage("Invalid length (3 - 10) characters"),
        check('amount', "Amount is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(amount => {
                if (amount === 0) return false;
                else if (amount < 0) return false;
                else return true;
            })
            .withMessage("Amount invalid")
    ],
    forFindingViaType: [
        check('type', "Type is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forFindingViaTransactionStatus: [
        check('transaction_status', "Transaction Status is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ]
};  