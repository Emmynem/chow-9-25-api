import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import { strip_text, default_status, default_delete_status } from '../config/config.js';

const MENUS = db.menus;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

export const menu_rules = {
    forFindingMenu: [
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
                return MENUS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Menu not found!');
                });
            })
    ],
    forFindingMenuFalsy: [
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
                return MENUS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Menu not found!');
                });
            })
    ],
    forFindingMenuAlt: [
        check('menu_unique_id', "Menu Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(menu_unique_id => {
                return MENUS.findOne({ where: { unique_id: menu_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Menu not found!');
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
        check('vendor_user_unique_id', "Vendor User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_user_unique_id => {
                return VENDOR_USERS.findOne({ where: { unique_id: vendor_user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor User not found!');
                });
            }),
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom((name, { req }) => {
                return MENUS.findOne({ 
                    where: { 
                        stripped: strip_text(name), 
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Menu already exists!');
                });
            }),
        check('start_time')
            .optional({ checkFalsy: false })
            .bail()
            .custom(start_time => {
                const later = moment(start_time, "HH:mm", true);
                return later.isValid();
            })
            .withMessage("Invalid start time format (HH:mm)"),
        check('end_time')
            .optional({ checkFalsy: false })
            .bail()
            .custom(end_time => {
                const later = moment(end_time, "HH:mm", true);
                return later.isValid();
            })
            .withMessage("Invalid end time format (HH:mm)"),
    ],
    forEditing: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom((name, { req }) => {
                return MENUS.findOne({
                    where: {
                        stripped: strip_text(name),
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (data) return Promise.reject('Menu already exists!');
                });
            })
    ],
    forUpdatingMenuDuration: [
        check('start_time')
            .optional({ checkFalsy: false })
            .bail()
            .custom(start_time => {
                const later = moment(start_time, "HH:mm", true);
                return later.isValid() || start_time === null;
            })
            .withMessage("Invalid start time format (HH:mm)"),
        check('end_time')
            .optional({ checkFalsy: false })
            .bail()
            .custom(end_time => {
                const later = moment(end_time, "HH:mm", true);
                return later.isValid() || end_time === null;
            })
            .withMessage("Invalid end time format (HH:mm)"),
    ]
};  