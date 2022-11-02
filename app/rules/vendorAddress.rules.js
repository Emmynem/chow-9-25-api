import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const VENDORS = db.vendors;
const VENDOR_ADDRESS = db.vendor_address;

export const vendor_address_rules = {
    forFindingVendorAddress: [
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
                return VENDOR_ADDRESS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor Address not found!');
                });
            })
    ],
    forFindingVendorAddressFalsy: [
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
                return VENDOR_ADDRESS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Vendor Address not found!');
                });
            })
    ],
    forFindingVendorAddressAlt: [
        check('vendor_address_unique_id', "Vendor Address Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_address_unique_id => {
                return VENDOR_ADDRESS.findOne({ where: { unique_id: vendor_address_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor Address not found!');
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
                const vendor_address_count = await VENDOR_ADDRESS.count({ where: { vendor_unique_id } });
                if (vendor_address_count >= 1) return Promise.reject('Max addressess reached!');
            }),
        check('address', "Address is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('additional_information')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('city', "City is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('state', "State is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('country', "Country is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forUpdatingDetails: [
        check('address', "Address is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('additional_information')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('city', "City is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('state', "State is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('country', "Country is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ]
};  