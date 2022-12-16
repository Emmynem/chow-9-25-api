import { checks } from "../middleware/index.js";
import { product_rules } from "../rules/products.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { vendor_user_rules } from "../rules/vendorUsers.rules.js";
import { menu_rules } from "../rules/menus.rule.js";
import { category_rules } from "../rules/categories.rules.js";
import { vendorProductMiddleware } from "../middleware/products.middleware.js";
import {
    addProduct, addProductImage, deleteProductImage, editProductImage, getProduct, getProducts, 
    removeProduct, restoreProduct, rootGetProduct, rootGetProducts, rootGetProductsSpecifically, 
    updateProductName, updateProductOthers, getProductGenerally, getProductsGenerally,
    getProductsByCategoryGenerally, getProductsByVendorCategoryGenerally, getProductsByVendorGenerally, 
    getProductsByVendorMenuGenerally, searchProducts
} from "../controllers/products.controller.js";

export default function (app) {
    app.get("/root/products", [checks.verifyKey, checks.isAdministratorKey], rootGetProducts);
    app.get("/root/products/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetProductsSpecifically);
    app.get("/root/products/via/vendor/user", [checks.verifyKey, checks.isAdministratorKey, vendor_user_rules.forFindingVendorUserAlt], rootGetProductsSpecifically);
    app.get("/root/products/via/menu", [checks.verifyKey, checks.isAdministratorKey, menu_rules.forFindingMenuAlt], rootGetProductsSpecifically);
    app.get("/root/products/via/category", [checks.verifyKey, checks.isAdministratorKey, category_rules.forFindingCategoryAlt], rootGetProductsSpecifically);
    app.get("/root/product", [checks.verifyKey, checks.isAdministratorKey, product_rules.forFindingProductAlt], rootGetProduct);

    app.get("/search/products", [product_rules.forSearching], searchProducts);
    app.get("/products", getProductsGenerally);
    app.get("/products/via/vendor/:stripped", getProductsByVendorGenerally);
    app.get("/products/via/vendor/menu/:vendor_stripped/:menu_stripped", getProductsByVendorMenuGenerally);
    app.get("/products/via/vendor/category/:vendor_stripped/:category_stripped", getProductsByVendorCategoryGenerally);
    app.get("/products/via/category/:stripped", getProductsByCategoryGenerally);
    app.get("/public/product/:vendor_stripped/:stripped", getProductGenerally);
    app.get("/product/:vendor_stripped/:stripped", [checks.verifyToken, checks.isUser], getProductGenerally);

    app.get("/vendors/products", [checks.verifyVendorUserToken, checks.isVendorUser], getProducts);
    app.get("/vendors/product", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct], getProduct);

    app.post("/vendors/product", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forAdding], addProduct);
    app.post("/vendors/product/image", [checks.verifyVendorUserToken, checks.isVendorUser, vendorProductMiddleware, product_rules.forFindingProductAlt], addProductImage);

    app.put("/vendors/product/name", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, category_rules.forFindingCategoryAlt, product_rules.forUpdatingName], updateProductName);
    app.put("/vendors/product/description", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, product_rules.forUpdatingDescription], updateProductOthers);
    app.put("/vendors/product/criteria", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, product_rules.forUpdatingCriteria], updateProductOthers);
    app.put("/vendors/product/stock", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, product_rules.forUpdatingStock], updateProductOthers);
    app.put("/vendors/product/prices", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, product_rules.forUpdatingPrices], updateProductOthers);
    app.put("/vendors/product/menu", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, product_rules.forUpdatingMenu], updateProductOthers);
    app.put("/vendors/product/category", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct, product_rules.forUpdatingCategory], updateProductOthers);
    app.put("/vendors/product/image", [checks.verifyVendorUserToken, checks.isVendorUser, vendorProductMiddleware, product_rules.forFindingProductImage], editProductImage);
    app.put("/vendors/product/remove", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProduct], removeProduct);
    app.put("/vendors/product/restore", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProductFalsy], restoreProduct);

    app.delete("/vendors/product/image", [checks.verifyVendorUserToken, checks.isVendorUser, product_rules.forFindingProductImage], deleteProductImage);  
};
