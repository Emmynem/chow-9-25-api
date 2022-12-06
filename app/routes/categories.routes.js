import { checks } from "../middleware/index.js";
import { category_rules } from "../rules/categories.rules.js";
import { categoryMiddleware } from "../middleware/categories.middleware.js";
import { 
    addCategory, addCategoryImage, deleteCategoryImage, editCategoryImage, getCategoriesForUsers, 
    getCategoriesForVendors, removeCategory, restoreCategory, rootGetCategories, rootGetCategory, 
    updateCategory
} from "../controllers/categories.controller.js";

export default function (app) {
    app.get("/root/categories", [checks.verifyKey, checks.isAdministratorKey], rootGetCategories);
    app.get("/root/category", [checks.verifyKey, checks.isAdministratorKey, category_rules.forFindingCategoryAlt], rootGetCategory);
    app.get("/categories", getCategoriesForUsers);
    app.get("/vendors/categories", [checks.verifyVendorUserToken, checks.isVendorUser], getCategoriesForVendors);

    app.post("/root/category", [checks.verifyKey, checks.isAdministratorKey, category_rules.forAdding], addCategory);
    app.post("/root/category/image", [checks.verifyKey, checks.isAdministratorKey, categoryMiddleware, category_rules.forFindingCategoryAlt], addCategoryImage);
    
    app.put("/root/category", [checks.verifyKey, checks.isAdministratorKey, category_rules.forFindingCategory, category_rules.forEditing], updateCategory);
    app.put("/root/category/image", [checks.verifyKey, checks.isAdministratorKey, categoryMiddleware, category_rules.forFindingCategoryImage], editCategoryImage);
    app.put("/root/category/remove", [checks.verifyKey, checks.isAdministratorKey, category_rules.forFindingCategory], removeCategory);
    app.put("/root/category/restore", [checks.verifyKey, checks.isAdministratorKey, category_rules.forFindingCategoryFalsy], restoreCategory);

    app.delete("/root/category/image", [checks.verifyKey, checks.isAdministratorKey, category_rules.forFindingCategoryImage], deleteCategoryImage);
};
