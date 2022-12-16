import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, validate_platform_user_route, super_admin_routes, validate_platform_user_route_max_length, default_delete_status } from '../config/config.js';

const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

export const vendor_user_rules = {
    forFindingVendorUser: [
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
                return VENDOR_USERS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor user not found!');
                });
            })
    ],
    forFindingVendorUserFalsy: [
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
                return VENDOR_USERS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor user not found!');
                });
            })
    ],
    forFindingVendorUserAlt: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('vendor_user_unique_id', "Vendor User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((vendor_user_unique_id, { req }) => {
                return VENDOR_USERS.findOne({
                    where: {
                        unique_id: vendor_user_unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor user not found!');
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
            .custom((email, { req }) => {
                return VENDOR_USERS.findOne({
                    where: {
                        email,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                    }
                }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            }),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom((mobile_number, { req }) => {
                return VENDOR_USERS.findOne({
                    where: {
                        mobile_number,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
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
        check('routes', "Routes is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(routes => !!validate_platform_user_route(routes)).withMessage(`Invalid route, accepts an array(not empty)`)
            .bail()
            .custom(routes => !!validate_platform_user_route_max_length(routes)).withMessage(`Max length reached`)
    ],
    forUpdatingDetails: [
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
        check('email', "Invalid email format")
            .isEmail()
            .bail()
            .custom((email, { req }) => {
                return VENDOR_USERS.findOne({
                    where: {
                        email,
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || ''
                    }
                }).then(data => {
                    if (data) return Promise.reject('Email already exists!');
                });
            }),
        check('mobile_number', "Invalid mobile number")
            .optional({ checkFalsy: false })
            .isMobilePhone()
            .bail()
            .custom((mobile_number, { req }) => {
                return VENDOR_USERS.findOne({
                    where: {
                        mobile_number,
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || ''
                    }
                }).then(data => {
                    if (data) return Promise.reject('Mobile number already exists!');
                });
            }),
        check('gender', "Gender is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters")
    ],
    forUpdatingRoutes: [
        check('routes', "Routes is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(routes => !!validate_platform_user_route(routes)).withMessage(`Invalid route, accepts an array(not empty)`)
            .bail()
            .custom(routes => !!validate_platform_user_route_max_length(routes)).withMessage(`Max length reached`)
    ],
    forSearching: [
        check('search', "Search is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 2, max: 200 })
            .withMessage("Invalid length (2 - 200) characters"),
    ]
};  