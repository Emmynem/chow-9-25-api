import { check } from 'express-validator';
import db from "../models/index.js";
import { check_length_TEXT, default_status } from '../config/config.js';

const USERS = db.users;
const NOTIFICATIONS = db.notifications;

export const notification_rules = {
    forFindingNotification: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail() 
            .custom((unique_id, {req}) => {
                return NOTIFICATIONS.findOne({ 
                    where: { 
                        unique_id, 
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || '', 
                        status: default_status 
                    } 
                }).then(data => {
                    if (!data) return Promise.reject('Notification not found!');
                });
            })
    ],
    forFindingNotificationAlt: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return NOTIFICATIONS.findOne({
                    where: {
                        unique_id,
                        user_unique_id: req.query.user_unique_id || req.body.user_unique_id || req.UNIQUE_ID || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Notification not found!');
                });
            })
    ],
    forAdding: [
        check('user_unique_id', "User Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(user_unique_id => {
                return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('User not found!');
                });
            }),
        check('type', "Type is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 20 })
            .withMessage("Invalid length (3 - 20) characters"),
        check('action', "Action is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters"),
        check('details')
            .optional({ checkFalsy: false })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`)
    ],
};  