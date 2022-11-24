import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import fs from "fs";
import db from "../models/index.js";
import { logger } from '../common/index.js';
import { 
    api_key_start, random_uuid, default_status, percentage, service_charge_percentage, subscription_fee, max_user_addressess, strip_text,
    save_document_domain, default_platform_image, access_granted, platform_documents_path, save_image_dir, default_cover_image, 
    vendor_access_url, max_bank_accounts, max_debt, order_cancellation_percentage, vendor_cancellation_percentage, rider_cancellation_percentage, 
    zero, verified_status, order_refund_percentage, platform_refund_percentage, vendor_refund_percentage, rider_refund_percentage
} from './config.js';

const API_KEYS = db.api_keys;
const APP_DEFAULTS = db.app_defaults;
const VENDORS = db.vendors;
const VENDOR_ACCOUNT = db.vendor_account;
const VENDOR_USERS = db.vendor_users;

const { existsSync, mkdirSync } = fs;

export async function createAppDefaults() {

    const details = [
        {
            unique_id: uuidv4(),
            ...percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...order_cancellation_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...vendor_cancellation_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...rider_cancellation_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...order_refund_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...platform_refund_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...vendor_refund_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...rider_refund_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...service_charge_percentage,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...subscription_fee,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_user_addressess,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_bank_accounts,
            status: default_status
        },
        {
            unique_id: uuidv4(),
            ...max_debt,
            status: default_status
        }
    ];

    const count = await APP_DEFAULTS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const appDefaults = APP_DEFAULTS.bulkCreate(details, { transaction: t });
                return appDefaults;
            })
            logger.info('Added app defaults');
        } catch (error) {
            logger.error('Error adding app defaults');
        }
    }

};

export async function createApiKeys() {

    const details = [
        {
            unique_id: uuidv4(),
            type: "Administrator",
            api_key: api_key_start + random_uuid(20),
            status: default_status
        },
        {
            unique_id: uuidv4(),
            type: "Internal",
            api_key: api_key_start + random_uuid(20),
            status: default_status
        }
    ];

    const count = await API_KEYS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const apikey = API_KEYS.bulkCreate(details, { transaction: t });
                return apikey;
            })
            logger.info('Added api keys defaults');
        } catch (error) {
            logger.error('Error adding api keys defaults');
        }
    }
};

export async function createDefaultVendor() {

    // Creating default vendor
    const vendor_unique_id = uuidv4();
    const vendor_name = "9:25";
    const stripped = strip_text(vendor_name);
    const next_year = moment().add(12, 'months').toDate();

    const details = {
        unique_id: vendor_unique_id,
        name: vendor_name,
        stripped,
        email: "default@9-25.co",
        description: "This is 9:25's default vendor",
        access_url: vendor_access_url + stripped,
        profile_image_base_url: save_document_domain,
        profile_image_dir: save_image_dir,
        profile_image: default_platform_image,
        cover_image_base_url: save_document_domain,
        cover_image_dir: save_image_dir,
        cover_image: default_cover_image,
        pro: true,
        pro_expiring: next_year,
        verification: verified_status,
        access: access_granted,
        status: default_status
    };

    const count = await VENDORS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const vendor = VENDORS.create(details, { transaction: t });
                return vendor;
            })

            const folder_name = platform_documents_path + vendor_unique_id;
            if (!existsSync(folder_name)) mkdirSync(folder_name);
            if (existsSync(folder_name)) {
                logger.info('Added vendor defaults');
            } else {
                logger.error('Error creating vendor folder');
            }
        } catch (error) {
            logger.error('Error adding vendor defaults');
        }
    }

    // End of creating default vendor

    // Creating default vendor account
    const vendor_account_unique_id = uuidv4();

    const vendor_account_details = {
        unique_id: vendor_account_unique_id,
        vendor_unique_id,
        balance: zero,
        service_charge: zero,
        status: default_status
    };

    const vendor_account_count = await VENDOR_ACCOUNT.count();

    if (vendor_account_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const vendor_account = VENDOR_ACCOUNT.create(vendor_account_details, { transaction: t });
                return vendor_account;
            })
            logger.info('Added vendor account defaults');
        } catch (error) {
            logger.error('Error adding vendor account defaults');
        }
    }

    // End of creating default vendor account

    // Creating default vendor user
    const vendor_user_unique_id = uuidv4();

    const vendor_user_details = {
        unique_id: vendor_user_unique_id,
        vendor_unique_id,
        firstname: "John",
        middlename: null,
        lastname: "Doe",
        email: "johndoe@9-25.co",
        mobile_number: null,
        gender: "Male",
        routes: "all",
        access: access_granted,
        status: default_status
    };

    const vendor_user_count = await VENDOR_USERS.count();

    if (vendor_user_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const vendor_user = VENDOR_USERS.create(vendor_user_details, { transaction: t });
                return vendor_user;
            })
            logger.info('Added vendor user defaults');
        } catch (error) {
            logger.error('Error adding vendor user defaults');
        }
    }

    // End of creating default vendor user
};
