import { checks } from "../middleware/index.js";
import { order_history_rules } from "../rules/ordersHistory.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { order_rules } from "../rules/orders.rules.js";
import {
    getOrderHistorySpecifically, rootGetOrderHistory, rootGetOrdersHistory
} from "../controllers/ordersHistory.controller.js";

export default function (app) {
    app.get("/root/orders/history", [checks.verifyKey, checks.isAdministratorKey], rootGetOrdersHistory);
    app.get("/root/orders/history/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetOrderHistory);
    app.get("/root/orders/history/via/order", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrderAlt], rootGetOrderHistory);

    app.get("/order/history", [checks.verifyToken, checks.isUser, order_history_rules.forFindingOrderHistoryViaOrder], getOrderHistorySpecifically);
};
