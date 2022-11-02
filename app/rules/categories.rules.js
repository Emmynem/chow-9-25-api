import { check } from 'express-validator';
import db from "../models/index.js";
import { strip_text, default_status, default_delete_status } from '../config/config.js';

const CATEGORIES = db.categories;
const Op = db.Sequelize.Op;

export const category_rules = {
    forFindingCategory: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return CATEGORIES.findOne({ where: { unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Category not found!');
                });
            })
    ],
    forFindingCategoryFalsy: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(unique_id => {
                return CATEGORIES.findOne({ where: { unique_id, status: default_delete_status } }).then(data => {
                    if (!data) return Promise.reject('Category not found!');
                });
            })
    ],
    forFindingCategoryAlt: [
        check('category_unique_id', "Category Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(category_unique_id => {
                return CATEGORIES.findOne({ where: { unique_id: category_unique_id, status: default_status } }).then(data => {
                    if (!data) return Promise.reject('Category not found!');
                });
            })
    ],
    forAdding: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom(name => {
                return CATEGORIES.findOne({ where: { stripped: strip_text(name), status: default_status } }).then(data => {
                    if (data) return Promise.reject('Category already exists!');
                });
            })
    ],
    forEditing: [
        check('name', "Name is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isString().isLength({ min: 3, max: 50 })
            .withMessage("Invalid length (3 - 50) characters")
            .bail()
            .custom((name, { req }) => {
                return CATEGORIES.findOne({
                    where: {
                        stripped: strip_text(name),
                        unique_id: {
                            [Op.ne]: req.query.unique_id || req.body.unique_id || '',
                        },
                        status: default_status
                    }
                }).then(data => {
                    if (data) return Promise.reject('Category already exists!');
                });
            })
    ]
};  