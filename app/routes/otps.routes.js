import { checks } from "../middleware/index.js";
import { otps_rules } from "../rules/otps.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import {
    createOtp, rootGetOtps, rootGetVendorOtpViaCode, rootGetVendorOtps, verifyOtp
} from "../controllers/otps.controller.js";

export default function (app) {
    app.get("/root/otps", [checks.verifyKey, checks.isAdministratorKey], rootGetOtps);
    app.get("/root/otps/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetVendorOtps);
    app.get("/root/otp/via/code", [checks.verifyKey, checks.isAdministratorKey, otps_rules.forFindingVendorOtpViaCode], rootGetVendorOtpViaCode);

    app.post("/vendors/otp/create", [checks.verifyVendorUserToken, checks.isVendorUser], createOtp);
    app.post("/vendors/otp/verify", [checks.verifyVendorUserToken, checks.isVendorUser, otps_rules.forVerifyingOtp], verifyOtp);
};
