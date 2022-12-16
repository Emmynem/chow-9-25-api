import { checks } from "../middleware/index.js";
import { view_history_rules } from "../rules/viewHistory.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { product_rules } from "../rules/products.rules.js";
import {
    getViewHistories, deleteViewHistory, rootGetViewHistories, rootGetViewHistorySpecifically
} from "../controllers/viewHistory.controller.js";

export default function (app) {
    app.get("/root/product/view/histories", [checks.verifyKey, checks.isAdministratorKey], rootGetViewHistories);
    app.get("/root/product/view/history/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetViewHistorySpecifically);
    app.get("/root/product/view/history/via/product", [checks.verifyKey, checks.isAdministratorKey, product_rules.forFindingProductAlt], rootGetViewHistorySpecifically);

    app.get("/user/product/view/history", [checks.verifyToken, checks.isUser], getViewHistories);

    app.delete("/user/product/view/history", [checks.verifyToken, checks.isUser, view_history_rules.forFindingViewHistory], deleteViewHistory);
};
