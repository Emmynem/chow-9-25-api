import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, CreationSuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { 
    access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, tag_admin, super_admin_routes,
    url_path_without_limits, check_user_route 
} from '../config/config.js';
import db from "../models/index.js";

const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const Op = db.Sequelize.Op;

export function rootGetVendorUsers(req, res) {
    VENDOR_USERS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
            }
        ]
    }).then(vendor_users => {
        if (!vendor_users || vendor_users.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Users Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Vendor Users loaded" }, vendor_users);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetVendorUser(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        VENDOR_USERS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.vendor_user_unique_id
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
                }
            ]
        }).then(vendor_user => {
            if (!vendor_user) {
                NotFoundError(res, { unique_id: tag_admin, text: "Vendor User not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Vendor User loaded" }, vendor_user);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getVendorUsers(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });
    
    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        VENDOR_USERS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id'] },
            where: {
                vendor_unique_id,
                unique_id: {
                    [Op.ne]: vendor_user_unique_id
                },
                routes: {
                    [Op.ne]: super_admin_routes
                }
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(vendor_users => {
            if (!vendor_users || vendor_users.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Users Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor Users loaded" }, vendor_users);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getVendorUser(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                VENDOR_USERS.findOne({
                    attributes: { exclude: ['unique_id', 'id'] },
                    where: {
                        vendor_unique_id,
                        ...payload,
                        status: default_status
                    }
                }).then(vendor_user => {
                    if (!vendor_user) {
                        NotFoundError(res, { unique_id: vendor_unique_id, text: "Vendor User not found" }, null);
                    } else if (vendor_user.routes === super_admin_routes) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't view this result!" }, null);
                    } else {
                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User loaded" }, vendor_user);
                    }
                }).catch(err => {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                });
            }
        }
    }
};

export function getVendorUserDetails(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    VENDOR_USERS.findOne({
        attributes: { exclude: ['unique_id', 'id', 'access'] },
        where: {
            vendor_unique_id,
            unique_id: vendor_user_unique_id,
            status: default_status
        }
    }).then(vendor_user => {
        if (!vendor_user) {
            NotFoundError(res, { unique_id: vendor_unique_id, text: "Vendor User not found" }, null);
        } else {
            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User loaded" }, vendor_user);
        }
    }).catch(err => {
        ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
    });
};

export async function addVendorUser(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {

                    const vendor_users = await VENDOR_USERS.create(
                        {
                            unique_id: uuidv4(),
                            vendor_unique_id,
                            ...payload,
                            routes: JSON.stringify(payload.routes),
                            access: access_granted,
                            status: default_status
                        }, { transaction }
                    );
        
                    if (vendor_users) {
                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User created successfully!" });
                    } else {
                        throw new Error("Error creating vendor user");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }   
};

export async function updateVendorUserProfileDetails(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {
    
                const vendor_user = await VENDOR_USERS.update(
                    { 
                        ...payload 
                    }, {
                        where: {
                            vendor_unique_id,
                            unique_id: vendor_user_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
        
                if (vendor_user > 0) {
                    SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User profile details updated successfully!" });
                } else {
                    throw new Error("Vendor User not found");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        }
    }
};

export async function updateVendorUserDetails(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            { 
                                ...payload 
                            }, {
                                where: {
                                    vendor_unique_id,
                                    unique_id: payload.unique_id,
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User details updated successfully!" });
                        } else {
                            throw new Error("Vendor User not found");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }
};

export async function updateVendorUserRoutes(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            { 
                                routes: JSON.stringify(payload.routes) 
                            }, {
                                where: {
                                    vendor_unique_id,
                                    unique_id: payload.unique_id,
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User routes updated successfully!" });
                        } else {
                            throw new Error("Vendor User not found");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }
};

export async function updateVendorUserAccessGranted(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            {
                                access: access_granted
                            }, {
                                where: {
                                    vendor_unique_id,
                                    unique_id: payload.unique_id,
                                    access: {
                                        [Op.ne]: access_granted
                                    },
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User's access was granted successfully!" });
                        } else {
                            throw new Error("Vendor User access already granted");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }
};

export async function updateVendorUserAccessSuspended(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            {
                                access: access_suspended
                            }, {
                                where: {
                                    vendor_unique_id,
                                    unique_id: payload.unique_id,
                                    access: {
                                        [Op.ne]: access_suspended
                                    },
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User's access was suspended successfully!" });
                        } else {
                            throw new Error("Vendor User access already suspended");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }   
};

export async function updateVendorUserAccessRevoked(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            {
                                access: access_revoked
                            }, {
                                where: {
                                    vendor_unique_id,
                                    unique_id: payload.unique_id,
                                    access: {
                                        [Op.ne]: access_revoked
                                    },
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            SuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User's access was revoked successfully!" });
                        } else {
                            throw new Error("Vendor User access already revoked");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }   
};

export async function removeVendorUser(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            {
                                status: default_delete_status
                            }, {
                                where: {
                                    unique_id: payload.unique_id,
                                    vendor_unique_id,
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User was removed successfully!" });
                        } else {
                            throw new Error("Error removing vendor user");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }   
};

export async function restoreVendorUser(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.update(
                            {
                                status: default_status
                            }, {
                                where: {
                                    unique_id: payload.unique_id,
                                    vendor_unique_id,
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_delete_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User was restored successfully!" });
                        } else {
                            throw new Error("Error restoring vendor user");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }   
};

export async function deleteVendorUser(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);
    
        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            if (vendor_user_unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: vendor_unique_id, text: "Can't perform action!" }, null);
            } else {
                try {
                    await db.sequelize.transaction(async (transaction) => {
                        const vendor_user = await VENDOR_USERS.destroy(
                            {
                                where: {
                                    unique_id: payload.unique_id,
                                    vendor_unique_id,
                                    routes: {
                                        [Op.ne]: super_admin_routes
                                    },
                                    status: default_status
                                }, 
                                transaction
                            }
                        );
        
                        if (vendor_user > 0) {
                            OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Vendor User was deleted successfully!" });
                        } else {
                            throw new Error("Error deleting vendor user");
                        }
                    });
                } catch (err) {
                    ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
                }
            }
        }
    }   
};
