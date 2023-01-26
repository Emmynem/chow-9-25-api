import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status, anonymous, product_availablity, paginate } from '../config/config.js';
import db from "../models/index.js";

const SEARCH_HISTORY = db.search_history;
const USERS = db.users;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const VENDORS = db.vendors;
const MENUS = db.menus;
const CATEGORIES = db.categories;
const Op = db.Sequelize.Op;

export async function rootGetSearchHistories(req, res) {
    const total_records = await SEARCH_HISTORY.count();
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

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
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(search_histories => {
        if (!search_histories || search_histories.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Search histories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Search histories loaded" }, { ...search_histories, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export async function rootGetSearchHistorySpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await SEARCH_HISTORY.count({ where: { ...payload } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        SEARCH_HISTORY.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(search_histories => {
            if (!search_histories || search_histories.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Search histories Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Search histories loaded" }, { ...search_histories, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getSearchHistories(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const total_records = await SEARCH_HISTORY.count({ where: { user_unique_id } });
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    SEARCH_HISTORY.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt'] },
        where: {
            user_unique_id
        },
        order: [
            ['updatedAt', 'DESC']
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(search_histories => {
        if (!search_histories || search_histories.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Search histories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Search histories loaded" }, { ...search_histories, pages: pagination.pages });
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

        try {
            await db.sequelize.transaction(async (transaction) => {
                
                const last_search_history = await SEARCH_HISTORY.findOne({
                    where: {
                        search: {
                            [Op.like]: `%${payload.search}`
                        },
                        user_unique_id: payload.user_unique_id || '',
                        status: default_status
                    }
                });
        
                const last_general_search_history = await SEARCH_HISTORY.findOne({
                    where: {
                        search: {
                            [Op.like]: `%${payload.search}`
                        },
                        user_unique_id: null,
                        status: default_status
                    }
                });

                const total_records = await PRODUCTS.count({
                    where: {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.or]: {
                                        [Op.like]: `%${payload.search}`,
                                        [Op.startsWith]: `${payload.search}`,
                                        [Op.endsWith]: `${payload.search}`,
                                        [Op.substring]: `${payload.search}`,
                                    }
                                }

                            },
                            {
                                description: {
                                    [Op.or]: {
                                        [Op.substring]: `${payload.search}`
                                    }
                                }

                            }
                        ],
                        status: default_status
                    }
                });
                const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

                const products = await PRODUCTS.findAndCountAll({
                    attributes: { exclude: ['id', 'vendor_user_unique_id', 'status', 'createdAt', 'updatedAt'] },
                    where: {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.or]: {
                                        [Op.like]: `%${payload.search}`,
                                        [Op.startsWith]: `${payload.search}`,
                                        [Op.endsWith]: `${payload.search}`,
                                        [Op.substring]: `${payload.search}`,
                                    }
                                }

                            },
                            {
                                description: {
                                    [Op.or]: {
                                        [Op.substring]: `${payload.search}`
                                    }
                                }

                            }
                        ],
                        status: default_status
                    },
                    order: [
                        ['good_rating', 'DESC'],
                        ['sales_price', 'ASC'],
                        ['favorites', 'DESC'],
                        ['views', 'DESC'],
                        ['remaining', 'DESC'],
                    ],
                    include: [
                        {
                            model: PRODUCT_IMAGES,
                            attributes: ['image']
                        },
                        {
                            model: VENDORS,
                            attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
                        },
                        {
                            model: MENUS,
                            attributes: ['name', 'stripped', 'start_time', 'end_time']
                        },
                        {
                            model: CATEGORIES,
                            attributes: ['name', 'stripped']
                        }
                    ],
                    offset: pagination.start,
                    limit: pagination.limit
                });
                
                if (!products || products.rows.length == 0) {
                    if (payload.user_unique_id) {
                        if (last_search_history) {
                            const updated_search_history_timestamp = await SEARCH_HISTORY.update(
                                {
                                    status: product_availablity.unavailable,
                                }, {
                                    where: {
                                        search: {
                                            [Op.like]: `%${payload.search}`
                                        },
                                        user_unique_id: payload.user_unique_id,
                                        status: default_status
                                    }
                                }
                            );
                        } else {
                            const search_history = await SEARCH_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: payload.user_unique_id || null,
                                    search: payload.search,
                                    status: product_availablity.unavailable
                                }
                            );
                        }
                    } else {
                        if (last_general_search_history) {
                            const updated_general_search_history_timestamp = await SEARCH_HISTORY.update(
                                {
                                    status: product_availablity.unavailable,
                                }, {
                                    where: {
                                        search: {
                                            [Op.like]: `%${payload.search}`
                                        },
                                        user_unique_id: null,
                                        status: default_status
                                    }
                                }
                            );
                        } else {
                            const search_history = await SEARCH_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: payload.user_unique_id || null,
                                    search: payload.search,
                                    status: product_availablity.unavailable
                                }
                            );
                        }
                    }
                    SuccessResponse(res, { unique_id: payload.user_unique_id || anonymous, text: "Products Not found" }, []);
                } else {
                    if (payload.user_unique_id) {
                        if (last_search_history) {
                            const updated_search_history_timestamp = SEARCH_HISTORY.update(
                                {
                                    status: product_availablity.available,
                                }, {
                                    where: {
                                        search: {
                                            [Op.like]: `%${payload.search}`
                                        },
                                        user_unique_id: payload.user_unique_id,
                                        status: default_status
                                    }
                                }
                            );
                        } else {
                            const search_history = SEARCH_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: payload.user_unique_id || null,
                                    search: payload.search,
                                    status: product_availablity.available
                                }
                            );
                        }
                    } else {
                        if (last_general_search_history) {
                            const updated_general_search_history_timestamp = SEARCH_HISTORY.update(
                                {
                                    status: product_availablity.available,
                                }, {
                                    where: {
                                        search: {
                                            [Op.like]: `%${payload.search}`
                                        },
                                        user_unique_id: null,
                                        status: default_status
                                    }
                                }
                            );
                        } else {
                            const search_history = SEARCH_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: payload.user_unique_id || null,
                                    search: payload.search,
                                    status: product_availablity.available
                                }
                            );
                        }
                    }
                    SuccessResponse(res, { unique_id: payload.user_unique_id || anonymous, text: "Products loaded" }, { ...products, pages: pagination.pages });
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id || anonymous, text: err.message }, null);
        }
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
            await db.sequelize.transaction(async (transaction) => {
                
                const search_history = await SEARCH_HISTORY.destroy(
                    {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        },
                        transaction
                    }
                );
    
                if (search_history > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Search History was deleted successfully!" });
                } else {
                    throw new Error("Error deleting search history");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
