import { checks } from "../middleware/index.js";
import { vendor_user_rules } from "../rules/vendorUsers.rules.js";
import {
    addVendorUser, deleteVendorUser, getVendorUser, getVendorUserDetails, getVendorUsers, removeVendorUser,
    restoreVendorUser, rootGetVendorUser, rootGetVendorUsers, updateVendorUserAccessGranted, updateVendorUserAccessRevoked,
    updateVendorUserAccessSuspended, updateVendorUserDetails, updateVendorUserProfileDetails, updateVendorUserRoutes,
    rootSearchVendorUsers
} from "../controllers/vendorUsers.controller.js";

export default function (app) {
    app.get("/root/vendors/users", [checks.verifyKey, checks.isAdministratorKey], rootGetVendorUsers);
    app.get("/root/vendors/user", [checks.verifyKey, checks.isAdministratorKey, vendor_user_rules.forFindingVendorUser], rootGetVendorUser);
    app.get("/root/vendors/users/search", [checks.verifyKey, checks.isAdministratorKey, vendor_user_rules.forSearching], rootSearchVendorUsers);

    app.get("/vendors/users", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorUsers);
    app.get("/vendors/user", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser], getVendorUser);
    app.get("/vendors/user/profile", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorUserDetails);

    app.post("/vendors/user", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forAdding], addVendorUser);

    app.put("/vendors/user/profile", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forUpdatingDetails], updateVendorUserProfileDetails);
    app.put("/vendors/user", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser, vendor_user_rules.forUpdatingDetails], updateVendorUserDetails);
    app.put("/vendors/user/routes", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser, vendor_user_rules.forUpdatingRoutes], updateVendorUserRoutes);
    app.put("/vendors/user/access/grant", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser], updateVendorUserAccessGranted);
    app.put("/vendors/user/access/suspend", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser], updateVendorUserAccessSuspended);
    app.put("/vendors/user/access/revoke", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser], updateVendorUserAccessRevoked);
    app.put("/vendors/user/remove", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser], removeVendorUser);
    app.put("/vendors/user/restore", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUserFalsy], restoreVendorUser);

    // app.delete("/vendors/user/delete", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_user_rules.forFindingVendorUser], deleteVendorUser);
};
