import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status, anonymous, paginate } from '../config/config.js';
import db from "../models/index.js";

const VIEW_HISTORY = db.view_history;
const USERS = db.users;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const Op = db.Sequelize.Op;

export async function rootGetViewHistories(req, res) {
    const total_records = await VIEW_HISTORY.count();
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    VIEW_HISTORY.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
            },
            {
                model: PRODUCTS,
                attributes: ['name', 'stripped', 'duration', 'weight', 'price', 'sales_price', 'views', 'favorites', 'good_rating', 'bad_rating'],
                include: [
                    {
                        model: PRODUCT_IMAGES,
                        attributes: ['image']
                    }
                ]
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(view_histories => {
        if (!view_histories || view_histories.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "View histories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "View histories loaded" }, { ...view_histories, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export async function rootGetViewHistorySpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        const total_records = await VIEW_HISTORY.count({ where: { ...payload } });
        const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

        VIEW_HISTORY.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                },
                {
                    model: PRODUCTS,
                    attributes: ['name', 'stripped', 'duration', 'weight', 'price', 'sales_price', 'views', 'favorites', 'good_rating', 'bad_rating'],
                    include: [
                        {
                            model: PRODUCT_IMAGES,
                            attributes: ['image']
                        }
                    ]
                }
            ],
            offset: pagination.start,
            limit: pagination.limit
        }).then(view_histories => {
            if (!view_histories || view_histories.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "View histories Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "View histories loaded" }, { ...view_histories, pages: pagination.pages });
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getViewHistories(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const total_records = await VIEW_HISTORY.count({ where: { user_unique_id } });
    const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

    VIEW_HISTORY.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'createdAt'] },
        where: {
            user_unique_id
        },
        order: [
            ['updatedAt', 'DESC']
        ],
        include: [
            {
                model: PRODUCTS,
                attributes: ['name', 'stripped', 'duration', 'weight', 'price', 'sales_price', 'views', 'favorites', 'good_rating', 'bad_rating'],
                include: [
                    {
                        model: PRODUCT_IMAGES,
                        attributes: ['image']
                    }
                ]
            }
        ],
        offset: pagination.start,
        limit: pagination.limit
    }).then(view_histories => {
        if (!view_histories || view_histories.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "View histories Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "View histories loaded" }, { ...view_histories, pages: pagination.pages });
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export async function addViewHistory(req, res, data) {

    let msg;
    let param;
    let return_data = { status: 0 };

    if (data.product_unique_id === "" || data.product_unique_id === undefined) {
        msg = "Product Unique ID is required";
        param = "product_unique_id";
        logger.warn({ unique_id: data.user_unique_id || anonymous, text: `View History | Validation Error Occured - ${param} : ${msg}` });
        return { ...return_data, err: msg };
    } else {
        try {   
            const last_view_history = await VIEW_HISTORY.findOne({
                where: {
                    user_unique_id: data.user_unique_id || null,
                    product_unique_id: data.product_unique_id,
                    status: default_status
                }
            });

            if (last_view_history) {
                const updated_view_history = await VIEW_HISTORY.update(
                    {
                        status: default_status,
                    }, {
                        where: {
                            user_unique_id: data.user_unique_id || null,
                            product_unique_id: data.product_unique_id,
                            status: default_status
                        }
                    }
                );

                if (updated_view_history > 0) {
                    return_data.status = 1;
                    logger.info({ unique_id: data.user_unique_id || anonymous, text: `View History - ${data.product_unique_id}, updated view history` });
                    return { ...return_data, err: null };
                } else {
                    logger.error({ unique_id: data.user_unique_id || anonymous, text: "Error updating view history" });
                    return { ...return_data, err: "Error updating view history" };
                }
            } else {
                const view_history = VIEW_HISTORY.create(
                    {
                        ...data,
                        unique_id: uuidv4(),
                        status: default_status
                    }
                );

                if (view_history) {
                    return_data.status = 1;
                    logger.info({ unique_id: data.user_unique_id || anonymous, text: `View History - ${data.product_unique_id}, added view history` });
                    return { ...return_data, err: null };
                } else {
                    logger.error({ unique_id: data.user_unique_id || anonymous, text: "Error adding view history" });
                    return { ...return_data, err: "Error adding view history" };
                }
            }
        } catch (err) {
            logger.error({ unique_id: data.user_unique_id || anonymous, text: err.message });
            return { ...return_data, err: err.message };
        }
    }
};

export async function deleteViewHistory(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const view_history = await VIEW_HISTORY.destroy(
                    {
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (view_history > 0) {
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "View History was deleted successfully!" });
                } else {
                    throw new Error("Error deleting view history!");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
