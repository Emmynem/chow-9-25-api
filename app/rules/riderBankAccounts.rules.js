import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const RIDERS = db.riders;
const RIDER_BANK_ACCOUNTS = db.rider_bank_accounts;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export const rider_bank_account_rules = {
    forFindingRiderBankAccount: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return RIDER_BANK_ACCOUNTS.findOne({
                    where: {
                        unique_id,
                        rider_unique_id: req.query.rider_unique_id || req.body.rider_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rider Bank Account not found!');
                });
            })
    ],
    forFindingRiderBankAccountFalsy: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return RIDER_BANK_ACCOUNTS.findOne({
                    where: {
                        unique_id,
                        rider_unique_id: req.query.rider_unique_id || req.body.rider_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rider Bank Account not found!');
                });
            })
    ],
    forFindingRiderBankAccountAlt: [
        check('rider_bank_account_unique_id', "Rider Bank Account Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_bank_account_unique_id => {
                return RIDER_BANK_ACCOUNTS.findOne({ where: { unique_id: rider_bank_account_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider Bank Account not found!');
                });
            })
    ],
    forAdding: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
            .bail()
            .custom(async rider_unique_id => {
                const rider_bank_account_count = await RIDER_BANK_ACCOUNTS.count({ where: { rider_unique_id } });

                const _max_rider_bank_accounts = await APP_DEFAULTS.findOne({ where: { criteria: { [Op.like]: "Max Bank Accounts" } } });
                const max_rider_bank_accounts = return_default_value(_max_rider_bank_accounts['dataValues']);
                if (rider_bank_account_count >= max_rider_bank_accounts) return Promise.reject('Max bank accounts reached!');
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