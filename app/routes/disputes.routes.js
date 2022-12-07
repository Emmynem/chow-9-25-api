import { checks } from "../middleware/index.js";
import { dispute_rules } from "../rules/disputes.rules.js";
import { order_rules } from "../rules/orders.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { 
    getDispute, getDisputes, getDisputesSpecifically, rootGetDispute, rootGetDisputes, 
    rootGetDisputesSpecifically 
} from "../controllers/disputes.controller.js";

export default function (app) {
    app.get("/root/disputes", [checks.verifyKey, checks.isAdministratorKey], rootGetDisputes);
    app.get("/root/disputes/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetDisputesSpecifically);
    app.get("/root/disputes/via/order", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrderAlt], rootGetDisputesSpecifically);
    app.get("/root/dispute", [checks.verifyKey, checks.isAdministratorKey, dispute_rules.forFindingDisputeAlt], rootGetDispute);
    
    app.get("/disputes", [checks.verifyToken, checks.isUser], getDisputes);
    app.get("/disputes/via/order", [checks.verifyToken, checks.isUser, order_rules.forFindingOrderAltByUser], getDisputesSpecifically);
    app.get("/dispute", [checks.verifyToken, checks.isUser, dispute_rules.forFindingDispute], getDispute);
};
