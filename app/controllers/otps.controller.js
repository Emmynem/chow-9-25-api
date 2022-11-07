import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, false_status, random_numbers, tag_admin, true_status, validate_future_end_date } from '../config/config.js';
import db from "../models/index.js";

const OTPS = db.otps;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

export function rootGetOtps(req, res) {
    OTPS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
            },
            {
                model: VENDOR_USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            }
        ]
    }).then(otps => {
        if (!otps || otps.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Otps Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Otps loaded" }, otps);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetVendorOtps(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        OTPS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where : {
                unique_id: payload.vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                },
                {
                    model: VENDOR_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                }
            ]
        }).then(vendor_otps => {
            if (!vendor_otps || vendor_otps.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Otps Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Otps loaded" }, vendor_otps);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetVendorOtpViaCode(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        OTPS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.vendor_unique_id,
                code: payload.code
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                },
                {
                    model: VENDOR_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                }
            ]
        }).then(vendor_otp => {
            if (!vendor_otp) {
                NotFoundError(res, { unique_id: tag_admin, text: "Vendor Otp not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Otp loaded" }, vendor_otp);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function createOtp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const vendor_user = await VENDOR_USERS.findOne({
                where: {
                    unique_id: payload.vendor_user_unique_id,
                    vendor_unique_id: payload.vendor_unique_id,
                    status: default_status
                }
            });

            const otp_expiring = moment().add(5, 'minute').toDate();
            const otp_expiring_text = moment().add(5, 'minute');
            const otp_code = random_numbers(6);

            const otps = await db.sequelize.transaction((t) => {
                return OTPS.create({
                    unique_id: uuidv4(),
                    vendor_unique_id: payload.vendor_unique_id,
                    origin: payload.vendor_user_unique_id,
                    code: otp_code,
                    valid: true_status,
                    expiration: otp_expiring,
                    status: default_status
                }, { transaction: t });
            });

            if (otps) {
                // Use the vendor_user variable above to get the vendor user email or mobile and send the otp to the user 
                CreationSuccessResponse(res, { unique_id: payload.vendor_user_unique_id, text: "OTP sent successfully!" }, { expiration: `${otp_expiring_text}` });
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_user_unique_id, text: err.message }, null);
        }
    }
};

export async function verifyOtp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.vendor_user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const vendor_user = await VENDOR_USERS.findOne({
                where: {
                    unique_id: payload.vendor_user_unique_id,
                    vendor_unique_id: payload.vendor_unique_id,
                    status: default_status
                }
            });

            const otp = await OTPS.findOne({
                where: {
                    vendor_unique_id: payload.vendor_unique_id,
                    origin: vendor_user.unique_id,
                    code: payload.otp,
                    status: default_status
                },
            });

            if (!otp) {
                NotFoundError(res, { unique_id: vendor_user.unique_id, text: "Invalid OTP" }, null);
            } else if (!otp.valid) {
                ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "OTP invalid" }, null);
            } else if (!validate_future_end_date(moment().toDate(), otp.expiration)) {
                const invalidate_otp = await db.sequelize.transaction((t) => {
                    return OTPS.update({ valid: false_status }, {
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
                            origin: vendor_user.unique_id,
                            code: payload.otp,
                            status: default_status
                        }
                    }, { transaction: t });
                })

                if (invalidate_otp > 0) {
                    ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Expired OTP" }, null);
                } else {
                    BadRequestError(res, { unique_id: vendor_user.unique_id, text: "Error invalidating OTP!" }, null);
                }
            } else {
                const validate_otp = await db.sequelize.transaction((t) => {
                    return OTPS.update({ valid: false_status }, {
                        where: {
                            vendor_unique_id: payload.vendor_unique_id,
                            origin: vendor_user.unique_id,
                            code: payload.otp,
                            status: default_status
                        }
                    }, { transaction: t });
                })

                if (validate_otp > 0) {
                    SuccessResponse(res, { unique_id: vendor_user.unique_id, text: "OTP validated successfully!" }, null);
                } else {
                    BadRequestError(res, { unique_id: vendor_user.unique_id, text: "Error validating OTP!" }, null);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.vendor_user_unique_id, text: err.message }, null);
        }
    }
};