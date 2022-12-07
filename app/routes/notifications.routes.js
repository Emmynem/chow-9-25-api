import { checks } from "../middleware/index.js";
import { notification_rules } from "../rules/notifications.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { 
    getUserNotification, getUserNotifications, removeUserNotification, rootGetNotifications,
    rootGetNotificationsSpecifically, updateUserNotificationSeen
} from "../controllers/notifications.controller.js";

export default function (app) {
    app.get("/root/notifications", [checks.verifyKey, checks.isAdministratorKey], rootGetNotifications);
    app.get("/root/notifications/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetNotificationsSpecifically);

    app.get("/notifications", [checks.verifyToken, checks.isUser], getUserNotifications);
    app.get("/notification", [checks.verifyToken, checks.isUser, notification_rules.forFindingNotification], getUserNotification);

    app.put("/notification/seen", [checks.verifyToken, checks.isUser, notification_rules.forFindingNotification], updateUserNotificationSeen);

    app.delete("/notification", [checks.verifyToken, checks.isUser, notification_rules.forFindingNotification], removeUserNotification);
};
