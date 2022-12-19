import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
    default_delete_status, random_numbers, default_status, false_status, tag_admin, true_status, percentage, cancelled,
    service_charge_percentage, processing, cart_checked_out, checked_out, payment_methods, paid, order_cancellation_percentage,
    payment, completed, refunded, vendor_cancellation_percentage, rider_cancellation_percentage, refund, compensation, shipping, shipped,
    url_path_without_limits, check_user_route, refund_denied, order_refund_percentage, vendor_refund_percentage, platform_refund_percentage,
    rider_refund_percentage
} from '../config/config.js';
import db from "../models/index.js";

const ORDERS = db.orders;
const ORDERS_HISTORY = db.orders_history;
const ORDERS_COMPLETED = db.orders_completed;
const DISPUTES = db.disputes;
const TRANSACTIONS = db.transactions;
const RIDER_TRANSACTIONS = db.rider_transactions;
const APP_DEFAULTS = db.app_defaults;
const CARTS = db.carts;
const USERS = db.users;
const USER_ACCOUNT = db.user_account;
const ADDRESSESS = db.addressess;
const PRODUCTS = db.products;
const PRODUCT_IMAGES = db.product_images;
const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const RIDER_ACCOUNT = db.rider_account;
const VENDORS = db.vendors;
const VENDOR_ACCOUNT = db.vendor_account;
const Op = db.Sequelize.Op;

export function rootGetOrders(req, res) {
    ORDERS.findAndCountAll({
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
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
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
            },
            {
                model: RIDER_SHIPPING,
                attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                include: [
                    {
                        model: RIDERS,
                        attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                    }
                ]
            }
        ]
    }).then(orders => {
        if (!orders || orders.length == 0) {
            SuccessResponse(res, { unique_id: tag_admin, text: "Orders Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_admin, text: "Orders loaded" }, orders);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_admin, text: err.message }, null);
    });
};

export function rootGetOrdersSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS.findAndCountAll({
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
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
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
                },
                {
                    model: RIDER_SHIPPING,
                    attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                    include: [
                        {
                            model: RIDERS,
                            attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                        }
                    ]
                }
            ]
        }).then(orders => {
            if (!orders || orders.length == 0) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Orders Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Orders loaded" }, orders);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function rootGetOrder(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                unique_id: payload.order_unique_id
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
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'pro']
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
                },
                {
                    model: RIDER_SHIPPING,
                    attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                    include: [
                        {
                            model: RIDERS,
                            attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                        }
                    ]
                }
            ]
        }).then(order => {
            if (!order) {
                SuccessResponse(res, { unique_id: tag_admin, text: "Order Not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Order loaded" }, order);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export function getUserOrders(req, res) {
    const user_unique_id = req.UNIQUE_ID;

    ORDERS.findAndCountAll({
        attributes: { exclude: ['user_unique_id', 'id'] },
        where: {
            user_unique_id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: VENDORS,
                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
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
            },
            {
                model: RIDER_SHIPPING,
                attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                include: [
                    {
                        model: RIDERS,
                        attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                    }
                ]
            }
        ]
    }).then(orders => {
        if (!orders || orders.length == 0) {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Orders Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: user_unique_id, text: "Orders loaded" }, orders);
        }
    }).catch(err => {
        ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
    });
};

export function getUserOrdersSpecifically(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload,
                user_unique_id
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
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
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
                },
                {
                    model: RIDER_SHIPPING,
                    attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                    include: [
                        {
                            model: RIDERS,
                            attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                        }
                    ]
                }
            ]
        }).then(orders => {
            if (!orders || orders.length == 0) {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Orders Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Orders loaded" }, orders);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export function getUserOrder(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        ORDERS.findOne({
            attributes: { exclude: ['id'] },
            where: {
                ...payload,
                user_unique_id
            },
            include: [
                {
                    model: USERS,
                    attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image']
                },
                {
                    model: VENDORS,
                    attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
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
                },
                {
                    model: RIDER_SHIPPING,
                    attributes: ['min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                    include: [
                        {
                            model: RIDERS,
                            attributes: ['firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'profile_image', 'verification']
                        }
                    ]
                }
            ]
        }).then(order => {
            if (!order) {
                NotFoundError(res, { unique_id: user_unique_id, text: "Order not found" }, null);
            } else {
                SuccessResponse(res, { unique_id: user_unique_id, text: "Order loaded" }, order);
            }
        }).catch(err => {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        });
    }
};

export async function addOrders(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {

            await db.sequelize.transaction(async (transaction) => {
                const address = await ADDRESSESS.findOne({
                    where: {
                        user_unique_id,
                        default_address: true_status,
                        status: default_status
                    },
                    transaction
                });

                const app_defaults = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                if (address) {
                    let count_errors = 0;
                    let count_cart_errors = 0;
                    let count_product_errors = 0;
                    let count_vendor_errors = 0;

                    payload.cart_unique_ids.forEach(async element => {
                        const current_cart = await CARTS.findOne({
                            where: {
                                unique_id: element,
                                user_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        if (current_cart) {

                            const product = await PRODUCTS.findOne({
                                where: {
                                    unique_id: current_cart.product_unique_id,
                                    vendor_unique_id: current_cart.vendor_unique_id,
                                    status: default_status
                                },
                                transaction
                            });

                            const rider_shipping = await RIDER_SHIPPING.findOne({
                                where: {
                                    unique_id: current_cart.shipping_fee_unique_id,
                                    status: default_status
                                },
                                transaction
                            });

                            const vendor = await PRODUCTS.findOne({
                                where: {
                                    unique_id: current_cart.vendor_unique_id,
                                    status: default_status
                                },
                                transaction
                            });

                            if (current_cart.shipping_fee_unique_id === null) count_errors += 1;
                            if (!rider_shipping) count_errors += 1;
                            if (!vendor) count_vendor_errors += 1;
                            if (!product) count_product_errors += 1;
                        } else {
                            count_cart_errors += 1;
                        }
                    });

                    if (count_errors != 0 || count_cart_errors != 0 || count_product_errors != 0 || count_vendor_errors != 0) {
                        const err_arr = [
                            `${count_errors} item${count_errors === 1 ? "" : "s"} shipping not available`,
                            `${count_cart_errors} item${count_cart_errors === 1 ? "" : "s"} cart not found`,
                            `${count_vendor_errors} item${count_vendor_errors === 1 ? "" : "s"} vendors not found`,
                            `${count_product_errors} item${count_product_errors === 1 ? "" : "s"} product not found`
                        ];
                        BadRequestError(res, { unique_id: user_unique_id, text: "Checkout failed" }, { errors: err_arr });
                    } else {
                        const tracker_number = random_numbers(7);

                        payload.cart_unique_ids.forEach(async (element, index) => {
                            const current_cart = await CARTS.findOne({
                                where: {
                                    unique_id: element,
                                    user_unique_id,
                                    status: default_status
                                },
                                transaction
                            });

                            const product = await PRODUCTS.findOne({
                                where: {
                                    unique_id: current_cart.product_unique_id,
                                    vendor_unique_id: current_cart.vendor_unique_id,
                                    status: default_status
                                },
                                transaction
                            });

                            const rider_shipping = await RIDER_SHIPPING.findOne({
                                where: {
                                    unique_id: current_cart.shipping_fee_unique_id,
                                    status: default_status
                                },
                                transaction
                            });

                            const cost = product.sales_price === 0 ? product.price : product.sales_price;
                            const shipping_fee = rider_shipping.price * current_cart.quantity;
                            const final_cost = cost * current_cart.quantity;

                            const platform_rider_cut = (shipping_fee * parseInt(app_defaults.value)) / 100;
                            const rider_cut = shipping_fee - platform_rider_cut;

                            const platform_vendor_cut = (final_cost * parseInt(app_defaults.value)) / 100;
                            const vendor_cut = final_cost - platform_vendor_cut;

                            const total_cost = final_cost + shipping_fee;

                            const order_unique_id = uuidv4();
                            const order_history_unique_id = uuidv4();

                            const orders = await ORDERS.create(
                                {
                                    unique_id: order_unique_id,
                                    user_unique_id,
                                    vendor_unique_id: current_cart.vendor_unique_id,
                                    product_unique_id: current_cart.product_unique_id,
                                    tracker_number,
                                    shipping_fee_unique_id: current_cart.shipping_fee_unique_id,
                                    quantity: current_cart.quantity,
                                    amount: total_cost,
                                    shipping_fee,
                                    rider_credit: rider_cut,
                                    rider_service_charge: platform_rider_cut,
                                    credit: vendor_cut,
                                    service_charge: platform_vendor_cut,
                                    payment_method: payload.payment_method,
                                    paid: false_status,
                                    shipped: false_status,
                                    disputed: false_status,
                                    delivery_status: processing,
                                    status: default_status
                                }, { transaction }
                            );

                            if (orders) {
                                const order_history = await ORDERS_HISTORY.create(
                                    {
                                        unique_id: order_history_unique_id,
                                        user_unique_id,
                                        order_unique_id,
                                        price: null,
                                        completion: checked_out,
                                        status: default_status
                                    }, { transaction }
                                );

                                if (order_history) {
                                    const cart = await CARTS.update(
                                        {
                                            status: cart_checked_out,
                                        }, {
                                        where: {
                                            unique_id: element,
                                            user_unique_id
                                        },
                                        transaction
                                    }
                                    );

                                    if (cart > 0) {
                                        if (index === (payload.cart_unique_ids.length - 1)) {
                                            CreationSuccessResponse(res, { unique_id: user_unique_id, text: "Orders created successfully!" }, { tracker_number });
                                        }
                                    } else {
                                        throw new Error("Error checking out cart!");
                                    }
                                } else {
                                    throw new Error("Error adding orders history!");
                                }
                            } else {
                                throw new Error("Error creating orders!");
                            }

                        });
                    }
                } else {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Address not found!" }, null);
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function checkOrderStatusForPayment(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const tracking_number_orders = await ORDERS.findAll({
                    attributes: ['unique_id'],
                    where: {
                        user_unique_id,
                        tracking_number: payload.tracking_number,
                        status: default_status
                    },
                    transaction
                });

                let total_order_amount = 0;
                let order_payment_method;

                let count_paid_errors = 0;
                let count_product_errors = 0;
                let count_stock_errors = 0;

                tracking_number_orders.forEach(async element => {
                    const order_unique_id = element.unique_id;

                    const current_order = await ORDERS.findOne({
                        where: {
                            unique_id: order_unique_id,
                            user_unique_id,
                            tracking_number: payload.tracking_number,
                            paid: false_status
                        },
                        transaction
                    });

                    total_order_amount += current_order.amount;
                    if (!order_payment_method) order_payment_method = current_order.payment_method;

                    if (current_order) {
                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: current_order.product_unique_id,
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        if (!product) count_product_errors += 1;
                        if (product.remaining < current_order.quantity) count_stock_errors += 1;
                    } else {
                        count_paid_errors += 1;
                    }
                });

                if (count_paid_errors != 0 || count_product_errors != 0 || count_stock_errors != 0) {
                    const err_arr = [
                        `${count_paid_errors} item${count_paid_errors === 1 ? "" : "s"} already paid`,
                        `${count_product_errors} item${count_product_errors === 1 ? "" : "s"} product not found`,
                        `${count_stock_errors} item${count_stock_errors === 1 ? "" : "s"} ${count_stock_errors === 1 ? "is" : "are"} out of stock`
                    ];
                    BadRequestError(res, { unique_id: user_unique_id, text: "Payment update failed" }, { errors: err_arr });
                } else if (!user_account) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "User Account not found" }, null);
                } else if (order_payment_method === payment_methods.wallet && user_account.balance < total_order_amount) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Insufficient wallet balance" }, null);
                } else {
                    SuccessResponse(res, { unique_id: user_unique_id, text: "Order is ready for payment!" }, null);
                }

            });

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateOrderPaid(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const tracking_number_orders = await ORDERS.findAll({
                    attributes: ['unique_id'],
                    where: {
                        user_unique_id,
                        tracking_number: payload.tracking_number,
                        status: default_status
                    },
                    transaction
                });

                let total_order_amount = 0;
                let order_payment_method;

                let count_paid_errors = 0;
                let count_product_errors = 0;
                let count_stock_errors = 0;

                tracking_number_orders.forEach(async element => {
                    const order_unique_id = element.unique_id;

                    const current_order = await ORDERS.findOne({
                        where: {
                            unique_id: order_unique_id,
                            user_unique_id,
                            tracking_number: payload.tracking_number,
                            paid: false_status
                        },
                        transaction
                    });

                    total_order_amount += current_order.amount;
                    if (!order_payment_method) order_payment_method = current_order.payment_method;

                    if (current_order) {
                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: current_order.product_unique_id,
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        if (!product) count_product_errors += 1;
                        if (product.remaining < current_order.quantity) count_stock_errors += 1;
                    } else {
                        count_paid_errors += 1;
                    }
                });

                let all_paid_orders = [];

                if (count_paid_errors != 0 || count_product_errors != 0 || count_stock_errors != 0) {
                    const err_arr = [
                        `${count_paid_errors} item${count_paid_errors === 1 ? "" : "s"} already paid`,
                        `${count_product_errors} item${count_product_errors === 1 ? "" : "s"} product not found`,
                        `${count_stock_errors} item${count_stock_errors === 1 ? "" : "s"} ${count_stock_errors === 1 ? "is" : "are"} out of stock`
                    ];
                    BadRequestError(res, { unique_id: user_unique_id, text: "Payment update failed" }, { errors: err_arr });
                } else if (!user_account) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "User Account not found" }, null);
                } else if (order_payment_method === payment_methods.wallet && user_account.balance < total_order_amount) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Insufficient wallet balance" }, null);
                } else {
                    tracking_number_orders.forEach(async (element, index) => {
                        const order_unique_id = element.unique_id;

                        const current_order = await ORDERS.findOne({
                            where: {
                                unique_id: order_unique_id,
                                user_unique_id,
                                tracking_number: payload.tracking_number,
                                paid: false_status
                            },
                            transaction
                        });

                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: current_order.product_unique_id,
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const rider_shipping = await RIDER_SHIPPING.findOne({
                            where: {
                                unique_id: current_order.shipping_fee_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const rider_account = await RIDER_ACCOUNT.findOne({
                            where: {
                                rider_unique_id: rider_shipping.rider_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const vendor_account = await VENDOR_ACCOUNT.findOne({
                            where: {
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const new_stock = product.remaining - current_order.quantity;

                        const order = await ORDERS.update(
                            {
                                paid: true_status,
                                delivery_status: paid
                            }, {
                            where: {
                                unique_id: current_order.unique_id,
                                user_unique_id,
                                tracking_number: current_order.tracking_number,
                                vendor_unique_id: current_order.vendor_unique_id,
                            },
                            transaction
                        }
                        );

                        if (order > 0) {
                            const order_history = await ORDERS_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    order_unique_id,
                                    price: current_order.amount,
                                    completion: paid,
                                    status: default_status
                                }, { transaction }
                            );

                            if (order_history) {
                                const update_product_stock = await PRODUCTS.update(
                                    {
                                        remaining: new_stock,
                                    }, {
                                    where: {
                                        unique_id: product.unique_id,
                                        vendor_unique_id: product.vendor_unique_id,
                                    },
                                    transaction
                                }
                                );

                                // const total_vendor_service_charge = vendor_account.service_charge + current_order.service_charge;
                                // const total_rider_service_charge = rider_account.service_charge + current_order.rider_service_charge;

                                // const calculate_vendor_service_charge_if_not_greater = current_order.credit > total_vendor_service_charge ? current_order.credit - total_vendor_service_charge : 0;
                                // const calculate_vendor_service_charge_if_greater = total_vendor_service_charge > current_order.credit ? total_vendor_service_charge - current_order.credit : total_vendor_service_charge;

                                // const calculate_rider_service_charge_if_not_greater = current_order.rider_credit > total_rider_service_charge ? current_order.rider_credit - total_rider_service_charge : 0;
                                // const calculate_rider_service_charge_if_greater = total_rider_service_charge > current_order.rider_credit ? total_rider_service_charge - current_order.rider_credit : total_rider_service_charge;

                                // const new_vendor_card_balance = vendor_account.balance + calculate_vendor_service_charge_if_not_greater;  // Add if payment method is cash or transfer 
                                const new_vendor_card_balance = vendor_account.balance + current_order.credit;
                                // const new_vendor_service_charge = new_vendor_card_balance > calculate_vendor_service_charge_if_greater ? 0 : total_vendor_service_charge - current_order.credit; // Add if payment method is cash or transfer 

                                // const new_rider_card_balance = rider_account.balance + calculate_rider_service_charge_if_not_greater;  // Add if payment method is cash or transfer 
                                const new_rider_card_balance = rider_account.balance + current_order.rider_credit;
                                // const new_rider_service_charge = new_rider_card_balance > calculate_rider_service_charge_if_greater ? 0 : total_rider_service_charge - current_order.rider_credit; // Add if payment method is cash or transfer 

                                const new_user_balance = user_account.balance - current_order.amount;
                                const transaction_details = `Payment on order (${current_order.unique_id}) has been ${completed.toLowerCase()}`;

                                const transactions = await TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        vendor_unique_id: current_order.vendor_unique_id,
                                        type: payment,
                                        // amount: calculate_vendor_service_charge_if_not_greater, // Add if payment method is cash or transfer 
                                        amount: current_order.credit,
                                        transaction_status: completed,
                                        details: transaction_details,
                                        status: default_status
                                    }, { transaction }
                                );

                                const rider_transactions = await RIDER_TRANSACTIONS.create(
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id: rider_shipping.rider_unique_id,
                                        type: payment,
                                        // amount: calculate_rider_service_charge_if_not_greater, // Add if payment method is cash or transfer 
                                        amount: current_order.rider_credit,
                                        transaction_status: completed,
                                        details: transaction_details,
                                        status: default_status
                                    }, { transaction }
                                );

                                if (update_product_stock > 0 && transactions && rider_transactions) {
                                    if (order_payment_method === payment_methods.wallet) {
                                        const update_user_balance = await USER_ACCOUNT.update(
                                            {
                                                balance: new_user_balance,
                                            }, {
                                            where: {
                                                user_unique_id,
                                            },
                                            transaction
                                        }
                                        );

                                        if (update_user_balance > 0) {
                                            const update_vendor_balance = await VENDOR_ACCOUNT.update(
                                                {
                                                    balance: new_vendor_card_balance,
                                                    // service_charge: new_vendor_service_charge // Add if payment method is cash or transfer 
                                                }, {
                                                where: {
                                                    vendor_unique_id: current_order.vendor_unique_id,
                                                },
                                                transaction
                                            }
                                            );

                                            const update_rider_balance = await RIDER_ACCOUNT.update(
                                                {
                                                    balance: new_rider_card_balance,
                                                    // service_charge: new_rider_service_charge // Add if payment method is cash or transfer 
                                                }, {
                                                where: {
                                                    rider_unique_id: rider_shipping.rider_unique_id,
                                                },
                                                transaction
                                            }
                                            );

                                            if (update_vendor_balance > 0 && update_rider_balance > 0) {
                                                if (index === (tracking_number_orders.length - 1)) {
                                                    SuccessResponse(res, { unique_id: user_unique_id, text: "Order paid successfully!" }, { orders: all_paid_orders });
                                                } else {
                                                    const paid_order_obj = {
                                                        id: current_order.unique_id,
                                                        tracker_number: current_order.tracking_number,
                                                        status: paid
                                                    };

                                                    all_paid_orders.push(paid_order_obj);
                                                }
                                            } else {
                                                throw new Error("Error updating all balances");
                                            }
                                        } else {
                                            throw new Error("Error updating user balance");
                                        }
                                    } else {
                                        const update_vendor_balance = await VENDOR_ACCOUNT.update({
                                            balance: new_vendor_card_balance,
                                            // service_charge: new_vendor_service_charge // Add if payment method is cash or transfer 
                                        }, {
                                            where: {
                                                vendor_unique_id: current_order.vendor_unique_id,
                                            },
                                            transaction
                                        }
                                        );

                                        const update_rider_balance = await db.sequelize.transaction((t) => {
                                            return RIDER_ACCOUNT.update({
                                                balance: new_rider_card_balance,
                                                // service_charge: new_rider_service_charge // Add if payment method is cash or transfer 
                                            }, {
                                                where: {
                                                    rider_unique_id: rider_shipping.rider_unique_id,
                                                }
                                            }, { transaction: t });
                                        });

                                        if (update_vendor_balance > 0 && update_rider_balance > 0) {
                                            if (index === (tracking_number_orders.length - 1)) {
                                                SuccessResponse(res, { unique_id: user_unique_id, text: "Order paid successfully!" }, { orders: all_paid_orders });
                                            } else {
                                                const paid_order_obj = {
                                                    id: current_order.unique_id,
                                                    tracker_number: current_order.tracking_number,
                                                    status: paid
                                                };

                                                all_paid_orders.push(paid_order_obj);
                                            }
                                        } else {
                                            throw new Error("Error updating all balances");
                                        }
                                    }
                                } else {
                                    throw new Error("Error updating products stock & adding transactions");
                                }
                            } else {
                                throw new Error("Error adding orders history");
                            }
                        } else {
                            throw new Error("Error updating paid orders");
                        }
                    });
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function checkOrderStatusForCancellation(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const tracking_number_orders = await ORDERS.findAll({
                    attributes: ['unique_id'],
                    where: {
                        user_unique_id,
                        tracking_number: payload.tracking_number,
                        status: default_status
                    },
                    transaction
                });

                let total_order_amount = 0;
                let order_payment_method;

                let count_shipped_errors = 0;
                let count_product_errors = 0;

                tracking_number_orders.forEach(async element => {
                    const order_unique_id = element.unique_id;

                    const current_order = await ORDERS.findOne({
                        where: {
                            unique_id: order_unique_id,
                            user_unique_id,
                            tracking_number: payload.tracking_number,
                            shipped: false_status
                        },
                        transaction
                    });

                    total_order_amount += current_order.amount;
                    if (!order_payment_method) order_payment_method = current_order.payment_method;

                    if (current_order) {
                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: current_order.product_unique_id,
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        if (!product) count_product_errors += 1;
                    } else {
                        count_shipped_errors += 1;
                    }
                });

                if (count_shipped_errors != 0 || count_product_errors != 0) {
                    const err_arr = [
                        `${count_shipped_errors} item${count_shipped_errors === 1 ? "" : "s"} already shipped`,
                        `${count_product_errors} item${count_product_errors === 1 ? "" : "s"} product not found`
                    ];
                    BadRequestError(res, { unique_id: user_unique_id, text: "Order cancellation failed" }, { errors: err_arr });
                } else if (!user_account) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "User Account not found" }, null);
                }
                // else if (order_payment_method === payment_methods.wallet && user_account.balance < total_order_amount) {
                //     BadRequestError(res, { unique_id: user_unique_id, text: "Insufficient wallet balance" }, null);
                // } 
                else {
                    SuccessResponse(res, { unique_id: user_unique_id, text: "Order is eligible for cancellation!" }, null);
                }

            });

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateOrderCancelled(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const cancellation_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: order_cancellation_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _vendor_cancellation_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: vendor_cancellation_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _rider_cancellation_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: rider_cancellation_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const tracking_number_orders = await ORDERS.findAll({
                    attributes: ['unique_id'],
                    where: {
                        user_unique_id,
                        tracking_number: payload.tracking_number,
                        status: default_status
                    },
                    transaction
                });

                let total_order_amount = 0;
                let order_payment_method;

                let count_shipped_errors = 0;
                let count_product_errors = 0;

                tracking_number_orders.forEach(async element => {
                    const order_unique_id = element.unique_id;

                    const current_order = await ORDERS.findOne({
                        where: {
                            unique_id: order_unique_id,
                            user_unique_id,
                            tracking_number: payload.tracking_number,
                            shipped: false_status
                        },
                        transaction
                    });

                    total_order_amount += current_order.amount;
                    if (!order_payment_method) order_payment_method = current_order.payment_method;

                    if (current_order) {
                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: current_order.product_unique_id,
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        if (!product) count_product_errors += 1;
                    } else {
                        count_shipped_errors += 1;
                    }
                });

                let all_cancelled_orders = [];

                if (count_shipped_errors != 0 || count_product_errors != 0) {
                    const err_arr = [
                        `${count_shipped_errors} item${count_shipped_errors === 1 ? "" : "s"} already shipped`,
                        `${count_product_errors} item${count_product_errors === 1 ? "" : "s"} product not found`
                    ];
                    BadRequestError(res, { unique_id: user_unique_id, text: "Order cancellation failed" }, { errors: err_arr });
                } else if (!user_account) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "User Account not found" }, null);
                } else {
                    tracking_number_orders.forEach(async (element, index) => {
                        const order_unique_id = element.unique_id;

                        const current_order = await ORDERS.findOne({
                            where: {
                                unique_id: order_unique_id,
                                user_unique_id,
                                tracking_number: payload.tracking_number,
                                shipped: false_status
                            },
                            transaction
                        });

                        const product = await PRODUCTS.findOne({
                            where: {
                                unique_id: current_order.product_unique_id,
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const rider_shipping = await RIDER_SHIPPING.findOne({
                            where: {
                                unique_id: current_order.shipping_fee_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const rider_account = await RIDER_ACCOUNT.findOne({
                            where: {
                                rider_unique_id: rider_shipping.rider_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const vendor_account = await VENDOR_ACCOUNT.findOne({
                            where: {
                                vendor_unique_id: current_order.vendor_unique_id,
                                status: default_status
                            },
                            transaction
                        });

                        const new_stock = product.remaining + current_order.quantity;

                        const order = await ORDERS.update(
                            {
                                disputed: true_status,
                                delivery_status: cancelled
                            }, {
                                where: {
                                    unique_id: current_order.unique_id,
                                    user_unique_id,
                                    tracking_number: current_order.tracking_number,
                                    vendor_unique_id: current_order.vendor_unique_id,
                                },
                                transaction
                            }
                        );

                        if (order > 0) {
                            const order_history = await ORDERS_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    price: null,
                                    completion: cancelled,
                                    status: default_status
                                }, { transaction }
                            );

                            if (order_history) {
                                const update_product_stock = await PRODUCTS.update(
                                    {
                                        remaining: new_stock,
                                    }, {
                                        where: {
                                            unique_id: product.unique_id,
                                            vendor_unique_id: product.vendor_unique_id,
                                        },
                                        transaction
                                    }
                                );

                                const platform_cancellation_cut = (parseInt(cancellation_percentage.value) * current_order.amount) / 100;
                                const others_cut = platform_cancellation_cut / 2;
                                const vendor_cancellation_cut = (parseInt(_vendor_cancellation_percentage.value) * others_cut) / 100;
                                const rider_cancellation_cut = (parseInt(_rider_cancellation_percentage.value) * others_cut) / 100;

                                const total_vendor_balance = vendor_account.balance + vendor_cancellation_cut;
                                const total_rider_balance = rider_account.balance + rider_cancellation_cut;

                                const new_vendor_card_balance = current_order.credit > total_vendor_balance ? 0 : total_vendor_balance - current_order.credit;
                                const new_vendor_service_charge = current_order.credit > total_vendor_balance ? (vendor_account.service_charge + (current_order.credit - total_vendor_balance)) : vendor_account.service_charge;
                                
                                const new_rider_card_balance = current_order.rider_credit > total_rider_balance ? 0 : total_rider_balance - current_order.rider_credit;
                                const new_rider_service_charge = current_order.rider_credit > total_rider_balance ? (rider_account.service_charge + (current_order.rider_credit - total_rider_balance)) : rider_account.service_charge;
                                
                                const new_user_balance = user_account.balance + (current_order.amount - platform_cancellation_cut);
                                const dispute_message = `Order (${current_order.unique_id}) with tracking number [${current_order.tracker_number}] has been ${cancelled.toLowerCase()}`;
                                const refund_transaction_details = `Payment on order (${current_order.unique_id}) has been ${refunded.toLowerCase()}`;
                                const compensation_transaction_details = `${compensation} on order (${current_order.unique_id}) has been ${paid.toLowerCase()} successfully`;

                                const vendor_transaction_details = [
                                    {
                                        unique_id: uuidv4(),
                                        vendor_unique_id: current_order.vendor_unique_id,
                                        type: refund,
                                        amount: current_order.credit,
                                        transaction_status: completed,
                                        details: refund_transaction_details,
                                        status: default_status
                                    },
                                    {
                                        unique_id: uuidv4(),
                                        vendor_unique_id: current_order.vendor_unique_id,
                                        type: payment,
                                        amount: vendor_cancellation_cut,
                                        transaction_status: completed,
                                        details: compensation_transaction_details,
                                        status: default_status
                                    }
                                ];

                                const rider_transaction_details = [
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id: rider_shipping.rider_unique_id,
                                        type: refund,
                                        amount: current_order.rider_credit,
                                        transaction_status: completed,
                                        details: refund_transaction_details,
                                        status: default_status
                                    },
                                    {
                                        unique_id: uuidv4(),
                                        rider_unique_id: rider_shipping.rider_unique_id,
                                        type: payment,
                                        amount: rider_cancellation_cut,
                                        transaction_status: completed,
                                        details: compensation_transaction_details,
                                        status: default_status
                                    }
                                ];

                                const transactions = await TRANSACTIONS.bulkCreate(vendor_transaction_details, { transaction });

                                const rider_transactions = await RIDER_TRANSACTIONS.bulkCreate(rider_transaction_details, { transaction });

                                const disputes = await DISPUTES.create(
                                    {
                                        unique_id: uuidv4(),
                                        user_unique_id,
                                        order_unique_id: current_order.unique_id,
                                        message: dispute_message,
                                        status: default_status
                                    }, { transaction }
                                );

                                if (update_product_stock > 0 && transactions && rider_transactions && disputes) {
                                    const update_user_balance = await USER_ACCOUNT.update(
                                        {
                                            balance: new_user_balance,
                                        }, {
                                        where: {
                                            user_unique_id,
                                        },
                                        transaction
                                    }
                                    );

                                    if (update_user_balance > 0) {
                                        const update_vendor_balance = await VENDOR_ACCOUNT.update(
                                            {
                                                balance: new_vendor_card_balance,
                                                // service_charge: new_vendor_service_charge // Add if payment method is cash or transfer 
                                                service_charge: new_vendor_service_charge
                                            }, {
                                            where: {
                                                vendor_unique_id: current_order.vendor_unique_id,
                                            },
                                            transaction
                                        }
                                        );

                                        const update_rider_balance = await RIDER_ACCOUNT.update(
                                            {
                                                balance: new_rider_card_balance,
                                                // service_charge: new_rider_service_charge // Add if payment method is cash or transfer 
                                                service_charge: new_rider_service_charge
                                            }, {
                                            where: {
                                                rider_unique_id: rider_shipping.rider_unique_id,
                                            },
                                            transaction
                                        }
                                        );

                                        if (update_vendor_balance > 0 && update_rider_balance > 0) {
                                            if (index === (tracking_number_orders.length - 1)) {
                                                SuccessResponse(res, { unique_id: user_unique_id, text: "Order cancelled successfully!" }, { orders: all_cancelled_orders });
                                            } else {
                                                const cancelled_order_obj = {
                                                    id: current_order.unique_id,
                                                    tracker_number: current_order.tracking_number,
                                                    status: cancelled
                                                };

                                                all_cancelled_orders.push(cancelled_order_obj);
                                            }
                                        } else {
                                            throw new Error("Error updating all balances");
                                        }
                                    } else {
                                        throw new Error("Error updating user balance");
                                    }
                                } else {
                                    throw new Error("Error updating products stock, adding transactions & dispute");
                                }
                            } else {
                                throw new Error("Error adding orders history");
                            }
                        } else {
                            throw new Error("Error updating cancelled orders");
                        }
                    });
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function checkEachOrderStatusForCancellation(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                        user_unique_id,
                        shipped: false_status
                    },
                    transaction
                });

                const product = await PRODUCTS.findOne({
                    where: {
                        unique_id: current_order.product_unique_id,
                        vendor_unique_id: current_order.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (!user_account) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "User Account not found" }, null);
                } else if (!current_order) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Item already shipped" }, null);
                } else if (!product) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Product not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: user_unique_id, text: "Order is eligible for cancellation!" }, null);
                }

            });

        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateEachOrderCancelled(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const cancellation_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: order_cancellation_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _vendor_cancellation_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: vendor_cancellation_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _rider_cancellation_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: rider_cancellation_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                        user_unique_id,
                        shipped: false_status
                    },
                    transaction
                });

                const product = await PRODUCTS.findOne({
                    where: {
                        unique_id: current_order.product_unique_id,
                        vendor_unique_id: current_order.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const rider_shipping = await RIDER_SHIPPING.findOne({
                    where: {
                        unique_id: current_order.shipping_fee_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: rider_shipping.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const vendor_account = await VENDOR_ACCOUNT.findOne({
                    where: {
                        vendor_unique_id: current_order.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const new_stock = product.remaining + current_order.quantity;

                if (!user_account) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "User Account not found" }, null);
                } else if (!current_order) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Item already shipped" }, null);
                } else if (!product) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Product not found" }, null);
                } else {
                    const order = await ORDERS.update(
                        {
                            disputed: true_status,
                            delivery_status: cancelled
                        }, {
                            where: {
                                unique_id: current_order.unique_id,
                                user_unique_id,
                                tracking_number: current_order.tracking_number,
                                vendor_unique_id: current_order.vendor_unique_id,
                            },
                            transaction
                        }
                    );

                    if (order > 0) {
                        const order_history = await ORDERS_HISTORY.create(
                            {
                                unique_id: uuidv4(),
                                user_unique_id,
                                order_unique_id: current_order.unique_id,
                                price: null,
                                completion: cancelled,
                                status: default_status
                            }, { transaction }
                        );

                        if (order_history) {
                            const update_product_stock = await PRODUCTS.update(
                                {
                                    remaining: new_stock,
                                }, {
                                    where: {
                                        unique_id: product.unique_id,
                                        vendor_unique_id: product.vendor_unique_id,
                                    },
                                    transaction
                                }
                            );

                            const platform_cancellation_cut = (parseInt(cancellation_percentage.value) * current_order.amount) / 100;
                            const others_cut = platform_cancellation_cut / 2;
                            const vendor_cancellation_cut = (parseInt(_vendor_cancellation_percentage.value) * others_cut) / 100;
                            const rider_cancellation_cut = (parseInt(_rider_cancellation_percentage.value) * others_cut) / 100;

                            const total_vendor_balance = vendor_account.balance + vendor_cancellation_cut;
                            const total_rider_balance = rider_account.balance + rider_cancellation_cut;

                            const new_vendor_card_balance = current_order.credit > total_vendor_balance ? 0 : total_vendor_balance - current_order.credit;
                            const new_vendor_service_charge = current_order.credit > total_vendor_balance ? (vendor_account.service_charge + (current_order.credit - total_vendor_balance)) : vendor_account.service_charge;

                            const new_rider_card_balance = current_order.rider_credit > total_rider_balance ? 0 : total_rider_balance - current_order.rider_credit;
                            const new_rider_service_charge = current_order.rider_credit > total_rider_balance ? (rider_account.service_charge + (current_order.rider_credit - total_rider_balance)) : rider_account.service_charge;

                            const new_user_balance = user_account.balance + (current_order.amount - platform_cancellation_cut);
                            const dispute_message = `Order (${current_order.unique_id}) with tracking number [${current_order.tracker_number}] has been ${cancelled.toLowerCase()}`;
                            const refund_transaction_details = `Payment on order (${current_order.unique_id}) has been ${refunded.toLowerCase()}`;
                            const compensation_transaction_details = `${compensation} on order (${current_order.unique_id}) has been ${paid.toLowerCase()} successfully`;

                            const vendor_transaction_details = [
                                {
                                    unique_id: uuidv4(),
                                    vendor_unique_id: current_order.vendor_unique_id,
                                    type: refund,
                                    amount: current_order.credit,
                                    transaction_status: completed,
                                    details: refund_transaction_details,
                                    status: default_status
                                },
                                {
                                    unique_id: uuidv4(),
                                    vendor_unique_id: current_order.vendor_unique_id,
                                    type: payment,
                                    amount: vendor_cancellation_cut,
                                    transaction_status: completed,
                                    details: compensation_transaction_details,
                                    status: default_status
                                }
                            ];

                            const rider_transaction_details = [
                                {
                                    unique_id: uuidv4(),
                                    rider_unique_id: rider_shipping.rider_unique_id,
                                    type: refund,
                                    amount: current_order.rider_credit,
                                    transaction_status: completed,
                                    details: refund_transaction_details,
                                    status: default_status
                                },
                                {
                                    unique_id: uuidv4(),
                                    rider_unique_id: rider_shipping.rider_unique_id,
                                    type: payment,
                                    amount: rider_cancellation_cut,
                                    transaction_status: completed,
                                    details: compensation_transaction_details,
                                    status: default_status
                                }
                            ];

                            const transactions = await TRANSACTIONS.bulkCreate(vendor_transaction_details, { transaction });

                            const rider_transactions = await RIDER_TRANSACTIONS.bulkCreate(rider_transaction_details, { transaction });

                            const disputes = await DISPUTES.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    message: dispute_message,
                                    status: default_status
                                }, { transaction }
                            );

                            if (update_product_stock > 0 && transactions && rider_transactions && disputes) {
                                const update_user_balance = await USER_ACCOUNT.update(
                                    {
                                        balance: new_user_balance,
                                    }, {
                                        where: {
                                            user_unique_id,
                                        },
                                        transaction
                                    }
                                );

                                if (update_user_balance > 0) {
                                    const update_vendor_balance = await VENDOR_ACCOUNT.update(
                                        {
                                            balance: new_vendor_card_balance,
                                            // service_charge: new_vendor_service_charge // Add if payment method is cash or transfer 
                                            service_charge: new_vendor_service_charge
                                        }, {
                                            where: {
                                                vendor_unique_id: current_order.vendor_unique_id,
                                            },
                                            transaction
                                        }
                                    );

                                    const update_rider_balance = await RIDER_ACCOUNT.update(
                                        {
                                            balance: new_rider_card_balance,
                                            // service_charge: new_rider_service_charge // Add if payment method is cash or transfer 
                                            service_charge: new_rider_service_charge
                                        }, {
                                            where: {
                                                rider_unique_id: rider_shipping.rider_unique_id,
                                            },
                                            transaction
                                        }
                                    );

                                    if (update_vendor_balance > 0 && update_rider_balance > 0) {
                                        const cancelled_order_obj = {
                                            id: current_order.unique_id,
                                            tracker_number: current_order.tracking_number,
                                            status: cancelled
                                        };
                                        SuccessResponse(res, { unique_id: user_unique_id, text: "Order cancelled successfully!" }, { order: cancelled_order_obj });
                                    } else {
                                        throw new Error("Error updating all balances");
                                    }
                                } else {
                                    throw new Error("Error updating user balance");
                                }
                            } else {
                                throw new Error("Error updating products stock, adding transactions & dispute");
                            }
                        } else {
                            throw new Error("Error adding order history");
                        }
                    } else {
                        throw new Error("Error updating order cancelled");
                    }
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function updateOrderInTransit(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                    },
                    transaction
                });

                const rider_shipping = await RIDER_SHIPPING.findOne({
                    where: {
                        unique_id: current_order.shipping_fee_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (rider_shipping.rider_unique_id !== rider_unique_id) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Order not found on rider!" }, null);
                } else if (!current_order.paid) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Payment incomplete for order!" }, null);
                } else {
                    if (!current_order.shipped || (current_order.shipped && current_order.delivery_status === paid)) {
                        const order = await ORDERS.update(
                            {
                                shipped: true_status,
                                delivery_status: shipping
                            }, {
                                where: {
                                    unique_id: current_order.unique_id,
                                    shipping_fee_unique_id : current_order.shipping_fee_unique_id,
                                    tracking_number: current_order.tracking_number,
                                    vendor_unique_id: current_order.vendor_unique_id,
                                },
                                transaction
                            }
                        );

                        if (order > 0) {
                            const order_history = await ORDERS_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: current_order.user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    price: null,
                                    completion: shipping,
                                    status: default_status
                                }, { transaction }
                            );

                            if (order_history) {
                                SuccessResponse(res, { unique_id: rider_unique_id, text: "Order in transit!" }, null);
                            } else {
                                throw new Error("Error adding order history");
                            }
                        } else {
                            throw new Error("Error updating order in transit");
                        }
                    } else {
                        BadRequestError(res, { unique_id: rider_unique_id, text: `Order is already ${current_order.delivery_status}` }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateOrderShipped(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                    },
                    transaction
                });

                const rider_shipping = await RIDER_SHIPPING.findOne({
                    where: {
                        unique_id: current_order.shipping_fee_unique_id,
                        status: default_status
                    },
                    transaction
                });

                if (rider_shipping.rider_unique_id !== rider_unique_id) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Order not found on rider!" }, null);
                } else if (!current_order.paid) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Payment incomplete for order!" }, null);
                } else if (!current_order.shipped) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Order is not in transit!" }, null);
                } else {
                    if (current_order.shipped && current_order.delivery_status === shipping) {
                        const order = await ORDERS.update(
                            {
                                delivery_status: shipped
                            }, {
                                where: {
                                    unique_id: current_order.unique_id,
                                    shipping_fee_unique_id: current_order.shipping_fee_unique_id,
                                    tracking_number: current_order.tracking_number,
                                    vendor_unique_id: current_order.vendor_unique_id,
                                },
                                transaction
                            }
                        );

                        if (order > 0) {
                            const order_history = await ORDERS_HISTORY.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: current_order.user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    price: null,
                                    completion: shipped,
                                    status: default_status
                                }, { transaction }
                            );

                            if (order_history) {
                                SuccessResponse(res, { unique_id: rider_unique_id, text: "Order shipped successfully!" }, null);
                            } else {
                                throw new Error("Error adding order history");
                            }
                        } else {
                            throw new Error("Error updating shipped order");
                        }
                    } else {
                        BadRequestError(res, { unique_id: rider_unique_id, text: `Order is already ${current_order.delivery_status}` }, null);
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function updateOrderCompleted(req, res) {
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
            ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
        } else {
            try {
                await db.sequelize.transaction(async (transaction) => {
    
                    const current_order = await ORDERS.findOne({
                        where: {
                            ...payload,
                        },
                        transaction
                    });

                    const address = await ADDRESSESS.findOne({
                        where: {
                            user_unique_id: current_order.user_unique_id,
                            default_address: true_status,
                            status: default_status
                        },
                        transaction
                    });

                    const product = await PRODUCTS.findOne({
                        where: {
                            unique_id: current_order.product_unique_id,
                            vendor_unique_id: current_order.vendor_unique_id,
                            status: default_status
                        },
                        transaction
                    });

                    const rider_shipping = await RIDER_SHIPPING.findOne({
                        where: {
                            unique_id: current_order.shipping_fee_unique_id,
                            status: default_status
                        },
                        transaction
                    });

                    const rider_account = await RIDER_ACCOUNT.findOne({
                        where: {
                            rider_unique_id: rider_shipping.rider_unique_id,
                            status: default_status
                        },
                        transaction
                    });
    
                    if (current_order.vendor_unique_id !== vendor_unique_id) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Order not found on vendor!" }, null);
                    } else if (!current_order.paid) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Payment incomplete for order!" }, null);
                    } else if (!current_order.shipped) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Order is not in transit!" }, null);
                    } else if (current_order.shipped && current_order.delivery_status !== shipped) {
                        BadRequestError(res, { unique_id: vendor_unique_id, text: "Order is not shipped yet!" }, null);
                    } else {
                        if (current_order.shipped && current_order.delivery_status === shipped) {
                            const order = await ORDERS.update(
                                {
                                    delivery_status: completed
                                }, {
                                    where: {
                                        unique_id: current_order.unique_id,
                                        tracking_number: current_order.tracking_number,
                                        vendor_unique_id: current_order.vendor_unique_id,
                                    },
                                    transaction
                                }
                            );
    
                            if (order > 0) {
                                const order_history = await ORDERS_HISTORY.create(
                                    {
                                        unique_id: uuidv4(),
                                        user_unique_id: current_order.user_unique_id,
                                        order_unique_id: current_order.unique_id,
                                        price: null,
                                        completion: completed,
                                        status: default_status
                                    }, { transaction }
                                );

                                if (order_history) {
                                    const order_completed = await ORDERS_COMPLETED.create(
                                        {
                                            unique_id: uuidv4(),
                                            user_unique_id: current_order.user_unique_id,
                                            vendor_unique_id: current_order.vendor_unique_id,
                                            order_unique_id: current_order.unique_id,
                                            tracking_number: current_order.tracking_number,
                                            quantity: current_order.quantity,
                                            payment_method: current_order.payment_method,
                                            product_name: product.name,
                                            address_fullname: address.firstname + " " + address.lastname,
                                            full_address: address.address,
                                            city: address.city,
                                            state: address.state,
                                            country: address.country,
                                            shipping_fee_price: rider_shipping.price,
                                            total_price: current_order.amount,
                                            status: default_status
                                        }, { transaction }
                                    );

                                    if (order_completed) {
                                        SuccessResponse(res, { unique_id: vendor_unique_id, text: "Order completed successfully!" }, null);
                                    } else {
                                        throw new Error("Error adding order completed");
                                    }
                                } else {
                                    throw new Error("Error adding order history");
                                }
                            } else {
                                throw new Error("Error updating completed order");
                            }
                        } else {
                            BadRequestError(res, { unique_id: vendor_unique_id, text: `Order is already ${current_order.delivery_status}` }, null);
                        }
                    }
                });
            } catch (err) {
                ServerError(res, { unique_id: vendor_unique_id, text: err.message }, null);
            }
        }
    }
};

export async function disputeOrderForRefund(req, res) {
    const user_unique_id = req.UNIQUE_ID;
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                        user_unique_id,
                        paid: true_status,
                        shipped: true_status,
                        transaction_status: completed
                    },
                    transaction
                });

                const refund_amount = current_order.amount - current_order.shipping_fee;

                if (!current_order) {
                    BadRequestError(res, { unique_id: user_unique_id, text: "Order hasn't been completed" }, null);
                } else {
                    const order = await ORDERS.update(
                        {
                            disputed: true_status,
                            delivery_status: refund
                        }, {
                            where: {
                                unique_id: current_order.unique_id,
                                user_unique_id,
                                tracking_number: current_order.tracking_number,
                                vendor_unique_id: current_order.vendor_unique_id,
                            },
                            transaction
                        }
                    );

                    if (order > 0) {
                        const order_history = await ORDERS_HISTORY.create(
                            {
                                unique_id: uuidv4(),
                                user_unique_id,
                                order_unique_id: current_order.unique_id,
                                price: refund_amount,
                                completion: refund,
                                status: default_status
                            }, { transaction }
                        );

                        if (order_history) {

                            const combined_message = `Order is been disputed for a refund. Customer's reason - ${payload.message}`
                            
                            const disputes = await DISPUTES.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    message: combined_message,
                                    status: default_status
                                }, { transaction }
                            );

                            if (disputes) {
                                SuccessResponse(res, { unique_id: user_unique_id, text: "Order has been disputed successfully for a refund!" }, null);
                            } else {
                                throw new Error("Error adding refund dispute");
                            }
                        } else {
                            throw new Error("Error adding order history");
                        }
                    } else {
                        throw new Error("Error updating order for refund");
                    }
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function acceptRefundForOrder(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const user_account = await USER_ACCOUNT.findOne({
                    where: {
                        user_unique_id: payload.user_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const refund_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: order_refund_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _vendor_refund_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: vendor_refund_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _rider_refund_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: rider_refund_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const _platform_refund_percentage = await APP_DEFAULTS.findOne({
                    where: {
                        criteria: platform_refund_percentage.criteria,
                        status: default_status
                    },
                    transaction
                });

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                        user_unique_id: payload.user_unique_id,
                        paid: true_status,
                        shipped: true_status,
                        transaction_status: refund
                    },
                    transaction
                });

                const rider_shipping = await RIDER_SHIPPING.findOne({
                    where: {
                        unique_id: current_order.shipping_fee_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const rider_account = await RIDER_ACCOUNT.findOne({
                    where: {
                        rider_unique_id: rider_shipping.rider_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const vendor_account = await VENDOR_ACCOUNT.findOne({
                    where: {
                        vendor_unique_id: current_order.vendor_unique_id,
                        status: default_status
                    },
                    transaction
                });

                const refund_amount = current_order.amount - current_order.shipping_fee;

                if (!user_account) {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "User Account not found" }, null);
                } else if (!current_order) {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "Order hasn't been disputed for refund" }, null);
                } else {
                    const order = await ORDERS.update(
                        {
                            delivery_status: refunded
                        }, {
                            where: {
                                unique_id: current_order.unique_id,
                                user_unique_id: payload.user_unique_id,
                                tracking_number: current_order.tracking_number,
                                vendor_unique_id: current_order.vendor_unique_id,
                            },
                            transaction
                        }
                    );

                    if (order > 0) {
                        const order_history = await ORDERS_HISTORY.create(
                            {
                                unique_id: uuidv4(),
                                user_unique_id: payload.user_unique_id,
                                order_unique_id: current_order.unique_id,
                                price: refund_amount,
                                completion: refunded,
                                status: default_status
                            }, { transaction }
                        );

                        if (order_history) {

                            const refund_cut_from_vendor = (parseInt(refund_percentage.value) * refund_amount) / 100;
                            const refund_cut_from_rider = (parseInt(refund_percentage.value) * current_order.shipping_fee) / 100;
                            
                            const platform_refund_cut = (parseInt(_platform_refund_percentage.value) * refund_cut_from_vendor) / 100;
                            const vendor_refund_cut = (parseInt(_vendor_refund_percentage.value) * refund_cut_from_vendor) / 100;
                            const rider_refund_cut = (parseInt(_rider_refund_percentage.value) * refund_cut_from_rider) / 100;

                            const total_vendor_balance = vendor_account.balance + vendor_refund_cut;
                            const total_rider_balance = rider_account.balance + rider_refund_cut;

                            const new_vendor_card_balance = current_order.credit > total_vendor_balance ? 0 : total_vendor_balance - current_order.credit;
                            const new_vendor_service_charge = current_order.credit > total_vendor_balance ? (vendor_account.service_charge + (current_order.credit - total_vendor_balance)) : vendor_account.service_charge;

                            const new_rider_card_balance = current_order.rider_credit > total_rider_balance ? 0 : total_rider_balance - current_order.rider_credit;
                            const new_rider_service_charge = current_order.rider_credit > total_rider_balance ? (rider_account.service_charge + (current_order.rider_credit - total_rider_balance)) : rider_account.service_charge;

                            const new_user_balance = user_account.balance + (refund_amount - refund_cut_from_vendor);
                            const dispute_message = `Order (${current_order.unique_id}) with tracking number [${current_order.tracker_number}] has been ${refunded.toLowerCase()} successfully`;
                            const refund_transaction_details = `Payment on order (${current_order.unique_id}) has been ${refunded.toLowerCase()}`;
                            const compensation_transaction_details = `${compensation} on order (${current_order.unique_id}) has been ${paid.toLowerCase()} successfully`;

                            const vendor_transaction_details = [
                                {
                                    unique_id: uuidv4(),
                                    vendor_unique_id: current_order.vendor_unique_id,
                                    type: refund,
                                    amount: current_order.credit,
                                    transaction_status: completed,
                                    details: refund_transaction_details,
                                    status: default_status
                                },
                                {
                                    unique_id: uuidv4(),
                                    vendor_unique_id: current_order.vendor_unique_id,
                                    type: payment,
                                    amount: vendor_refund_cut,
                                    transaction_status: completed,
                                    details: compensation_transaction_details,
                                    status: default_status
                                }
                            ];

                            const rider_transaction_details = [
                                {
                                    unique_id: uuidv4(),
                                    rider_unique_id: rider_shipping.rider_unique_id,
                                    type: refund,
                                    amount: current_order.rider_credit,
                                    transaction_status: completed,
                                    details: refund_transaction_details,
                                    status: default_status
                                },
                                {
                                    unique_id: uuidv4(),
                                    rider_unique_id: rider_shipping.rider_unique_id,
                                    type: payment,
                                    amount: rider_refund_cut,
                                    transaction_status: completed,
                                    details: compensation_transaction_details,
                                    status: default_status
                                }
                            ];

                            const transactions = await TRANSACTIONS.bulkCreate(vendor_transaction_details, { transaction });

                            const rider_transactions = await RIDER_TRANSACTIONS.bulkCreate(rider_transaction_details, { transaction });

                            const disputes = await DISPUTES.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    message: dispute_message,
                                    status: default_status
                                }, { transaction }
                            );

                            if (transactions && rider_transactions && disputes) {
                                const update_user_balance = await USER_ACCOUNT.update(
                                    {
                                        balance: new_user_balance,
                                    }, {
                                        where: {
                                            user_unique_id,
                                        },
                                        transaction
                                    }
                                );

                                if (update_user_balance > 0) {
                                    const update_vendor_balance = await VENDOR_ACCOUNT.update(
                                        {
                                            balance: new_vendor_card_balance,
                                            service_charge: new_vendor_service_charge
                                        }, {
                                            where: {
                                                vendor_unique_id: current_order.vendor_unique_id,
                                            },
                                            transaction
                                        }
                                    );

                                    const update_rider_balance = await RIDER_ACCOUNT.update(
                                        {
                                            balance: new_rider_card_balance,
                                            service_charge: new_rider_service_charge
                                        }, {
                                            where: {
                                                rider_unique_id: rider_shipping.rider_unique_id,
                                            },
                                            transaction
                                        }
                                    );

                                    if (update_vendor_balance > 0 && update_rider_balance > 0) {
                                        const refunded_order_obj = {
                                            id: current_order.unique_id,
                                            tracker_number: current_order.tracking_number,
                                            status: refunded
                                        };
                                        SuccessResponse(res, { unique_id: user_unique_id, text: "Order refunded successfully!" }, { order: refunded_order_obj });
                                    } else {
                                        throw new Error("Error updating all balances");
                                    }
                                } else {
                                    throw new Error("Error updating user balance");
                                }
                            } else {
                                throw new Error("Error adding transactions & dispute");
                            }
                        } else {
                            throw new Error("Error adding order history");
                        }
                    } else {
                        throw new Error("Error updating order refunded");
                    }
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
        }
    }
};

export async function denyRefundForOrder(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: payload.user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const current_order = await ORDERS.findOne({
                    where: {
                        ...payload,
                        user_unique_id: payload.user_unique_id,
                        paid: true_status,
                        shipped: true_status,
                        transaction_status: refund
                    },
                    transaction
                });

                const refund_amount = current_order.amount - current_order.shipping_fee;

                if (!current_order) {
                    BadRequestError(res, { unique_id: payload.user_unique_id, text: "Order hasn't been disputed for refund" }, null);
                } else {
                    const order = await ORDERS.update(
                        {
                            delivery_status: refund_denied
                        }, {
                            where: {
                                unique_id: current_order.unique_id,
                                user_unique_id: payload.user_unique_id,
                                tracking_number: current_order.tracking_number,
                                vendor_unique_id: current_order.vendor_unique_id,
                            },
                            transaction
                        }
                    );

                    if (order > 0) {
                        const order_history = await ORDERS_HISTORY.create(
                            {
                                unique_id: uuidv4(),
                                user_unique_id: payload.user_unique_id,
                                order_unique_id: current_order.unique_id,
                                price: refund_amount,
                                completion: refund_denied,
                                status: default_status
                            }, { transaction }
                        );

                        if (order_history) {

                            const combined_message = `Dispute for order refund has been denied. Reason - ${payload.feedback}`

                            const disputes = await DISPUTES.create(
                                {
                                    unique_id: uuidv4(),
                                    user_unique_id: payload.user_unique_id,
                                    order_unique_id: current_order.unique_id,
                                    message: combined_message,
                                    status: default_status
                                }, { transaction }
                            );

                            if (disputes) {
                                SuccessResponse(res, { unique_id: payload.user_unique_id, text: "Order refund has been denied successfully!" }, null);
                            } else {
                                throw new Error("Error adding refund denial dispute");
                            }
                        } else {
                            throw new Error("Error adding order history");
                        }
                    } else {
                        throw new Error("Error updating order for refund denial");
                    }
                }

            });
        } catch (err) {
            ServerError(res, { unique_id: payload.user_unique_id, text: err.message }, null);
        }
    }
};
