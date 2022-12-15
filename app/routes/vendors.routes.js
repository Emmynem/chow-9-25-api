import { checks } from "../middleware/index.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { vendorProfileImageMiddleware } from "../middleware/vendors.profile.middleware.js";
import { vendorCoverImageMiddleware } from "../middleware/vendors.cover.middleware.js";
import {
    getVendor, proVendorDowngrade, proVendorUpgrade, removeVendor, removeVendorPermanently, restoreVendor, 
    rootGetVendor, rootGetVendors, rootGetVendorsSpecifically, rootSearchVendors, unverifyVendor, updateCoverImage,
    updateProfileImage, updateVendorName, updateVendorOthers, updateVendorAccessGranted, updateVendorAccessRevoked, 
    updateVendorAccessSuspended, verifyVendor, searchVendors
} from "../controllers/vendors.controller.js";

export default function (app) {
    app.get("/root/vendors", [checks.verifyKey, checks.isAdministratorKey], rootGetVendors);
    app.get("/root/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], rootGetVendor);
    app.get("/root/vendors/via/opening/hours", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingViaOpeningHours], rootGetVendorsSpecifically);
    app.get("/root/vendors/via/closing/hours", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingViaClosingHours], rootGetVendorsSpecifically);
    app.get("/root/vendors/via/pro", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingViaPro], rootGetVendorsSpecifically);
    app.get("/root/vendors/via/verification", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingViaVerification], rootGetVendorsSpecifically);
    app.get("/root/vendors/search", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forSearching], rootSearchVendors);

    app.get("/search/vendors", [vendor_rules.forSearching], searchVendors);
    app.get("/vendor/profile", [checks.verifyVendorUserToken, checks.isVendorUser], getVendor);

    app.post("/vendor/profile/image", [checks.verifyVendorUserToken, checks.isVendorUser, vendorProfileImageMiddleware], updateProfileImage);
    app.post("/vendor/cover/image", [checks.verifyVendorUserToken, checks.isVendorUser, vendorCoverImageMiddleware], updateCoverImage);
    app.post("/vendor/upgrade", [checks.verifyKey, checks.isInternalKey, vendor_rules.forFindingVendor], proVendorUpgrade);
    app.post("/vendor/downgrade", [checks.verifyKey, checks.isInternalKey, vendor_rules.forFindingVendor], proVendorDowngrade);

    app.put("/vendor/name", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forUpdatingName], updateVendorName);
    app.put("/vendor/description", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forUpdatingDescription], updateVendorOthers);
    app.put("/vendor/hours", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forUpdatingHours], updateVendorOthers);
    app.put("/root/vendor/access/grant", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], updateVendorAccessGranted);
    app.put("/root/vendor/access/suspend", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], updateVendorAccessSuspended);
    app.put("/root/vendor/access/revoke", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], updateVendorAccessRevoked);
    app.put("/root/vendor/verify", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], verifyVendor);
    app.put("/root/vendor/unverify", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], unverifyVendor);
    app.put("/root/vendor/remove", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], removeVendor);
    app.put("/root/vendor/restore", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorFalsy], restoreVendor);

    app.delete("/root/vendor/delete", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendor], removeVendorPermanently);
};
