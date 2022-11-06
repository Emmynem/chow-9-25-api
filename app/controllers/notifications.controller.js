import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { check_length_TEXT, default_delete_status, default_status, false_status, tag_admin, true_status } from '../config/config.js';
import db from "../models/index.js";

const NOTIFICATIONS = db.notifications;
const USERS = db.users;

export function rootGetNotifications (req, res) {
    NOTIFICATIONS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: USERS,
                attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number']
            }
        ],
    }).then(notifications => {
        if (!notifications || notifications.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Notifications Not found" }, []);
        } else {
            NOTIFICATIONS.count({ where: { seen: false_status } }).then(data => { 
                SuccessResponse(res, { unique_id: tag_admin, text: "Notifications loaded" }, { ...notifications, unread: data });
            });
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function getUserNotifications (req, res) {
    const user_unique_id = req.UNIQUE_ID;

    NOTIFICATIONS.findAndCountAll({
        attributes: { exclude: ['id', 'user_unique_id', 'updatedAt', 'status'] },
        where : {
            user_unique_id,
            status: default_status
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(notifications => {
        if (!notifications || notifications.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Notifications Not found" }, []);
        } else {
            NOTIFICATIONS.count({ where: { user_unique_id, seen: false_status, status: default_status } }).then(data => {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Notifications loaded" }, { ...notifications, unread: data });
            });
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export async function getUserNotification (req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const notification = await db.sequelize.transaction((t) => {
                return NOTIFICATIONS.update({ seen: true_status }, {
                    where: {
                        ...payload,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (notification > 0) {
                NOTIFICATIONS.findOne({
                    attributes: { exclude: ['id', 'user_unique_id', 'updatedAt', 'status'] },
                    where: {
                        ...payload,
                        user_unique_id,
                        status: default_status
                    },
                }).then(notification => {
                    if (!notification) {
                        NotFoundError(res, { unique_id: user_unique_id, text: "Notification not found" }, null);
                    } else {
                        SuccessResponse(res, { unique_id: user_unique_id, text: "Notification loaded" }, notification);
                    }
                })
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Notification not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function addUserNotification(req, res, data) {

    let msg;
    let param;

    if (data.user_unique_id === "" || data.user_unique_id === undefined){
        msg = "User Unique ID is required";
        param = "user_unique_id";
        logger.warn({ unique_id: data.user_unique_id, text: `Notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.type === "" || data.type === undefined) {
        msg = "Type is required";
        param = "type";
        logger.warn({ unique_id: data.user_unique_id, text: `Notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.type.length > 20) {
        msg = "Type max length reached";
        param = "type";
        logger.warn({ unique_id: data.user_unique_id, text: `Notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.action === "" || data.action === undefined) {
        msg = "Action is required";
        param = "action";
        logger.warn({ unique_id: data.user_unique_id, text: `Notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.action.length > 200) {
        msg = "Action max length reached";
        param = "action";
        logger.warn({ unique_id: data.user_unique_id, text: `Notifications | Validation Error Occured - ${param} : ${msg}` });
    } else if ((data.details !== "" && data.details !== undefined) && data.details.length > check_length_TEXT) {
        msg = "Detials max length reached";
        param = "details";
        logger.warn({ unique_id: data.user_unique_id, text: `Notifications | Validation Error Occured - ${param} : ${msg}` });
    } else {
        try {
            await db.sequelize.transaction((t) => {
                const notification = NOTIFICATIONS.create({
                    ...data,
                    unique_id: uuidv4(),
                    seen: false_status,
                    status: default_status
                }, { transaction: t });
                return notification;
            });
            logger.info({ unique_id: data.user_unique_id, text: `Notification - ${data.action}` });
        } catch (err) {
            logger.error({ unique_id: data.user_unique_id, text: err.message });
        }
    }
};

export async function updateUserNotificationSeen (req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const notification = await db.sequelize.transaction((t) => {
                return NOTIFICATIONS.update({ seen: true_status }, {
                    where: {
                        ...payload,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (notification > 0) {
                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Notification read!" });
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Notification not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function removeUserNotification(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const notification = await db.sequelize.transaction((t) => {
                return NOTIFICATIONS.update({ status: default_delete_status }, {
                    where: {
                        ...payload,
                        user_unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (notification > 0) {
                OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Notification deleted!" });
            } else {
                BadRequestError(res, { unique_id: user_unique_id, text: "Notification not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};