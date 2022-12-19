import { checks } from "../middleware/index.js";
import { order_rules } from "../rules/orders.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { product_rules } from "../rules/products.rules.js";
import {
    acceptRefundForOrder, addOrders, checkEachOrderStatusForCancellation, checkOrderStatusForCancellation, checkOrderStatusForPayment,
    denyRefundForOrder, disputeOrderForRefund, getUserOrder, getUserOrders, getUserOrdersSpecifically, rootGetOrder, rootGetOrders,
    rootGetOrdersSpecifically, updateEachOrderCancelled, updateOrderCancelled, updateOrderCompleted, updateOrderInTransit, updateOrderPaid, 
    updateOrderShipped, getRiderOrders, getRiderOrdersSpecifically, getVendorOrders, getVendorOrdersSpecifically, updateOrderPaymentMethod
} from "../controllers/orders.controller.js";

export default function (app) {
    app.get("/root/orders", [checks.verifyKey, checks.isAdministratorKey], rootGetOrders);
    app.get("/root/orders/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetOrdersSpecifically);
    app.get("/root/orders/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetOrdersSpecifically);
    app.get("/root/orders/via/product", [checks.verifyKey, checks.isAdministratorKey, product_rules.forFindingProductAlt], rootGetOrdersSpecifically);
    app.get("/root/orders/paid", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingPaidOrders], rootGetOrdersSpecifically);
    app.get("/root/orders/shipped", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingShippedOrders], rootGetOrdersSpecifically);
    app.get("/root/orders/disputed", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingDisputedOrders], rootGetOrdersSpecifically);
    app.get("/root/order", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrder], rootGetOrder);

    app.get("/orders", [checks.verifyToken, checks.isUser], getUserOrders);
    app.get("/orders/via/vendor", [checks.verifyToken, checks.isUser, vendor_rules.forFindingVendorAlt], getUserOrdersSpecifically);
    app.get("/orders/via/tracking", [checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaTrackingNumber], getUserOrdersSpecifically);
    app.get("/orders/via/delivery/status", [checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaDeliveryStatus], getUserOrdersSpecifically);
    app.get("/orders/paid", [checks.verifyToken, checks.isUser, order_rules.forFindingPaidOrders], getUserOrdersSpecifically);
    app.get("/orders/shipped", [checks.verifyToken, checks.isUser, order_rules.forFindingShippedOrders], getUserOrdersSpecifically);
    app.get("/orders/disputed", [checks.verifyToken, checks.isUser, order_rules.forFindingDisputedOrders], getUserOrdersSpecifically);
    app.get("/order", [checks.verifyToken, checks.isUser, order_rules.forFindingOrder], getUserOrder);

    app.get("/riders/orders", [checks.verifyRiderToken, checks.isRider], getRiderOrders);
    app.get("/riders/orders/via/tracking", [checks.verifyRiderToken, checks.isRider, order_rules.forFindingOrderViaTrackingNumberAlt], getRiderOrdersSpecifically);
    app.get("/riders/orders/paid", [checks.verifyRiderToken, checks.isRider, order_rules.forFindingPaidOrders], getRiderOrdersSpecifically);
    app.get("/riders/orders/shipped", [checks.verifyRiderToken, checks.isRider, order_rules.forFindingShippedOrders], getRiderOrdersSpecifically);
    app.get("/riders/orders/disputed", [checks.verifyRiderToken, checks.isRider, order_rules.forFindingDisputedOrders], getRiderOrdersSpecifically);

    app.get("/vendors/orders", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorOrders);
    app.get("/vendors/orders/via/tracking", [checks.verifyVendorUserToken, checks.isVendorUser, order_rules.forFindingOrderViaTrackingNumberAlt], getVendorOrdersSpecifically);
    app.get("/vendors/orders/paid", [checks.verifyVendorUserToken, checks.isVendorUser, order_rules.forFindingPaidOrders], getVendorOrdersSpecifically);
    app.get("/vendors/orders/shipped", [checks.verifyVendorUserToken, checks.isVendorUser, order_rules.forFindingShippedOrders], getVendorOrdersSpecifically);
    app.get("/vendors/orders/disputed", [checks.verifyVendorUserToken, checks.isVendorUser, order_rules.forFindingDisputedOrders], getVendorOrdersSpecifically);

    app.post("/order/checkout", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forAddingViaCartIDs], addOrders);
    app.post("/order/dispute", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrder], disputeOrderForRefund);

    app.put("/order/update/payment/method", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaTrackingNumber, order_rules.forUpdatingPaymentMethod], updateOrderPaymentMethod);

    app.get("/order/payment/status", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaTrackingNumber], checkOrderStatusForPayment);
    app.post("/order/pay", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaTrackingNumber], updateOrderPaid);

    app.get("/order/cancellation/status/via/tracking", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaTrackingNumber], checkOrderStatusForCancellation);
    app.post("/order/cancel/via/tracking", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrdersViaTrackingNumber], updateOrderCancelled);

    app.get("/order/cancellation/status", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrder], checkEachOrderStatusForCancellation);
    app.post("/order/cancel", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, order_rules.forFindingOrder], updateEachOrderCancelled);

    app.post("/riders/order/shipping", [checks.verifyKey, checks.isInternalKey, checks.verifyRiderToken, checks.isRider, order_rules.forFindingOrderByRider], updateOrderInTransit);
    app.post("/riders/order/shipped", [checks.verifyKey, checks.isInternalKey, checks.verifyRiderToken, checks.isRider, order_rules.forFindingOrderByRider], updateOrderShipped);

    app.post("/vendors/order/completed", [checks.verifyKey, checks.isInternalKey, checks.verifyVendorUserToken, checks.isVendorUser, order_rules.forFindingOrderByVendor], updateOrderCompleted);

    app.put("/root/order/dispute/accept", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrder], acceptRefundForOrder);
    app.put("/root/order/dispute/deny", [checks.verifyKey, checks.isAdministratorKey, order_rules.forFindingOrder], denyRefundForOrder);
};
