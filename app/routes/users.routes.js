import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { usersMiddleware } from "../middleware/users.middleware.js";
import {
    getUser, removeUser, removeUserPermanently, restoreUser, rootGetUser, rootGetUsers,
    rootSearchUsers, updateProfileImage, updateUser, updateUserAccessGranted, updateUserAccessRevoked,
    updateUserAccessSuspended, updateUserEmailVerified, updateUserMobileNumberVerified
} from "../controllers/users.controller.js";

export default function (app) {
    app.get("/root/users", [checks.verifyKey, checks.isAdministratorKey], rootGetUsers);
    app.get("/root/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], rootGetUser);
    app.get("/root/users/search", [checks.verifyKey, checks.isAdministratorKey, user_rules.forSearching], rootSearchUsers);

    app.get("/user/profile", [checks.verifyToken, checks.isUser], getUser);

    app.post("/user/profile/image", [checks.verifyToken, checks.isUser, usersMiddleware], updateProfileImage);
    app.post("/user/verify/email", [user_rules.forFindingUserEmailForVerification], updateUserEmailVerified);
    app.post("/user/verify/mobile", [user_rules.forFindingUserMobileNumberForVerification], updateUserMobileNumberVerified);

    app.put("/user/profile", [checks.verifyToken, checks.isUser, user_rules.forUpdating], updateUser);
    app.put("/root/user/access/grant", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], updateUserAccessGranted);
    app.put("/root/user/access/suspend", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], updateUserAccessSuspended);
    app.put("/root/user/access/revoke", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], updateUserAccessRevoked);
    app.put("/root/user/remove", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], removeUser);
    app.put("/root/user/restore", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserFalsy], restoreUser);

    // app.delete("/root/user/delete", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUser], removeUserPermanently);
};
