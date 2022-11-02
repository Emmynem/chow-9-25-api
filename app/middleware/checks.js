import jwt from "jsonwebtoken";
import { secret } from "../config/config.js";
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import db from "../models/index.js";
import { 
    access_granted, access_suspended, default_delete_status, tag_admin_api_key, tag_external_api_key, 
    tag_internal_api_key, chow_925_header_key, chow_925_header_token
} from "../config/config.js";

const { verify } = jwt;
const USERS = db.users;
const VENDOR_USERS = db.vendor_users;
const VENDORS = db.vendors;
const RIDERS = db.riders;
const API_KEYS = db.api_keys;

const verifyToken = (req, res, next) => {
    let token = req.headers[`${chow_925_header_token}`] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.UNIQUE_ID = decoded.unique_id;
                    next();
                }
            }
        });
    }
};

const verifyKey = (req, res, next) => {
    const key = req.headers[`${chow_925_header_key}`] || req.query.key || req.body.key || '';
    if (!key) {
        ForbiddenError(res, "No key provided!", null);
    } else {
        req.API_KEY = key;
        next();
    }
};

const verifyVendorToken = (req, res, next) => {
    let token = req.headers[`${chow_925_header_token}`] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.vendor_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.VENDOR_UNIQUE_ID = decoded.vendor_unique_id;
                    req.body.vendor_unique_id = decoded.vendor_unique_id;
                    next();
                }
            }
        });
    }
};

const verifyRiderToken = (req, res, next) => {
    let token = req.headers[`${chow_925_header_token}`] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.rider_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.RIDER_UNIQUE_ID = decoded.rider_unique_id;
                    req.body.rider_unique_id = decoded.rider_unique_id;
                    next();
                }
            }
        });
    }
};

const verifyVendorUserToken = (req, res, next) => {
    let token = req.headers[`${chow_925_header_token}`] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.vendor_user_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.VENDOR_USER_UNIQUE_ID = decoded.vendor_user_unique_id;
                    req.body.vendor_user_unique_id = decoded.vendor_user_unique_id;
                    next();
                }
            }
        });
    }
};

const isUser = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.UNIQUE_ID
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.body.user_unique_id = user.unique_id;
            next();
        }
    });
};

const isVendor = (req, res, next) => {
    VENDORS.findOne({
        where: {
            unique_id: req.VENDOR_UNIQUE_ID
        }
    }).then(vendor => {
        if (!vendor) {
            ForbiddenError(res, "Require Vendor!", null);
        } else if (vendor.status === default_delete_status) {
            ForbiddenError(res, "Vendor not available!", null);
        } else if (vendor.access != access_granted) {
            const err = vendor.access === access_suspended ? "Vendor access is suspended" : "Vendor access is revoked";
            ForbiddenError(res, err, null);
        } else {
            next();
        }
    });
};

const isVendorUser = (req, res, next) => {
    VENDOR_USERS.findOne({
        where: {
            unique_id: req.VENDOR_USER_UNIQUE_ID
        }
    }).then(vendor_user => {
        if (!vendor_user) {
            ForbiddenError(res, "Require Vendor User!", null);
        } else if (vendor_user.status === default_delete_status) {
            ForbiddenError(res, "Vendor User not available!", null);
        } else if (vendor_user.access != access_granted) {
            const err = vendor_user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.VENDOR_UNIQUE_ID = vendor_user.vendor_unique_id;
            req.body.vendor_unique_id = vendor_user.vendor_unique_id;
            next();
        }
    });
};

const isRider = (req, res, next) => {
    RIDERS.findOne({
        where: {
            unique_id: req.RIDER_UNIQUE_ID
        }
    }).then(rider => {
        if (!rider) {
            ForbiddenError(res, "Require Vendor User!", null);
        } else if (rider.status === default_delete_status) {
            ForbiddenError(res, "Vendor User not available!", null);
        } else if (rider.access != access_granted) {
            const err = rider.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.body.rider_unique_id = rider.unique_id;
            next();
        }
    });
};

const isAdministratorKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_admin_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_admin_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const isInternalKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_internal_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_internal_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

const isExternalKey = (req, res, next) => {
    API_KEYS.findOne({
        where: {
            type: tag_external_api_key,
            api_key: req.API_KEY
        }
    }).then(api_key => {
        if (!api_key) {
            ForbiddenError(res, `Require ${tag_external_api_key} key!`, null);
        } else if (api_key.status === default_delete_status) {
            ForbiddenError(res, "Api key not available!", null);
        } else {
            next();
        }
    });
};

export default {
    verifyKey,
    verifyVendorToken,
    verifyVendorUserToken,
    verifyToken,
    isVendor,
    isVendorUser,
    isUser,
    isRider,
    isAdministratorKey,
    isInternalKey,
    isExternalKey
};