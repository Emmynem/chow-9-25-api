import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_admin, true_status, false_status, anonymous } from '../config/config.js';
import db from "../models/index.js";

const RIDER_SHIPPING = db.rider_shipping;
const RIDERS = db.riders;
const PRODUCTS = db.products;
const ADDRESSESS = db.addressess;
const VENDORS = db.vendors;
const VENDOR_ADDRESS = db.vendor_address;
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
    } else {
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

export function rootGetRiderShippingSpecifically(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_admin, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDER_SHIPPING.findAndCountAll({
            attributes: { exclude: ['id'] },
            where: {
                ...payload
            },
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
                SuccessResponse(res, { unique_id: tag_admin, text: "Rider Shipping Not found" }, []);
            } else {
                SuccessResponse(res, { unique_id: tag_admin, text: "Rider Shipping loaded" }, riders_shipping);
            }
        }).catch(err => {
            ServerError(res, { unique_id: tag_admin, text: err.message }, null);
        });
    }
};

export async function getProductShippingAnonymously(req, res) {

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
    } else {
        const product = await PRODUCTS.findOne({
            attributes: ['vendor_unique_id', 'weight'],
            where: {
                unique_id: payload.product_unique_id,
                status: default_status
            }, 
            include: [
                {
                    model: VENDORS,
                    attributes: ['name'],
                    include: [
                        {
                            model: VENDOR_ADDRESS,
                            attributes: ['city', 'state', 'country']
                        }
                    ]
                }
            ]
        });

        if (!product) {
            BadRequestError(res, { unique_id: anonymous, text: "Product not found!" }, null);
        } else {
            const default_rider_shipping = await RIDER_SHIPPING.findAll({
                attributes: ['unique_id', 'rider_unique_id', 'min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country'],
                where: {
                    min_weight: {
                        [Op.lte]: product.weight
                    },
                    max_weight: {
                        [Op.gte]: product.weight
                    },
                    from_city: product.vendor.vendor_address.city,
                    from_state: product.vendor.vendor_address.state,
                    from_country: product.vendor.vendor_address.country,
                    '$rider.vendor_unique_id$': product.vendor_unique_id,
                    '$rider.availability$': true_status
                },
                order: [
                    ['price', 'ASC']
                ],
                limit: 10,
                include: [
                    {
                        model: RIDERS,
                        as: 'rider',
                        required: true,
                        attributes: ['vendor_unique_id', 'firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'availability', 'verification', 'profile_image'],
                        include: [
                            {
                                model: VENDORS,
                                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
                            }
                        ]
                    }
                ]
            });

            const freelance_rider_shipping = await RIDER_SHIPPING.findAll({
                attributes: ['unique_id', 'rider_unique_id', 'min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country'],
                where: {
                    min_weight: {
                        [Op.lte]: product.weight
                    },
                    max_weight: {
                        [Op.gte]: product.weight
                    },
                    from_city: product.vendor.vendor_address.city,
                    from_state: product.vendor.vendor_address.state,
                    from_country: product.vendor.vendor_address.country,
                    '$rider.vendor_unique_id$': null,
                    '$rider.availability$': true_status,
                },
                order: [
                    ['price', 'ASC']
                ],
                limit: 10,
                include: [
                    {
                        model: RIDERS,
                        as: 'rider',
                        attributes: ['vendor_unique_id', 'firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'availability', 'verification', 'profile_image']
                    }
                ]
            });

            SuccessResponse(res, { unique_id: anonymous, text: "Product Shipping Loaded!" }, { default_rider_shipping, freelance_rider_shipping });
        }
    }
};

export async function getProductShipping(req, res) {
    const user_unique_id = req.UNIQUE_ID || payload.unique_id || '';
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        const product = await PRODUCTS.findOne({
            attributes: ['vendor_unique_id', 'weight'],
            where: {
                unique_id: payload.product_unique_id,
                status: default_status
            },
            include: [
                {
                    model: VENDORS,
                    attributes: ['name'],
                    include: [
                        {
                            model: VENDOR_ADDRESS,
                            attributes: ['city', 'state', 'country']
                        }
                    ]
                }
            ]
        });

        const address = await ADDRESSESS.findOne({
            where: {
                user_unique_id,
                default_address: true_status,
                status: default_status
            }
        });

        if (!product) {
            BadRequestError(res, { unique_id: user_unique_id, text: "Product not found!" }, null);
        } else if (!address) {
            BadRequestError(res, { unique_id: user_unique_id, text: "User address not found!" }, null);
        } else {
            const default_rider_shipping = await RIDER_SHIPPING.findAll({
                attributes: ['unique_id', 'rider_unique_id', 'min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                where: {
                    min_weight: {
                        [Op.lte]: product.weight
                    },
                    max_weight: {
                        [Op.gte]: product.weight
                    },
                    [Op.or]: [
                        {
                            from_city: product.vendor.vendor_address.city,
                            from_state: product.vendor.vendor_address.state,
                            from_country: product.vendor.vendor_address.country,
                            to_city: address.city,
                            to_state: address.state,
                            to_country: address.country,
                        },
                        {
                            from_city: address.city,
                            from_state: address.state,
                            from_country: address.country,
                            to_city: product.vendor.vendor_address.city,
                            to_state: product.vendor.vendor_address.state,
                            to_country: product.vendor.vendor_address.country,
                        }
                    ],
                    '$rider.vendor_unique_id$': product.vendor_unique_id,
                    '$rider.availability$': true_status
                },
                order: [
                    ['price', 'ASC']
                ],
                limit: 10,
                include: [
                    {
                        model: RIDERS,
                        as: 'rider',
                        required: true,
                        attributes: ['vendor_unique_id', 'firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'availability', 'verification', 'profile_image'],
                        include: [
                            {
                                model: VENDORS,
                                attributes: ['name', 'stripped', 'email', 'profile_image', 'cover_image', 'verification']
                            }
                        ]
                    }
                ]
            });

            const freelance_rider_shipping = await RIDER_SHIPPING.findAll({
                attributes: ['unique_id', 'rider_unique_id', 'min_weight', 'max_weight', 'price', 'from_city', 'from_state', 'from_country', 'to_city', 'to_state', 'to_country'],
                where: {
                    min_weight: {
                        [Op.lte]: product.weight
                    },
                    max_weight: {
                        [Op.gte]: product.weight
                    },
                    [Op.or]: [
                        {
                            from_city: product.vendor.vendor_address.city,
                            from_state: product.vendor.vendor_address.state,
                            from_country: product.vendor.vendor_address.country,
                            to_city: address.city,
                            to_state: address.state,
                            to_country: address.country,
                        },
                        {
                            from_city: address.city,
                            from_state: address.state,
                            from_country: address.country,
                            to_city: product.vendor.vendor_address.city,
                            to_state: product.vendor.vendor_address.state,
                            to_country: product.vendor.vendor_address.country,
                        }
                    ],
                    '$rider.vendor_unique_id$': null,
                    '$rider.availability$': true_status,
                },
                order: [
                    ['price', 'ASC']
                ],
                limit: 10,
                include: [
                    {
                        model: RIDERS,
                        as: 'rider',
                        attributes: ['vendor_unique_id', 'firstname', 'middlename', 'lastname', 'email', 'mobile_number', 'availability', 'verification', 'profile_image']
                    }
                ]
            });

            SuccessResponse(res, { unique_id: user_unique_id, text: "Product Shipping Loaded!" }, { default_rider_shipping, freelance_rider_shipping });            
        }
    }
};

export function getRiderShippings(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    RIDER_SHIPPING.findAndCountAll({
        attributes: { exclude: ['id', 'rider_unique_id', 'status', 'createdAt'] },
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

export function getRiderShipping(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        RIDER_SHIPPING.findOne({
            attributes: { exclude: ['rider_unique_id', 'id', 'status', 'createdAt'] },
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
            await db.sequelize.transaction(async (transaction) => {

                const existing_rider_shipping = await RIDER_SHIPPING.findOne({
                    where: {
                        rider_unique_id: rider_unique_id,
                        min_weight: payload.min_weight,
                        max_weight: payload.max_weight,
                        from_city: payload.from_city,
                        from_state: payload.from_state,
                        from_country: payload.from_country,
                        to_city: payload.to_city,
                        to_state: payload.to_state,
                        to_country: payload.to_country,
                        status: default_status
                    }
                });
                
                if (existing_rider_shipping) {
                    BadRequestError(res, { unique_id: rider_unique_id, text: "Exact shipping already exists!" }, null);
                } else {
                    const rider_shipping = await RIDER_SHIPPING.create(
                        {
                            unique_id: uuidv4(),
                            rider_unique_id,
                            ...payload,
                            status: default_status
                        }, { transaction }
                    );
        
                    if (rider_shipping) {
                        CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping created successfully!" });
                    } else {
                        throw new Error("Error adding shipping");
                    }
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};

export async function addRiderShippingMultiple(req, res) {
    const rider_unique_id = req.RIDER_UNIQUE_ID;

    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: rider_unique_id, text: "Validation Error Occured" }, errors.array())
    } else {
        try {
            await db.sequelize.transaction(async (transaction) => {

                const shipping = payload.shipping.map(object => {
                    return { ...object, unique_id: uuidv4(), rider_unique_id, status: default_status };
                });

                const rider_shipping = await RIDER_SHIPPING.bulkCreate(shipping, { transaction });

                if (rider_shipping) {
                    CreationSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping created successfully!" });
                } else {
                    throw new Error("Error adding shipping");
                }
            });
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
            await db.sequelize.transaction(async (transaction) => {

                const rider_shipping = await RIDER_SHIPPING.update(
                    {
                        ...payload
                    }, {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );

                if (rider_shipping > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping was updated successfully!" });
                } else {
                    throw new Error("Error updating shipping");
                }
            });
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
            await db.sequelize.transaction(async (transaction) => {
                
                const rider_shipping = await RIDER_SHIPPING.destroy(
                    {
                        where: {
                            unique_id: payload.unique_id,
                            rider_unique_id,
                            status: default_status
                        }, 
                        transaction
                    }
                );
    
                if (rider_shipping > 0) {
                    OtherSuccessResponse(res, { unique_id: rider_unique_id, text: "Shipping was deleted successfully!" });
                } else {
                    throw new Error("Error deleting shipping");
                }
            });
        } catch (err) {
            ServerError(res, { unique_id: rider_unique_id, text: err.message }, null);
        }
    }
};
