import { checks } from "../middleware/index.js";
import { rider_shipping_rules } from "../rules/riderShipping.rules.js";
import { rider_rules } from "../rules/riders.rules.js";
import { product_rules } from "../rules/products.rules.js";
import {
    addRiderShipping, deleteRiderShipping, getRiderShipping, getRiderShippings, rootGetRiderShipping, rootGetRidersShipping,
    updateRiderShipping, rootGetRiderShippingSpecifically, getProductShippingAnonymously, addRiderShippingMultiple, getProductShipping
} from "../controllers/riderShipping.controller.js";

export default function (app) {
    app.get("/root/riders/shipping", [checks.verifyKey, checks.isAdministratorKey], rootGetRidersShipping);
    app.get("/root/riders/shipping/via/rider", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRiderAlt], rootGetRiderShippingSpecifically);
    app.get("/root/rider/shipping", [checks.verifyKey, checks.isAdministratorKey, rider_shipping_rules.forFindingRiderShipping], rootGetRiderShipping);
    
    app.get("/shipping/product/anonymous", [product_rules.forFindingProductAlt], getProductShippingAnonymously);
    app.get("/shipping/product", [checks.verifyToken, checks.isUser, product_rules.forFindingProductAlt], getProductShipping);

    app.get("/riders/shippings", [checks.verifyRiderToken, checks.isRider], getRiderShippings);
    app.get("/riders/shipping", [checks.verifyRiderToken, checks.isRider, rider_shipping_rules.forFindingRiderShipping], getRiderShipping);

    app.post("/riders/shipping", [checks.verifyRiderToken, checks.isRider, rider_shipping_rules.forAdding], addRiderShipping);
    app.post("/riders/shipping/multiple", [checks.verifyRiderToken, checks.isRider, rider_shipping_rules.forAddingMultiple], addRiderShippingMultiple);

    app.put("/riders/shipping/criteria", [checks.verifyRiderToken, checks.isRider, rider_shipping_rules.forFindingRiderShipping, rider_shipping_rules.forUpdatingCriteria], updateRiderShipping);
    app.put("/riders/shipping/location", [checks.verifyRiderToken, checks.isRider, rider_shipping_rules.forFindingRiderShipping, rider_shipping_rules.forUpdatingLocation], updateRiderShipping);

    // app.delete("/riders/shipping", [checks.verifyRiderToken, checks.isRider, rider_shipping_rules.forFindingRiderShipping], deleteRiderShipping);
};
