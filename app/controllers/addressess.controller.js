import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, false_status, tag_admin, true_status } from '../config/config.js';
import db from "../models/index.js";
import { addUserNotification } from './notifications.controller.js';

const ADDRESSESS = db.addressess;
const USERS = db.users;
const Op = db.Sequelize.Op;

export function rootGetAddressess(req, res) {
    ADDRESSESS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            }
        ]
    }).then(addressess => {
        if (!addressess || addressess.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Addressess Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Addressess loaded" }, addressess);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetDefaultAddressess(req, res) {
    ADDRESSESS.findAndCountAll({
        attributes: { exclude: ['id'] },
        where: {
            default_address: true_status
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            }
        ]
    }).then(addressess => {
        if (!addressess || addressess.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Addressess Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Addressess loaded" }, addressess);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetAddress(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ADDRESSESS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.address_unique_id,
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
                }
            ]
        }).then(address => {
            if (!address) {
                NotFoundError(res, { unique_id: tag_admin, text: "Address not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Address loaded" }, address);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUserAddresses(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    ADDRESSESS.findAndCountAll({
        attributes: { exclude: ['user_unique_id', 'id'] },
        where: {
            user_unique_id
        },
        order: [
            ['default_address', 'ASC'],
            ['createdAt', 'DESC']
        ]
    }).then(addressess => {
        if (!addressess || addressess.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Addressess Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Addressess loaded" }, addressess);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserDefaultAddress(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    ADDRESSESS.findOne({
        attributes: { exclude: ['user_unique_id', 'id'] },
        where: {
            user_unique_id,
            default_address: true_status
        }
    }).then(address => {
        if (!address) {
            NotFoundError(res, { unique_id: user_unique_id, text: "Default address not found" }, null);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Default address loaded" }, address);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserAddress(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        ADDRESSESS.findOne({
            attributes: { exclude: ['user_unique_id', 'id'] },
            where: {
                ...payload,
                user_unique_id
            }
        }).then(address => {
            if (!address) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Address not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Address loaded" }, address);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function addUserAddress(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const address_count = await ADDRESSESS.count({ where: { user_unique_id } });

            const addressess = await db.sequelize.transaction((t) => {
                return ADDRESSESS.create({
                    unique_id: uuidv4(),
                    user_unique_id,
                    ...payload,
                    default_address: address_count === 0 ? true_status : false_status,
                    status: default_status
                }, { transaction: t });
            });

            if (addressess) {
                const notification_data = {
                    user_unique_id,
                    type: "Address",
                    action: "Created new address successfully!"
                };
                addUserNotification(req, res, notification_data);
                CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Address created successfully!" });
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateUserAddress(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const address = await db.sequelize.transaction((t) => {
                return ADDRESSESS.update({
                    ...payload
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (address > 0) {
                const notification_data = {
                    user_unique_id,
                    type: "Address",
                    action: "Updated address details successfully!"
                };
                addUserNotification(req, res, notification_data);
                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Address was updated successfully!" });
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error updating address details!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function changeUserDefaultAddress(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const not_default_address = await db.sequelize.transaction((t) => {
                return ADDRESSESS.update({
                    default_address: false_status
                }, {
                    where: {
                        unique_id: {
                            [Op.ne]: payload.unique_id,
                        },
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });
            
            const address = await db.sequelize.transaction((t) => {
                return ADDRESSESS.update({
                    default_address: true_status
                }, {
                    where: {
                        unique_id: payload.unique_id,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (address > 0) {
                const notification_data = {
                    user_unique_id,
                    type: "Address",
                    action: "Updated default address successfully!"
                };
                addUserNotification(req, res, notification_data);
                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Default address was updated successfully!" });
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error updating default address!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function deleteUserAddress(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            const addresses = await ADDRESSESS.findOne({
                where: {
                    user_unique_id,
                    default_address: true_status,
                    status: default_status
                },
            });

            if (addresses.unique_id === payload.unique_id) {
                BadRequestError(res, { unique_id: user_unique_id, text: "Error deleting default address!" }, null);
            } else {
                const address = await db.sequelize.transaction((t) => {
                    return ADDRESSESS.destroy({
                        where: {
                            unique_id: payload.unique_id,
                            user_unique_id,
                            status: default_status
                        }
                    }, { transaction: t });
                });
    
                if (address > 0) {
                    const notification_data = {
                        user_unique_id,
                        type: "Address",
                        action: "Deleted address successfully!"
                    };
                    addUserNotification(req, res, notification_data);
                    OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Address was deleted successfully!" });
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Error deleting address!" }, null);
                }
            }

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};
