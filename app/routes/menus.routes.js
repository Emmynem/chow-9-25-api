import { checks } from "../middleware/index.js";
import { menu_rules } from "../rules/menus.rule.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { 
    addMenu, deleteMenu, getMenu, getMenus, rootGetMenu, rootGetMenus, rootGetMenusSpecifically, 
    updateMenuDuration, updateMenuName, getMenusByVendorGenerally
} from "../controllers/menus.controller.js";

export default function (app) {
    app.get("/root/menus", [checks.verifyKey, checks.isAdministratorKey], rootGetMenus);
    app.get("/root/menus/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetMenusSpecifically);
    app.get("/root/menu", [checks.verifyKey, checks.isAdministratorKey, menu_rules.forFindingMenuAlt], rootGetMenu);

    app.get("/menus/via/vendor/:stripped", getMenusByVendorGenerally);

    app.get("/vendors/menus", [checks.verifyVendorUserToken, checks.isVendorUser], getMenus);
    app.get("/vendors/menu", [checks.verifyVendorUserToken, checks.isVendorUser, menu_rules.forFindingMenu], getMenu);

    app.post("/vendors/menu", [checks.verifyVendorUserToken, checks.isVendorUser, menu_rules.forAdding], addMenu);

    app.put("/vendors/menu/name", [checks.verifyVendorUserToken, checks.isVendorUser, menu_rules.forFindingMenu, menu_rules.forEditing], updateMenuName);
    app.put("/vendors/menu/duration", [checks.verifyVendorUserToken, checks.isVendorUser, menu_rules.forFindingMenu, menu_rules.forUpdatingMenuDuration], updateMenuDuration);

    app.delete("/vendors/menu", [checks.verifyVendorUserToken, checks.isVendorUser, menu_rules.forFindingMenu], deleteMenu);
};
