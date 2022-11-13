import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, default_delete_status, strip_text, check_length_TEXT } from '../config/config.js';

const VENDORS = db.vendors;
const PRODUCTS = db.products;
const CATEGORIES = db.categories;
const MENUS = db.menus;
const Op = db.Sequelize.Op;

export const product_rules = {
    forFindingProduct: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return PRODUCTS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Product not found!');
                });
            })
    ],
    forFindingProductFalsy: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return PRODUCTS.findOne({
                    where: {
                        unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_delete_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Product not found!');
                });
            })
    ],
    forFindingProductAlt: [
        check('product_unique_id', "Product Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(product_unique_id => {
                return PRODUCTS.findOne({ where: { unique_id: product_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Product not found!');
                });
            })
    ],
    forAdding: [
        check('vendor_unique_id', "Vendor Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(vendor_unique_id => {
                return VENDORS.findOne({ where: { unique_id: vendor_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Vendor not found!');
                });
            }),
        check('menu_unique_id')
            .optional({ checkFalsy: false })
            .bail()
            .custom((menu_unique_id, { req }) => {
                return MENUS.findOne({ 
                    where: { 
                        unique_id: menu_unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '', 
                        status: default_status 
                    } 
                }).then(data => {
                    if (!data) return Promise.reject('Menu not found!');
                });
            }),
        check('category_unique_id', "Category Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((category_unique_id, { req }) => {
                return CATEGORIES.findOne({
                    where: {
                        unique_id: category_unique_id,
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Category not found!');
                });
            }),
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 200 })
            .withMessage("Invalid length (3 - 200) characters")
            .bail()
            .custom((name, { req }) => {
                return PRODUCTS.findOne({ 
                    where: { 
                        stripped: strip_text(name), 
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status 
                    } 
                }).then(data => {
                    if (data) return Promise.reject('Product already exists!');
                });
            }),
        check('description', "Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`),
        check('duration')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('weight', "Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(weight => {
                if (weight === 0) return false;
                else if (weight < 0) return false;
                else return true;
            })
            .withMessage("Weight invalid"),
        check('quantity', "Quantity is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(quantity => {
                if (quantity === 0) return false;
                else if (quantity < 0) return false;
                else return true;
            })
            .withMessage("Quantity invalid"),
        check('remaining')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .custom(remaining => {
                if (remaining === 0) return false;
                else if (remaining < 0) return false;
                else return true;
            })
            .withMessage("Remaining invalid"),
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
        check('sales_price')
            .optional({ checkFalsy: false })
            .bail()
            .isFloat()
            .custom(sales_price => {
                if (sales_price === 0) return false;
                else if (sales_price < 0) return false;
                else return true;
            })
            .withMessage("Sales Price invalid")
    ],
    forUpdatingName: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom((name, { req }) => {
                return PRODUCTS.findOne({
                    where: {
                        stripped: strip_text(name),
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (data) return Promise.reject('Product already exists!');
                });
            })
    ],  
    forUpdatingDescription: [
        check('description', "Description is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isLength({ min: 3, max: check_length_TEXT })
            .withMessage(`Invalid length (3 - ${check_length_TEXT}) characters`)
    ],
    forUpdatingCriteria: [
        check('duration')
            .optional({ checkFalsy: false })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters"),
        check('weight', "Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isFloat()
            .custom(weight => {
                if (weight === 0) return false;
                else if (weight < 0) return false;
                else return true;
            })
            .withMessage("Weight invalid")
    ],
    forUpdatingStock: [
        check('quantity', "Quantity is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(quantity => {
                if (quantity === 0) return false;
                else if (quantity < 0) return false;
                else return true;
            })
            .withMessage("Quantity invalid"),
        check('remaining')
            .optional({ checkFalsy: false })
            .bail()
            .isInt()
            .custom(remaining => {
                if (remaining === 0) return false;
                else if (remaining < 0) return false;
                else return true;
            })
            .withMessage("Remaining invalid")
    ],
    forUpdatingPrices: [
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
        check('sales_price')
            .optional({ checkFalsy: false })
            .bail()
            .isFloat()
            .custom(sales_price => {
                if (sales_price === 0) return false;
                else if (sales_price < 0) return false;
                else return true;
            })
            .withMessage("Sales Price invalid")
    ],
    forUpdatingMenu: [
        check('menu_unique_id')
            .optional({ checkFalsy: false })
            .bail()
            .custom((menu_unique_id, { req }) => {
                return MENUS.findOne({
                    where: {
                        unique_id: menu_unique_id,
                        vendor_unique_id: req.query.vendor_unique_id || req.body.vendor_unique_id || '',
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Menu not found!');
                });
            }),
    ],
    forUpdatingCategory: [
        check('category_unique_id', "Category Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((category_unique_id, { req }) => {
                return CATEGORIES.findOne({
                    where: {
                        unique_id: category_unique_id,
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Category not found!');
                });
            })
    ]
};  