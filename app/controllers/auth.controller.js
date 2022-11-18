import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, CreationSuccessResponse, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../common/index.js';
import { access_granted, access_revoked, access_suspended, secret, default_status, false_status, default_profile_image, user_documents_path, platform_documents_path, unverified_status, strip_text, 
    random_uuid, vendor_access_url, api_key_start, save_document_domain, default_platform_image, super_admin_routes, random_numbers, true_status, validate_future_end_date, save_image_dir, default_cover_image, 
    user_refferal_access_url, zero} from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';

const USERS = db.users;
const PRIVATES = db.privates;
const REFERRALS = db.referrals;
const USER_ACCOUNT = db.user_account;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const VENDOR_ACCOUNT = db.vendor_account;
const RIDERS = db.riders;
const RIDER_ACCOUNT = db.rider_account;
const OTPS = db.otps;

const { sign } = jwt;
const { hashSync } = bycrypt;
const { compareSync } = bycrypt;
const { existsSync, mkdirSync } = fs;

export async function userSignUp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const users = await db.sequelize.transaction((t) => {
                return USERS.create({
                    unique_id: uuidv4(),
                    ...payload,
                    email_verification: false_status,
                    mobile_number_verification: false_status,
                    user_private: hashSync(payload.password, 8),
                    profile_image_base_url: save_document_domain,
                    profile_image_dir: save_image_dir,
                    profile_image: default_profile_image,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            const user_account = await db.sequelize.transaction((t) => {
                return USER_ACCOUNT.create({
                    unique_id: uuidv4(),
                    user_unique_id: users.unique_id,
                    balance: zero,
                    status: default_status
                }, { transaction: t });
            });

            const privates = await db.sequelize.transaction((t) => {
                return PRIVATES.create({
                    unique_id: uuidv4(),
                    user_unique_id: users.unique_id,
                    private: payload.password,
                    status: default_status
                }, { transaction: t });
            });

            const referred_by = req.params.ref || payload.ref;

            const user = await USERS.findOne({
                where: {
                    unique_id: referred_by,
                    status: default_status
                },
            });

            const referrals = await db.sequelize.transaction((t) => {
                return REFERRALS.create({
                    unique_id: uuidv4(),
                    referral_user_unique_id: !user ? "Default" : referred_by,
                    user_unique_id: users.unique_id,
                    referral_link: user_refferal_access_url + users.unique_id,
                    status: default_status
                }, { transaction: t });
            });

            if (users && user_account) {
                const folder_name = user_documents_path + users.unique_id;
                if (!existsSync(folder_name)) mkdirSync(folder_name);
                if (existsSync(folder_name)) {
                    const notification_data = {
                        user_unique_id: users.unique_id,
                        type: "Signup",
                        action: "Signed up successfully!"
                    };
                    addUserNotification(req, res, notification_data);
                    CreationSuccessResponse(res, { unique_id: users.unique_id, text: "User signed up successfully!" });
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function userSigninViaEmail(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const user = await USERS.findOne({
                where: {
                    email: payload.email,
                    status: default_status
                },
            });

            if (!user) {
                NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
            } else if (user.access === access_suspended) {
                ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
            } else if (user.access === access_revoked) {
                ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
            } else if (user.email_verification === unverified_status) {
                ForbiddenError(res, { unique_id: payload.email, text: "Unverified email" }, null);
            } else {
                const passwordIsValid = compareSync(payload.password, user.user_private);

                if (!passwordIsValid) {
                    UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
                } else {
                    const token = sign({ unique_id: user.unique_id }, secret, {
                        expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                    });

                    const notification_data = {
                        user_unique_id: user.unique_id,
                        type: "Signin",
                        action: "Signed in successfully via email!"
                    };
                    addUserNotification(req, res, notification_data);

                    const return_data = {
                        token,
                        fullname: user.firstname + (user.middlename !== null ? " " + user.middlename + " " : " ") + user.lastname,
                        email: user.email,
                    };
                    SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function userSigninViaMobile(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const user = await USERS.findOne({
                where: {
                    mobile_number: payload.mobile_number,
                    status: default_status
                },
            });

            if (!user) {
                NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
            } else if (user.access === access_suspended) {
                ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account has been suspended" }, null);
            } else if (user.access === access_revoked) {
                ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account access has been revoked" }, null);
            } else if (user.mobile_number_verification === unverified_status) {
                ForbiddenError(res, { unique_id: payload.mobile_number, text: "Unverified mobile number" }, null);
            } else {
                const passwordIsValid = compareSync(payload.password, user.user_private);

                if (!passwordIsValid) {
                    UnauthorizedError(res, { unique_id: payload.mobile_number, text: "Invalid Password!" }, null);
                } else {
                    const token = sign({ unique_id: user.unique_id }, secret, {
                        expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                    });

                    const notification_data = {
                        user_unique_id: user.unique_id,
                        type: "Signin",
                        action: "Signed in successfully via mobile number!"
                    };
                    addUserNotification(req, res, notification_data);

                    const return_data = {
                        token,
                        fullname: user.firstname + (user.middlename !== null ? " " + user.middlename + " " : " ") + user.lastname,
                        mobile_number: user.mobile_number,
                    };
                    SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
        }
    }
};

export async function userPasswordRecovery(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (payload.email) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const user = await USERS.findOne({
                    where: {
                        email: payload.email,
                        status: default_status
                    },
                });
    
                if (!user) {
                    NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
                } else if (user.access === access_suspended) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
                } else if (user.access === access_revoked) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
                } else {
                    const new_password = random_uuid(5);

                    const update_password = await db.sequelize.transaction((t) => {
                        return USERS.update({ 
                            user_private: hashSync(new_password, 8)
                        }, {
                            where: {
                                unique_id: user.unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    })

                    if (update_password > 0) {
                        const privates = await db.sequelize.transaction((t) => {
                            return PRIVATES.create({
                                unique_id: uuidv4(),
                                user_unique_id: user.unique_id,
                                private: new_password,
                                status: default_status
                            }, { transaction: t });
                        });

                        if (privates) {
                            // *#*Don't forget to send the new_password as an email to the user instead of returning it here after the message
                            SuccessResponse(res, { unique_id: user.unique_id, text: "User's password changed successfully!" }, { access: new_password });
                        } else {
                            BadRequestError(res, { unique_id: user.unique_id, text: "Error saving new password!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: user.unique_id, text: "Error generating password!" }, null);
                    }
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.email, text: err.message }, null);
            }
        }
    } else if (payload.mobile_number) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const user = await USERS.findOne({
                    where: {
                        mobile_number: payload.mobile_number,
                        status: default_status
                    },
                });

                if (!user) {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
                } else if (user.access === access_suspended) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account has been suspended" }, null);
                } else if (user.access === access_revoked) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account access has been revoked" }, null);
                } else {
                    const new_password = random_uuid(5);

                    const update_password = await db.sequelize.transaction((t) => {
                        return USERS.update({
                            user_private: hashSync(new_password, 8)
                        }, {
                            where: {
                                unique_id: user.unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    })

                    if (update_password > 0) {
                        const privates = await db.sequelize.transaction((t) => {
                            return PRIVATES.create({
                                unique_id: uuidv4(),
                                user_unique_id: user.unique_id,
                                private: new_password,
                                status: default_status
                            }, { transaction: t });
                        });

                        if (privates) {
                            // *#*Don't forget to send the new_password as an email to the user instead of returning it here after the message
                            SuccessResponse(res, { unique_id: user.unique_id, text: "User's password changed successfully!" }, { access: new_password });
                        } else {
                            BadRequestError(res, { unique_id: user.unique_id, text: "Error saving new password!" }, null);
                        }
                    } else {
                        BadRequestError(res, { unique_id: user.unique_id, text: "Error generating password!" }, null);
                    }
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
            }
        }
    } else {
        ValidationError(res, "Valid email or mobile number is required", null)
    }
};

export async function userChangePassword(req, res) {
    const user_unique_id = req.UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const user = await USERS.findOne({
                where: {
                    unique_id: user_unique_id,
                    status: default_status
                },
            });

            if (!user) {
                NotFoundError(res, { unique_id: user_unique_id, text: "User not found" }, null);
            } else if (user.access === access_suspended) {
                ForbiddenError(res, { unique_id: user_unique_id, text: "Account has been suspended" }, null);
            } else if (user.access === access_revoked) {
                ForbiddenError(res, { unique_id: user_unique_id, text: "Account access has been revoked" }, null);
            } else {
                const passwordIsValid = compareSync(payload.oldPassword, user.user_private);

                if (!passwordIsValid) {
                    UnauthorizedError(res, { unique_id: user_unique_id, text: "Invalid Old Password!" }, null);
                } else {
                    const _privates = await PRIVATES.findOne({
                        where: {
                            user_unique_id,
                            private: payload.password,
                            status: default_status
                        },
                    });

                    if (_privates) {
                        BadRequestError(res, { unique_id: user.unique_id, text: "Password used already!" }, null);
                    } else {
                        const update_password = await db.sequelize.transaction((t) => {
                            return USERS.update({
                                user_private: hashSync(payload.password, 8)
                            }, {
                                where: {
                                    unique_id: user.unique_id,
                                    status: default_status
                                }
                            }, { transaction: t });
                        })

                        if (update_password > 0) {
                            const privates = await db.sequelize.transaction((t) => {
                                return PRIVATES.create({
                                    unique_id: uuidv4(),
                                    user_unique_id: user.unique_id,
                                    private: payload.password,
                                    status: default_status
                                }, { transaction: t });
                            });

                            if (privates) {
                                SuccessResponse(res, { unique_id: user.unique_id, text: "User's password changed successfully!" }, null);
                            } else {
                                BadRequestError(res, { unique_id: user.unique_id, text: "Error saving new password!" }, null);
                            }
                        } else {
                            BadRequestError(res, { unique_id: user.unique_id, text: "Error creating password!" }, null);
                        }
                    }
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function vendorSignUp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const vendor_name = payload.name;
            const stripped = strip_text(vendor_name);

            const vendors = await db.sequelize.transaction((t) => {
                return VENDORS.create({
                    unique_id: uuidv4(),
                    name: vendor_name,
                    stripped,
                    email: payload.email,
                    description: payload.description,
                    access_url: vendor_access_url + stripped,
                    opening_hours: payload.opening_hours === undefined ? null : payload.opening_hours,
                    closing_hours: payload.closing_hours === undefined ? null : payload.closing_hours,
                    profile_image_base_url: save_document_domain,
                    profile_image_dir: save_image_dir,
                    profile_image: default_platform_image,
                    cover_image_base_url: save_document_domain,
                    cover_image_dir: save_image_dir,
                    cover_image: default_cover_image,
                    pro: false_status,
                    pro_expiring: null,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            const vendor_users = await db.sequelize.transaction((t) => {
                return VENDOR_USERS.create({
                    unique_id: uuidv4(),
                    vendor_unique_id: vendors.unique_id,
                    firstname: payload.firstname,
                    middlename: payload.middlename,
                    lastname: payload.lastname,
                    email: payload.user_email,
                    mobile_number: payload.mobile_number,
                    gender: payload.gender,
                    routes: super_admin_routes,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            const vendor_account = await db.sequelize.transaction((t) => {
                return VENDOR_ACCOUNT.create({
                    unique_id: uuidv4(),
                    vendor_unique_id: vendors.unique_id,
                    balance: zero,
                    service_charge: zero,
                    status: default_status
                }, { transaction: t });
            });

            if (vendors && vendor_users && vendor_account) {
                const folder_name = platform_documents_path + vendors.unique_id;
                if (!existsSync(folder_name)) mkdirSync(folder_name);
                if (existsSync(folder_name)) {
                    CreationSuccessResponse(res, { unique_id: vendors.unique_id, text: "Vendor created successfully!" }, { login_url: vendors.access_url });
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function vendorUserSignin(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (payload.email) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
        }
        else {
            try {
                const vendor = await VENDORS.findOne({ 
                    where: { 
                        stripped: req.params.stripped, 
                        status: default_status 
                    } 
                });

                const vendor_user = await VENDOR_USERS.findOne({
                    where: {
                        vendor_unique_id: vendor.unique_id,
                        email: payload.email,
                        status: default_status
                    },
                });

                if (vendor) {
                    if (!vendor_user) {
                        NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
                    } else if (vendor_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (vendor_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp_expiring = moment().add(5, 'minute').toDate();
                        const otp_expiring_text = moment().add(5, 'minute');
                        const otp_code = random_numbers(6);

                        const otps = db.sequelize.transaction((t) => {
                            return OTPS.create({
                                unique_id: uuidv4(),
                                vendor_unique_id: vendor.unique_id,
                                origin: vendor_user.unique_id,
                                code: otp_code,
                                valid: true_status,
                                expiration: otp_expiring,
                                status: default_status
                            }, { transaction: t });
                        });

                        SuccessResponse(res, { unique_id: vendor_user.unique_id, text: "OTP sent successfully!" }, { expiration: `${otp_expiring_text}` });
                    }
                }
                else {
                    NotFoundError(res, { unique_id: payload.email, text: "Vendor not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.email, text: err.message }, null);
            }
        }
    } else if (payload.mobile_number) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const vendor = await VENDORS.findOne({
                    where: {
                        stripped: req.params.stripped,
                        status: default_status
                    }
                });

                const vendor_user = await VENDOR_USERS.findOne({
                    where: {
                        vendor_unique_id: vendor.unique_id,
                        mobile_number: payload.mobile_number,
                        status: default_status
                    },
                });

                if (vendor) {
                    if (!vendor_user) {
                        NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
                    } else if (vendor_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (vendor_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp_expiring = moment().add(5, 'minute').toDate();
                        const otp_expiring_text = moment().add(5, 'minute');
                        const otp_code = random_numbers(6);

                        const otps = db.sequelize.transaction((t) => {
                            return OTPS.create({
                                unique_id: uuidv4(),
                                vendor_unique_id: vendor.unique_id,
                                origin: vendor_user.unique_id,
                                code: otp_code,
                                valid: true_status,
                                expiration: otp_expiring,
                                status: default_status
                            }, { transaction: t });
                        });

                        SuccessResponse(res, { unique_id: vendor_user.unique_id, text: "OTP sent successfully!" }, { expiration: `${otp_expiring_text}` });
                    }
                } else {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "Vendor not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
            }
        }
    } else {
        ValidationError(res, "Valid email or mobile number is required", null)
    }
};

export async function vendorUserVerifyOtp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (payload.email) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
        }
        else {
            try {
                const vendor = await VENDORS.findOne({ where: { stripped: req.params.stripped, status: default_status } });

                if (vendor) {
                    const vendor_user = await VENDOR_USERS.findOne({
                        where: {
                            vendor_unique_id: vendor.unique_id,
                            email: payload.email,
                            status: default_status
                        },
                    });

                    if (!vendor_user) {
                        NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
                    } else if (vendor_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (vendor_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp = await OTPS.findOne({
                            where: {
                                vendor_unique_id: vendor.unique_id,
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
                                        vendor_unique_id: vendor.unique_id,
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
                                        vendor_unique_id: vendor.unique_id,
                                        origin: vendor_user.unique_id,
                                        code: payload.otp,
                                        status: default_status
                                    }
                                }, { transaction: t });
                            })

                            if (validate_otp > 0) {
                                const token = sign({ vendor_user_unique_id: vendor_user.unique_id }, secret, {
                                    expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                                });

                                const return_data = {
                                    token,
                                    fullname: vendor_user.firstname + (vendor_user.middlename !== null ? " " + vendor_user.middlename + " " : " ") + vendor_user.lastname,
                                    email: vendor_user.email,
                                };
                                SuccessResponse(res, { unique_id: vendor_user.unique_id, text: "Logged in successfully!" }, return_data);
                            } else {
                                BadRequestError(res, { unique_id: vendor_user.unique_id, text: "Error validating OTP!" }, null);
                            }
                        }
                    }
                }
                else {
                    NotFoundError(res, { unique_id: payload.email, text: "Vendor not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.email, text: err.message }, null);
            }
        }
    } else if (payload.mobile_number) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const vendor = await VENDORS.findOne({ where: { stripped: req.params.stripped, status: default_status } });

                if (vendor) {
                    const vendor_user = await VENDOR_USERS.findOne({
                        where: {
                            vendor_unique_id: vendor.unique_id,
                            mobile_number: payload.mobile_number,
                            status: default_status
                        },
                    });

                    if (!vendor_user) {
                        NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
                    } else if (vendor_user.access === access_suspended) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account has been suspended" }, null);
                    } else if (vendor_user.access === access_revoked) {
                        ForbiddenError(res, { unique_id: vendor_user.unique_id, text: "Account access has been revoked" }, null);
                    } else {
                        const otp = await OTPS.findOne({
                            where: {
                                vendor_unique_id: vendor.unique_id,
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
                                        vendor_unique_id: vendor.unique_id,
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
                                        vendor_unique_id: vendor.unique_id,
                                        origin: vendor_user.unique_id,
                                        code: payload.otp,
                                        status: default_status
                                    }
                                }, { transaction: t });
                            })

                            if (validate_otp > 0) {
                                const token = sign({ vendor_user_unique_id: vendor_user.unique_id }, secret, {
                                    expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                                });

                                const return_data = {
                                    token,
                                    fullname: vendor_user.firstname + (vendor_user.middlename !== null ? " " + vendor_user.middlename + " " : " ") + vendor_user.lastname,
                                    mobile_number: vendor_user.mobile_number,
                                };
                                SuccessResponse(res, { unique_id: vendor_user.unique_id, text: "Logged in successfully!" }, return_data);
                            } else {
                                BadRequestError(res, { unique_id: vendor_user.unique_id, text: "Error validating OTP!" }, null);
                            }
                        }
                    }
                } else {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "Vendor not found" }, null);
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
            }
        }
    } else {
        ValidationError(res, "Valid email or mobile number is required", null)
    }
};

export async function riderSignUp(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const riders = await db.sequelize.transaction((t) => {
                return RIDERS.create({
                    unique_id: uuidv4(),
                    ...payload,
                    email_verification: false_status,
                    mobile_number_verification: false_status,
                    rider_private: hashSync(payload.password, 8),
                    profile_image_base_url: save_document_domain,
                    profile_image_dir: save_image_dir,
                    profile_image: default_profile_image,
                    verification: unverified_status,
                    access: access_granted,
                    status: default_status
                }, { transaction: t });
            });

            const rider_account = await db.sequelize.transaction((t) => {
                return RIDER_ACCOUNT.create({
                    unique_id: uuidv4(),
                    rider_unique_id: riders.unique_id,
                    balance: zero,
                    service_charge: zero,
                    status: default_status
                }, { transaction: t });
            });

            if (riders && rider_account) {
                const folder_name = user_documents_path + riders.unique_id;
                if (!existsSync(folder_name)) mkdirSync(folder_name);
                if (existsSync(folder_name)) {
                    CreationSuccessResponse(res, { unique_id: riders.unique_id, text: "Rider signed up successfully!" });
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function riderSigninViaEmail(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const rider = await RIDERS.findOne({
                where: {
                    email: payload.email,
                    status: default_status
                },
            });

            if (!rider) {
                NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
            } else if (rider.access === access_suspended) {
                ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
            } else if (rider.access === access_revoked) {
                ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
            } else if (rider.email_verification === unverified_status) {
                ForbiddenError(res, { unique_id: payload.email, text: "Unverified email" }, null);
            } else {
                const passwordIsValid = compareSync(payload.password, rider.rider_private);

                if (!passwordIsValid) {
                    UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
                } else {
                    const token = sign({ unique_id: rider.unique_id }, secret, {
                        expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                    });

                    const return_data = {
                        token,
                        fullname: rider.firstname + (rider.middlename !== null ? " " + rider.middlename + " " : " ") + rider.lastname,
                        email: rider.email,
                    };
                    SuccessResponse(res, { unique_id: rider.unique_id, text: "Logged in successfully!" }, return_data);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.email, text: err.message }, null);
        }
    }
};

export async function riderSigninViaMobile(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const rider = await RIDERS.findOne({
                where: {
                    mobile_number: payload.mobile_number,
                    status: default_status
                },
            });

            if (!rider) {
                NotFoundError(res, { unique_id: payload.mobile_number, text: "User not found" }, null);
            } else if (rider.access === access_suspended) {
                ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account has been suspended" }, null);
            } else if (rider.access === access_revoked) {
                ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account access has been revoked" }, null);
            } else if (rider.mobile_number_verification === unverified_status) {
                ForbiddenError(res, { unique_id: payload.mobile_number, text: "Unverified mobile number" }, null);
            } else {
                const passwordIsValid = compareSync(payload.password, rider.rider_private);

                if (!passwordIsValid) {
                    UnauthorizedError(res, { unique_id: payload.mobile_number, text: "Invalid Password!" }, null);
                } else {
                    const token = sign({ unique_id: rider.unique_id }, secret, {
                        expiresIn: payload.remember_me ? 2592000 /* 30 days */ : 86400 // 24 hours
                    });
                    
                    const return_data = {
                        token,
                        fullname: rider.firstname + (rider.middlename !== null ? " " + rider.middlename + " " : " ") + rider.lastname,
                        mobile_number: rider.mobile_number,
                    };
                    SuccessResponse(res, { unique_id: rider.unique_id, text: "Logged in successfully!" }, return_data);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
        }
    }
};

export async function riderPasswordRecovery(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (payload.email) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const rider = await RIDERS.findOne({
                    where: {
                        email: payload.email,
                        status: default_status
                    },
                });

                if (!rider) {
                    NotFoundError(res, { unique_id: payload.email, text: "Rider not found" }, null);
                } else if (rider.access === access_suspended) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
                } else if (rider.access === access_revoked) {
                    ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
                } else {
                    const new_password = random_uuid(5);

                    const update_password = await db.sequelize.transaction((t) => {
                        return RIDERS.update({
                            rider_private: hashSync(new_password, 8)
                        }, {
                            where: {
                                unique_id: rider.unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    })

                    if (update_password > 0) {
                        // *#*Don't forget to send the new_password as an email to the rider instead of returning it here after the message
                        SuccessResponse(res, { unique_id: rider.unique_id, text: "Rider's password changed successfully!" }, { access: new_password });
                    } else {
                        BadRequestError(res, { unique_id: rider.unique_id, text: "Error generating password!" }, null);
                    }
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.email, text: err.message }, null);
            }
        }
    } else if (payload.mobile_number) {
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: payload.mobile_number, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                const rider = await RIDERS.findOne({
                    where: {
                        mobile_number: payload.mobile_number,
                        status: default_status
                    },
                });

                if (!rider) {
                    NotFoundError(res, { unique_id: payload.mobile_number, text: "Rider not found" }, null);
                } else if (rider.access === access_suspended) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account has been suspended" }, null);
                } else if (rider.access === access_revoked) {
                    ForbiddenError(res, { unique_id: payload.mobile_number, text: "Account access has been revoked" }, null);
                } else {
                    const new_password = random_uuid(5);

                    const update_password = await db.sequelize.transaction((t) => {
                        return RIDERS.update({
                            rider_private: hashSync(new_password, 8)
                        }, {
                            where: {
                                unique_id: rider.unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    })

                    if (update_password > 0) {
                        // *#*Don't forget to send the new_password as an email to the rider instead of returning it here after the message
                        SuccessResponse(res, { unique_id: rider.unique_id, text: "Rider's password changed successfully!" }, { access: new_password });
                    } else {
                        BadRequestError(res, { unique_id: rider.unique_id, text: "Error generating password!" }, null);
                    }
                }
            } catch (err) {
                ServerError(res, { unique_id: payload.mobile_number, text: err.message }, null);
            }
        }
    } else {
        ValidationError(res, "Valid email or mobile number is required", null)
    }
};

export async function riderChangePassword(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID || payload.rider_unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const rider = await RIDERS.findOne({
                where: {
                    unique_id: rider_unique_id,
                    status: default_status
                },
            });

            if (!rider) {
                NotFoundError(res, { unique_id: rider_unique_id, text: "Rider not found" }, null);
            } else if (rider.access === access_suspended) {
                ForbiddenError(res, { unique_id: rider_unique_id, text: "Account has been suspended" }, null);
            } else if (rider.access === access_revoked) {
                ForbiddenError(res, { unique_id: rider_unique_id, text: "Account access has been revoked" }, null);
            } else {
                const passwordIsValid = compareSync(payload.oldPassword, rider.rider_private);

                if (!passwordIsValid) {
                    UnauthorizedError(res, { unique_id: rider_unique_id, text: "Invalid Old Password!" }, null);
                } else {
                    const update_password = await db.sequelize.transaction((t) => {
                        return RIDERS.update({
                            rider_private: hashSync(payload.password, 8)
                        }, {
                            where: {
                                unique_id: rider.unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    })

                    if (update_password > 0) {
                        SuccessResponse(res, { unique_id: rider.unique_id, text: "Rider's password changed successfully!" }, null);
                    } else {
                        BadRequestError(res, { unique_id: rider.unique_id, text: "Error creating password!" }, null);
                    }
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};
