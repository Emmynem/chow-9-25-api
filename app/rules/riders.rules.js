import { check } from 'express-validator';
import { password_options, validate_pg_age_signup, pg_age, default_status, default_delete_status } from '../config/config.js';
import db from "../models/index.js";

const RIDERS = db.riders;
const Op = db.Sequelize.Op;

export const rider_rules = {
    forFindingRider: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return RIDERS.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forFindingRiderViaVendor: [
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
                return RIDERS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forFindingRiderEmailForVerification: [
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .bail()
            .custom(email => {
                return RIDERS.findOne({ where: { email, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forFindingRiderMobileNumberForVerification: [
        check('mobile_number', "Mobile number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isMobilePhone()
            .withMessage('Invalid mobile number')
            .bail()
            .custom(mobile_number => {
                return RIDERS.findOne({ where: { mobile_number, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forFindingRiderFalsy: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return RIDERS.findOne({ where: { unique_id, status: default_delete_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forFindingRiderViaVendorFalsy: [
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
                return RIDERS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forFindingRiderAlt: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            })
    ],
    forAdding: [
        check('method', "Method is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
        check('firstname', "Firstname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('middlename')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('lastname', "Lastname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .bail()
            .custom(email => {
                return RIDERS.findOne({ where: { email } }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            }),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom(mobile_number => {
                return RIDERS.findOne({ where: { mobile_number } }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            }),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
        check('dob', "Date of Birth is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isDate()
            .withMessage("Invalid Date of Birth")
            .bail()
            .custom((dob) => !!validate_pg_age_signup(dob))
            .withMessage(`Invalid Date of Birth, PG ${pg_age}`),
        check('password', "Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isStrongPassword(password_options)
            .withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
        check('confirmPassword', "Confirm Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
            .withMessage('Passwords are different')
    ],
    forAddingViaVendor: [
        check('firstname', "Firstname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('middlename')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('lastname', "Lastname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .bail()
            .custom(email => {
                return RIDERS.findOne({ where: { email } }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            }),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom(mobile_number => {
                return RIDERS.findOne({ where: { mobile_number } }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            }),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
        check('dob', "Date of Birth is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isDate()
            .withMessage("Invalid Date of Birth")
            .bail()
            .custom((dob) => !!validate_pg_age_signup(dob))
            .withMessage(`Invalid Date of Birth, PG ${pg_age}`),
        check('password', "Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isStrongPassword(password_options)
            .withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
        check('confirmPassword', "Confirm Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
            .withMessage('Passwords are different')
    ],
    forEmailLogin: [
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format'),
        check('password').exists().isString().withMessage("Password is required"),
        check('remember_me')
            .optional({ checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ],
    forMobileLogin: [
        check('mobile_number', "Mobile number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isMobilePhone()
            .withMessage('Invalid mobile number'),
        check('password').exists().isString().withMessage("Password is required"),
        check('remember_me')
            .optional({ checkFalsy: false })
            .bail()
            .isBoolean()
            .withMessage("Value should be true or false")
    ],
    forUpdating: [
        check('firstname', "Firstname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('middlename')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('lastname', "Lastname is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom((mobile_number, { req }) => {
                return RIDERS.findOne({
                    where: {
                        mobile_number,
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || req.UNIQUE_ID || '',
                        }
                    }
                }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            }),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
        check('dob', "Date of Birth is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isDate()
            .withMessage("Invalid Date of Birth")
            .bail()
            .custom((dob) => !!validate_pg_age_signup(dob))
            .withMessage(`Invalid Date of Birth, PG ${pg_age}`),
    ],
    forChangingPassword: [
        check('oldPassword', "Old Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .isString()
            .withMessage("Invalid old password"),
        check('password', "Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isStrongPassword(password_options)
            .withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
        check('confirmPassword', "Confirm Password is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
            .withMessage('Passwords are different')
    ],
    forEmailPasswordReset: [
        check('email', "Email is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .bail()
            .custom(email => {
                return RIDERS.findOne({ where: { email } }).then(data => {
                    if (!data) return Promise.reject('Email not found!');
                });
            })
    ],
    forMobilePasswordReset: [
        check('mobile_number', "Mobile number is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isMobilePhone()
            .withMessage('Invalid mobile number')
            .bail()
            .custom(mobile_number => {
                return RIDERS.findOne({ where: { mobile_number } }).then(data => {
                    if (!data) return Promise.reject('Mobile number not found!');
                });
            })
    ],
    forSearching: [
        check('search', "Search is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 2, max: 200 })
            .withMessage("Invalid length (2 - 200) characters"),
    ]
};