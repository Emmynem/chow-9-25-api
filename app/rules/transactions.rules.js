import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status, validate_vendor_payment_method, vendor_payment_methods } from '../config/config.js';

const VENDORS = db.vendors;
const TRANSACTIONS = db.transactions;

export const transaction_rules = {
    forFindingTransaction: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return TRANSACTIONS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forFindingTransactionFalsy: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return TRANSACTIONS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forFindingTransactionAlt: [
        check('transaction_unique_id', "Transaction Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(transaction_unique_id => {
                return TRANSACTIONS.findOne({ where: { unique_id: transaction_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Transaction not found!');
                });
            })
    ],
    forAdding: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
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
    forServiceChargePayment: [
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
            .custom(payment_method => !!validate_vendor_payment_method(payment_method))
            .withMessage(`Invalid payment method, accepted methods (${vendor_payment_methods.card, vendor_payment_methods.wallet, vendor_payment_methods.transfer})`)
    ],
    forWithdrawal: [
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