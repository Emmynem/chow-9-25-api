import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status } from '../config/config.js';
import db from "../models/index.js";

const MENUS = db.menus;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const PRODUCTS = db.products;
const Op = db.Sequelize.Op;

export function rootGetMenus(req, res) {
    MENUS.findAndCountAll({
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
    }).then(menus => {
        if (!menus || menus.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Menus Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Menus loaded" }, menus);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetMenu(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        MENUS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.menu_unique_id,
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
        }).then(menu => {
            if (!menu) {
                NotFoundError(res, { unique_id: tag_admin, text: "Menu not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Menu loaded" }, menu);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getMenus(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        MENUS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id'] },
            where: {
                vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(menus => {
            if (!menus || menus.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Menus Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Menus loaded" }, menus);
            }
        }).catch(err => {
            ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
        });
    }
};

export async function getMenu(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            MENUS.findOne({
                attributes: { exclude: ['vendor_unique_id', 'id'] },
                where: {
                    vendor_unique_id,
                    ...payload,
                    status: default_status
                }
            }).then(menu => {
                if (!menu) {
                    NotFoundError(res, { unique_id: vendor_unique_id, text: "Menu not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: vendor_unique_id, text: "Menu loaded" }, menu);
                }
            }).catch(err => {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            });
        }
    }
};

export async function addMenu(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {
                    
                    const menu_name = payload.name;
                    const stripped = strip_text(menu_name);
    
                    const menu = await MENUS.create(
                        {
                            unique_id: uuidv4(),
                            vendor_unique_id,
                            vendor_user_unique_id,
                            name: menu_name,
                            stripped,
                            ...payload,
                            status: default_status
                        }, { transaction }
                    );
    
                    if (menu) {
                        CreationSuccessResponse(res, { unique_id: vendor_unique_id, text: "Menu created successfully!" });
                    } else {
                        throw new Error("Error creating menu");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateMenuName(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {
                    
                    const menu_name = payload.name;
                    const stripped = strip_text(menu_name);
    
                    const menu = await MENUS.update(
                        {
                            name: menu_name,
                            stripped,
                            vendor_user_unique_id,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            }, 
                            transaction
                        }
                    );
    
                    if (menu > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Menu was updated successfully!" });
                    } else {
                        throw new Error("Error updating menu");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function updateMenuDuration(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {
                    
                    const menu = await MENUS.update(
                        {
                            ...payload,
                            vendor_user_unique_id,
                        }, {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (menu > 0) {
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Menu duration was updated successfully!" });
                    } else {
                        throw new Error("Error updating menu duration");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function deleteMenu(req, res) {
    const vendor_unique_id = req.VENDOR_UNIQUE_ID;
    const vendor_user_unique_id = req.VENDOR_USER_UNIQUE_ID;

    const vendor_user_routes = await VENDOR_USERS.findOne({
        where: {
            unique_id: vendor_user_unique_id,
            vendor_unique_id,
            status: default_status
        }
    });

    if (!check_user_route(req.method, url_path_without_limits(req.path), vendor_user_routes.routes)) {
        BadRequestError(res, { unique_id: vendor_unique_id, text: "You don't have access to perform this action!" }, null);
    } else {
        const errors = validationResult(req);
        const payload = matchedData(req);

        if (!errors.isEmpty()) {
            ValidationError(res, { unique_id: vendor_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {
                    
                    const menu = await MENUS.destroy(
                        {
                            where: {
                                unique_id: payload.unique_id,
                                vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        }
                    );
    
                    if (menu > 0) {
                        const products = await PRODUCTS.update(
                            {
                                menu_unique_id: null
                            }, {
                                where: {
                                    menu_unique_id: payload.unique_id,
                                    vendor_unique_id
                                }, 
                                transaction
                            }
                        );
                        OtherSuccessResponse(res, { unique_id: vendor_unique_id, text: "Menu was deleted successfully!" });
                    } else {
                        throw new Error("Error deleting menu");
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};
