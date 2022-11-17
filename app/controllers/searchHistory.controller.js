import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status, anonymous, product_availablity } from '../config/config.js';
import db from "../models/index.js";

const SEARCH_HISTORY = db.search_history;
const USERS = db.users;
const PRODUCTS = db.products;
const Op = db.Sequelize.Op;

export function rootGetSearchHistories(req, res) {
    SEARCH_HISTORY.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
            }
        ]
    }).then(search_histories => {
        if (!search_histories || search_histories.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Search histories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Search histories loaded" }, search_histories);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetSearchHistory(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        SEARCH_HISTORY.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.search_history_unique_id,
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                }
            ]
        }).then(search_history => {
            if (!search_history) {
                NotFoundError(res, { unique_id: tag_admin, text: "Search hisitory not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Search hisitory loaded" }, search_history);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getSearchHistories(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    SEARCH_HISTORY.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt'] },
        where: {
            user_unique_id
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(search_histories => {
        if (!search_histories || search_histories.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Search histories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Search histories loaded" }, search_histories);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export async function searchProducts(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id || anonymous, text: "Validation Error Occured" }, errors.array())
    } else {

        const last_search_history = await SEARCH_HISTORY.findOne({
            where: {
                search: {
                    [Op.like]: `%${payload.search}`
                },
                user_unique_id: payload.user_unique_id,
                status: default_status
            },
        });

        const last_general_search_history = await SEARCH_HISTORY.findOne({
            where: {
                search: {
                    [Op.like]: `%${payload.search}`
                },
                user_unique_id: {
                    [Op.ne]: payload.user_unique_id
                },
                status: default_status
            },
        });

        PRODUCTS.findAndCountAll({
            attributes: { exclude: ['id', 'vendor_unique_id', 'createdAt', 'updatedAt', 'status'] },
            where: {
                name: { 
                    [Op.or]: {
                        [Op.like]: `%${payload.search}`,
                        [Op.startsWith]: `${payload.search}`,
                        [Op.endsWith]: `${payload.search}`,
                        [Op.substring]: `${payload.search}`,
                    }
                }
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
                    model: MENUS,
                    attributes: ['name', 'stripped', 'start_time', 'end_time']
                },
                {
                    model: CATEGORIES,
                    attributes: ['name', 'stripped']
                }
            ]
        }).then(products => {
            if (!products || products.length == 0) {
                if (last_search_history) {
                    const updated_search_history_timestamp = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.update({
                            status: product_availablity.unavailable,
                        }, {
                            where: {
                                search: {
                                    [Op.like]: `%${payload.search}`
                                },
                                user_unique_id: payload.user_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });
                } else {
                    const search_history = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.create({
                            unique_id: uuidv4(),
                            user_unique_id: payload.user_unique_id || null,
                            search: payload.search,
                            status: product_availablity.unavailable
                        }, { transaction: t });
                    });
                }
                if (last_general_search_history) {
                    const updated_general_search_history_timestamp = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.update({
                            status: product_availablity.unavailable,
                        }, {
                            where: {
                                search: {
                                    [Op.like]: `%${payload.search}`
                                },
                                user_unique_id: {
                                    [Op.ne]: payload.user_unique_id
                                },
                                status: default_status
                            }
                        }, { transaction: t });
                    });
                } else {
                    const search_history = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.create({
                            unique_id: uuidv4(),
                            user_unique_id: payload.user_unique_id || null,
                            search: payload.search,
                            status: product_availablity.unavailable
                        }, { transaction: t });
                    });
                }
                SuccessResponse(res, { unique_id: payload.user_unique_id || anonymous, text: "Products Not found" }, []);
            } else {
                if (last_search_history) {
                    const updated_search_history_timestamp = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.update({
                            status: product_availablity.available,
                        }, {
                            where: {
                                search: {
                                    [Op.like]: `%${payload.search}`
                                },
                                user_unique_id: payload.user_unique_id,
                                status: default_status
                            }
                        }, { transaction: t });
                    });
                } else {
                    const search_history = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.create({
                            unique_id: uuidv4(),
                            user_unique_id: payload.user_unique_id || null,
                            search: payload.search,
                            status: product_availablity.available
                        }, { transaction: t });
                    });
                }
                if (last_general_search_history) {
                    const updated_general_search_history_timestamp = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.update({
                            status: product_availablity.available,
                        }, {
                            where: {
                                search: {
                                    [Op.like]: `%${payload.search}`
                                },
                                user_unique_id: {
                                    [Op.ne]: payload.user_unique_id
                                },
                                status: default_status
                            }
                        }, { transaction: t });
                    });
                } else {
                    const search_history = await db.sequelize.transaction((t) => {
                        return SEARCH_HISTORY.create({
                            unique_id: uuidv4(),
                            user_unique_id: payload.user_unique_id || null,
                            search: payload.search,
                            status: product_availablity.available
                        }, { transaction: t });
                    });
                }
                SuccessResponse(res, { unique_id: payload.user_unique_id || anonymous, text: "Products loaded" }, products);
            }
        }).catch(err => {
            ServerError(res, { unique_id: payload.user_unique_id || anonymous, text: err.message }, null);
        });
    }
};

export async function deleteSearchHistory(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const search_history = await db.sequelize.transaction((t) => {
                return SEARCH_HISTORY.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (search_history > 0) {
                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Search History was deleted successfully!" });
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error deleting search history!" }, null);
            }

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
