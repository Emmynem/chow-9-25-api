import { checks } from "../middleware/index.js";
import { order_completed_rules } from "../rules/ordersCompleted.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { order_rules } from "../rules/orders.rules.js";
import {
    getOrderCompleted, getOrdersCompletedSpecifically, getOrdersCompleted, rootGetOrderCompleted,
    rootGetOrdersCompleted, rootGetOrdersCompletedSpecifically, getRiderOrdersCompleted, getVendorOrdersCompleted
} from "../controllers/ordersCompleted.controller.js";

export default function (app) {
    app.get("/root/orders/completed", [checks.verifyKey, checks.isAdministratorKey], rootGetOrdersCompleted);
    app.get("/root/orders/completed/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetOrdersCompletedSpecifically);
    app.get("/root/orders/completed/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetOrdersCompletedSpecifically);
    app.get("/root/orders/completed/via/order", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrderAlt], rootGetOrdersCompletedSpecifically);
    app.get("/root/orders/completed/via/tracking", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrderViaTrackingNumberAlt], rootGetOrdersCompletedSpecifically);
    app.get("/root/order/completed", [checks.verifyKey, checks.isAdministratorKey, order_completed_rules.forFindingOrderCompleted], rootGetOrderCompleted);

    app.get("/vendors/orders/completed", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorOrdersCompleted);

    app.get("/riders/orders/completed", [checks.verifyRiderToken, checks.isRider], getRiderOrdersCompleted);

    app.get("/orders/completed", [checks.verifyToken, checks.isUser], getOrdersCompleted);
    app.get("/orders/completed/via/tracking", [checks.verifyToken, checks.isUser, order_completed_rules.forFindingOrderCompletedViaTrackingNumber], getOrdersCompletedSpecifically);
    app.get("/order/completed", [checks.verifyToken, checks.isUser, order_completed_rules.forFindingOrderCompleted], getOrderCompleted);
};
