import { checks } from "../middleware/index.js";
import { rider_rules } from "../rules/riders.rules.js";
import { ridersMiddleware } from "../middleware/riders.middleware.js";
import {
    changeRiderAvailability, getRider, removeRider, removeRiderPermanently, removeRiderPermanentlyViaVendor, removeRiderViaVendor, restoreRider, restoreRiderViaVendor, rootGetRider, rootGetRiders,
    rootSearchRiders, unverifyRider, unverifyRiderViaVendor, updateProfileImage, updateRider, updateRiderAccessGranted, updateRiderAccessGrantedViaVendor, updateRiderAccessRevoked,
    updateRiderAccessRevokedViaVendor, updateRiderAccessSuspended, updateRiderAccessSuspendedViaVendor, updateRiderEmailVerified, updateRiderMobileNumberVerified, verifyRider, verifyRiderViaVendor,
    getVendorRider, getVendorRiders
} from "../controllers/riders.controller.js";
import { vendorAddRider } from '../controllers/auth.controller.js';

export default function (app) {
    app.get("/root/riders", [checks.verifyKey, checks.isAdministratorKey], rootGetRiders);
    app.get("/root/rider", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], rootGetRider);
    app.get("/root/riders/search", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forSearching], rootSearchRiders);

    app.get("/rider/profile", [checks.verifyRiderToken, checks.isRider], getRider);

    app.get("/vendors/riders", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorRiders);
    app.get("/vendors/rider", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], getVendorRider);

    app.post("/vendors/rider", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forAddingViaVendor], vendorAddRider);

    app.post("/rider/profile/image", [checks.verifyRiderToken, checks.isRider, ridersMiddleware], updateProfileImage);
    app.post("/rider/verify/email", [rider_rules.forFindingRiderEmailForVerification], updateRiderEmailVerified);
    app.post("/rider/verify/mobile", [rider_rules.forFindingRiderMobileNumberForVerification], updateRiderMobileNumberVerified);

    app.put("/rider/profile", [checks.verifyRiderToken, checks.isRider, rider_rules.forUpdating], updateRider);
    app.put("/rider/availability", [checks.verifyRiderToken, checks.isRider], changeRiderAvailability);
    app.put("/root/rider/access/grant", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], updateRiderAccessGranted);
    app.put("/root/rider/access/suspend", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], updateRiderAccessSuspended);
    app.put("/root/rider/access/revoke", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], updateRiderAccessRevoked);
    app.put("/vendors/rider/access/grant", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], updateRiderAccessGrantedViaVendor);
    app.put("/vendors/rider/access/suspend", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], updateRiderAccessSuspendedViaVendor);
    app.put("/vendors/rider/access/revoke", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], updateRiderAccessRevokedViaVendor);
    app.put("/root/rider/verify", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], verifyRider);
    app.put("/root/rider/unverify", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], unverifyRider);
    app.put("/vendors/rider/verify", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], verifyRiderViaVendor);
    app.put("/vendors/rider/unverify", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], unverifyRiderViaVendor);
    app.put("/root/rider/remove", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], removeRider);
    app.put("/root/rider/restore", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRiderFalsy], restoreRider);
    app.put("/vendors/rider/remove", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], removeRiderViaVendor);
    app.put("/vendors/rider/restore", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendorFalsy], restoreRiderViaVendor);

    // app.delete("/root/rider/delete", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRider], removeRiderPermanently);
    // app.delete("/vendors/rider/delete", [checks.verifyVendorUserToken, checks.isVendorUser, rider_rules.forFindingRiderViaVendor], removeRiderPermanentlyViaVendor);
};
