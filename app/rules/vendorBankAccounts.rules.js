import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const VENDORS = db.vendors;
const VENDOR_BANK_ACCOUNTS = db.vendor_bank_accounts;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const vendor_bank_account_rules = {
    forFindingVendorBankAccount: [
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
                return VENDOR_BANK_ACCOUNTS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor Bank Account not found!');
                });
            })
    ],
    forFindingVendorBankAccountFalsy: [
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
                return VENDOR_BANK_ACCOUNTS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor Bank Account not found!');
                });
            })
    ],
    forFindingVendorBankAccountAlt: [
        check('vendor_bank_account_unique_id', "Vendor Bank Account Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_bank_account_unique_id => {
                return VENDOR_BANK_ACCOUNTS.findOne({ where: { unique_id: vendor_bank_account_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor Bank Account not found!');
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
            })
            .bail()
            .custom(async vendor_unique_id => {
                const vendor_bank_account_count = await VENDOR_BANK_ACCOUNTS.count({ where: { vendor_unique_id } });

                const _max_vendor_bank_accounts = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: "Max Vendor Bank Accounts" } } });
                const max_vendor_bank_accounts = return_default_value(_max_vendor_bank_accounts['dataValues']);
                if (vendor_bank_account_count >= max_vendor_bank_accounts) return Promise.reject('Max bank accounts reached!');
            }),
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
    ],
    forUpdatingDetails: [
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
            .withMessage("Invalid length (3 - 10) characters")
    ],
    forUpdatingDefault: [
        check('default_bank', "Default Bank is required")
            .exists({ checkNull: true, checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ]
};  