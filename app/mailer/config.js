import { 
    default_delete_status, default_status, false_status, true_status, email_host, no_reply_email,
    no_reply_email_password, notifications_email, notifications_email_password, no_reply_email_name,
    notifications_email_name
} from '../config/config.js';
import db from "../models/index.js";

const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

async function get_defaults() {
    let defaults = {};

    const host_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: email_host.criteria,
            status: default_status
        }
    });

    const no_reply_email_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: no_reply_email.criteria,
            status: default_status
        }
    });

    const no_reply_email_password_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: no_reply_email_password.criteria,
            status: default_status
        }
    });

    const no_reply_email_name_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: no_reply_email_name.criteria,
            status: default_status
        }
    });

    const notifications_email_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: notifications_email.criteria,
            status: default_status
        }
    });

    const notifications_email_password_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: notifications_email_password.criteria,
            status: default_status
        }
    });

    const notifications_email_name_default = await APP_DEFAULTS.findOne({
        where: {
            criteria: notifications_email_name.criteria,
            status: default_status
        }
    });

    defaults.host_default = host_default.value === undefined ? "" : host_default.value;
    defaults.no_reply_email_default = no_reply_email_default.value === undefined ? "" : no_reply_email_default.value;
    defaults.no_reply_email_password_default = no_reply_email_password_default.value === undefined ? "" : no_reply_email_password_default.value;
    defaults.no_reply_email_name_default = no_reply_email_name_default.value === undefined ? "" : no_reply_email_name_default.value;
    defaults.notifications_email_default = notifications_email_default.value === undefined ? "" : notifications_email_default.value;
    defaults.notifications_email_password_default = notifications_email_password_default.value === undefined ? "" : notifications_email_password_default.value;
    defaults.notifications_email_name_default = notifications_email_name_default.value === undefined ? "" : notifications_email_name_default.value;

    return defaults;
};

export const mailing_details = get_defaults();
