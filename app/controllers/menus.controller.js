import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, url_path_without_limits, check_user_route, true_status, false_status, strip_text, anonymous, paginate } from '../config/config.js';
import db from "../models/index.js";

const MENUS = db.menus;
const VENDORS = db.vendors;
const VENDOR_USERS = db.vendor_users;
const PRODUCTS = db.products;
const Op = db.Sequelize.Op;

export async function rootGetMenus(req, res) {
    const total_records = await MENUS.count();
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    MENUS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
            },
            {
                model: VENDOR_USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(menus => {
        if (!menus || menus.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Menus Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Menus loaded" }, { ...menus, pages: pagination.pages });
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
    } else {
        MENUS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.menu_unique_id,
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
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

export async function rootGetMenusSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await MENUS.count({ where: { ...payload } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        MENUS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro', 'verification']
                },
                {
                    model: VENDOR_USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(menus => {
            if (!menus || menus.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Menus Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Menus loaded" }, { ...menus, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getMenusByVendorGenerally(req, res) {

    const vendors = await VENDORS.findOne({ where: { stripped: req.params.stripped, status: default_status } });

    if (!vendors) {
        BadRequestError(res, { unique_id: anonymous, text: "Vendor not found!" }, null);
    } else {
        const vendor_menus = await MENUS.findOne({ where: { vendor_unique_id: vendors.unique_id, status: default_status } });

        if (!vendor_menus) {
            BadRequestError(res, { unique_id: anonymous, text: "Vendor Menus not found!" }, null);
        } else {
            const total_records = await MENUS.count({ where: { vendor_unique_id: vendors.unique_id, status: default_status } });
            const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

            MENUS.findAndCountAll({
                attributes: { exclude: ['id', 'vendor_user_unique_id', 'status', 'createdAt', 'updatedAt'] },
                where: {
                    vendor_unique_id: vendors.unique_id,
                    status: default_status
                },
                order: [
                    ['name', 'ASC']
                ],
                include: [
                    {
                        model: VENDORS,
                        attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
                    }
                ],
                offset: pagination.start,
                limit: pagination.limit
            }).then(menus => {
                if (!menus || menus.length == 0) {
                    SuccessResponse(res, { unique_id: anonymous, text: "Menus Not found" }, []);
                } else {
                    SuccessResponse(res, { unique_id: anonymous, text: "Menus loaded" }, { ...menus, pages: pagination.pages });
                }
            }).catch(err => {
                ServerError(res, { unique_id: anonymous, text: err.message }, null);
            });
        }
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
        const total_records = await MENUS.count({ where: { vendor_unique_id } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        MENUS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id'] },
            where: {
                vendor_unique_id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(menus => {
            if (!menus || menus.length == 0) {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Menus Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: vendor_unique_id, text: "Menus loaded" }, { ...menus, pages: pagination.pages });
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
