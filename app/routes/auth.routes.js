import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { rider_rules } from "../rules/riders.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { 
    riderChangePassword, riderPasswordRecovery, riderSignUp, riderSigninViaEmail, riderSigninViaMobile,
    userChangePassword, userPasswordRecovery, userSignUp, userSigninViaEmail, userSigninViaMobile,
    vendorSignUp, vendorUserSignin, vendorUserVerifyOtp
} from "../controllers/auth.controller.js";

export default function (app) {
    // User Auth Routes 
    app.post("/auth/user/signin/email", [user_rules.forEmailLogin], userSigninViaEmail);
    app.post("/auth/user/signin/mobile", [user_rules.forMobileLogin, userSigninViaMobile]);
    app.post("/auth/user/signup", [user_rules.forAdding], userSignUp);

    // User password change & recovery routes
    app.post("/user/password/change", [checks.verifyToken, checks.isUser, user_rules.forChangingPassword], userChangePassword);
    app.post("/user/password/recover/email", [user_rules.forEmailPasswordReset], userPasswordRecovery);
    app.post("/user/password/recover/mobile", [user_rules.forMobilePasswordReset], userPasswordRecovery);

    // Rider Auth Routes 
    app.post("/auth/rider/signin/email", [rider_rules.forEmailLogin], riderSigninViaEmail);
    app.post("/auth/rider/signin/mobile", [rider_rules.forMobileLogin, riderSigninViaMobile]);
    app.post("/auth/rider/signup", [rider_rules.forAdding], riderSignUp);

    // Rider password change & recovery routes
    app.post("/rider/password/change", [checks.verifyRiderToken, checks.isRider, rider_rules.forChangingPassword], riderChangePassword);
    app.post("/rider/password/recover/email", [rider_rules.forEmailPasswordReset], riderPasswordRecovery);
    app.post("/rider/password/recover/mobile", [rider_rules.forMobilePasswordReset], riderPasswordRecovery);

    // Vendor Auth Routes
    app.post("/auth/vendor/access/:stripped", [vendor_rules.forVendorLogin], vendorUserSignin);
    app.post("/auth/vendor/access/:stripped/verify", [vendor_rules.forVerifyingOtp], vendorUserVerifyOtp);
    app.post("/auth/vendor/signup/", [vendor_rules.forAdding], vendorSignUp);
};