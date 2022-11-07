import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status } from '../config/config.js';

const VENDORS = db.vendors;

export const otps_rules = {
    forFindingOtp: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            })
    ],
    forFindingVendorOtpViaCode: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('code', "Code is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 6, max: 6 })
            .withMessage("Invalid code length (6 digits required)")
    ],
    forVerifyingOtp: [
        check('otp', "OTP is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 6, max: 6 })
            .withMessage("Invalid OTP length (6 digits required)")
    ]
};  