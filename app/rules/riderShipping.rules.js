import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status } from '../config/config.js';

const RIDERS = db.riders;
const RIDER_SHIPPING = db.rider_shipping;

export const rider_shipping_rules = {
    forFindingRiderShipping: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return RIDER_SHIPPING.findOne({
                    where: {
                        unique_id,
                        rider_unique_id: req.query.rider_unique_id || req.body.rider_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rider Shipping not found!');
                });
            })
    ],
    forFindingRiderShippingFalsy: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return RIDER_SHIPPING.findOne({
                    where: {
                        unique_id,
                        rider_unique_id: req.query.rider_unique_id || req.body.rider_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Rider Shipping not found!');
                });
            })
    ],
    forFindingRiderShippingAlt: [
        check('rider_shipping_unique_id', "Rider Shipping Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_shipping_unique_id => {
                return RIDER_SHIPPING.findOne({ where: { unique_id: rider_shipping_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider Shipping not found!');
                });
            })
    ],
    forAdding: [
        check('rider_unique_id', "Rider Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(rider_unique_id => {
                return RIDERS.findOne({ where: { unique_id: rider_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Rider not found!');
                });
            }),
        check('min_weight', "Min Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(min_weight => {
                if (min_weight === 0) return false;
                else if (min_weight < 0) return false;
                else return true;
            })
            .withMessage("Min Weight invalid"),
        check('max_weight', "Max Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom((max_weight, { req }) => {
                if (max_weight === 0) return false;
                else if (req.body.min_weight > max_weight || req.query.min_weight > max_weight) return false;
                else if (max_weight < 0) return false;
                else return true;
            })
            .withMessage("Max Weight invalid"),
        check('price', "Price is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(price => {
                if (price === 0) return false;
                else if (price < 0) return false;
                else return true;
            })
            .withMessage("Price invalid"),
        check('city', "City is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('state', "State is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('country', "Country is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ],
    forUpdatingCriteria: [
        check('min_weight', "Min Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(min_weight => {
                if (min_weight === 0) return false;
                else if (min_weight < 0) return false;
                else return true;
            })
            .withMessage("Min Weight invalid"),
        check('max_weight', "Max Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom((max_weight, { req }) => {
                if (max_weight === 0) return false;
                else if (req.body.min_weight > max_weight || req.query.min_weight > max_weight) return false;
                else if (max_weight < 0) return false;
                else return true;
            })
            .withMessage("Max Weight invalid"),
        check('price', "Price is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(price => {
                if (price === 0) return false;
                else if (price < 0) return false;
                else return true;
            })
            .withMessage("Price invalid")
    ],
    forUpdatingLocation: [
        check('city', "City is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('state', "State is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('country', "Country is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
    ]
};  