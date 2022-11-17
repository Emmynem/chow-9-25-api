import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status } from '../config/config.js';
import db from "../models/index.js";

const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const Op = db.Sequelize.Op;

export function rootGetRidersShipping(req, res) {
    RIDER_SHIPPING.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: RIDERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'verification', 'profile_image']
            }
        ]
    }).then(riders_shipping => {
        if (!riders_shipping || riders_shipping.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Shipping Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Riders Shipping loaded" }, riders_shipping);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetRiderShipping(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        RIDER_SHIPPING.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.rider_shipping_unique_id,
            },
            include: [
                {
                    model: RIDERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'verification', 'profile_image']
                }
            ]
        }).then(rider_shipping => {
            if (!rider_shipping) {
                NotFoundError(res, { unique_id: tag_admin, text: "Rider Shipping not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Rider Shipping loaded" }, rider_shipping);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getRiderShippings(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    RIDER_SHIPPING.findAndCountAll({
        attributes: { exclude: ['id', 'rider_unique_id'] },
        where: {
            rider_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(rider_shipping => {
        if (!rider_shipping || rider_shipping.length == 0) {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Shipping Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Shipping loaded" }, rider_shipping);
        }
    }).catch(err => {
        ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
    });
};

export async function getRiderShipping(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDER_SHIPPING.findOne({
            attributes: { exclude: ['rider_unique_id', 'id'] },
            where: {
                rider_unique_id,
                ...payload,
                status: default_status
            }
        }).then(rider_shipping => {
            if (!rider_shipping) {
                NotFoundError(res, { unique_id: rider_unique_id, text: "Rider Shipping not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: rider_unique_id, text: "Rider Shipping loaded" }, rider_shipping);
            }
        }).catch(err => {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        });
    }
};

export async function addRiderShipping(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            
            const existing_rider_shipping = await RIDER_SHIPPING.findOne({
                where: {
                    rider_unique_id: rider_unique_id,
                    min_weight: payload.min_weight,
                    max_weight: payload.max_weight,
                    city: payload.city,
                    state: payload.state,
                    country: payload.country,
                    status: default_status
                }
            });

            if (existing_rider_shipping) {
                BadRequestError(res, { unique_id: rider_unique_id, text: "Exact shipping already exists!" }, null);
            } else {
                const rider_shipping = await db.sequelize.transaction((t) => {
                    return RIDER_SHIPPING.create({
                        unique_id: uuidv4(),
                        rider_unique_id,
                        ...payload,
                        status: default_status
                    }, { transaction: t });
                });
    
                if (rider_shipping) {
                    CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping created successfully!" });
                } else {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Error adding shipping!" }, null);
                }
            }
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateRiderShipping(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const rider_shipping = await db.sequelize.transaction((t) => {
                return RIDER_SHIPPING.update({
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider_shipping > 0) {
                OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping was updated successfully!" });
            } else {
                BadRequestError(res, { unique_id: rider_unique_id, text: "Error updating shipping!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function deleteRiderShipping(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const rider_shipping = await db.sequelize.transaction((t) => {
                return RIDER_SHIPPING.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        rider_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (rider_shipping > 0) {
                OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping was deleted successfully!" });
            } else {
                BadRequestError(res, { unique_id: rider_unique_id, text: "Error deleting shipping!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};
