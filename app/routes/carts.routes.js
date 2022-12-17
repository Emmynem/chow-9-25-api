import { checks } from "../middleware/index.js";
import { cart_rules } from "../rules/carts.rules.js";
import { user_rules } from "../rules/users.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import { product_rules } from "../rules/products.rules.js";
import {
    addCart, deleteCart, getUserCart, getUserCarts, rootGetCart, rootGetCarts, rootGetCartsSpecifically, updateCart
} from "../controllers/carts.controller.js";

export default function (app) {
    app.get("/root/carts", [checks.verifyKey, checks.isAdministratorKey], rootGetCarts);
    app.get("/root/carts/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetCartsSpecifically);
    app.get("/root/carts/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetCartsSpecifically);
    app.get("/root/carts/via/product", [checks.verifyKey, checks.isAdministratorKey, product_rules.forFindingProductAlt], rootGetCartsSpecifically);
    app.get("/root/cart", [checks.verifyKey, checks.isAdministratorKey, cart_rules.forFindingCart], rootGetCart);

    app.get("/carts", [checks.verifyToken, checks.isUser], getUserCarts);
    app.get("/cart", [checks.verifyToken, checks.isUser, cart_rules.forFindingCart], getUserCart);

    app.post("/cart", [checks.verifyToken, checks.isUser, cart_rules.forAdding], addCart);

    app.put("/cart/quantity", [checks.verifyToken, checks.isUser, cart_rules.forFindingCart, cart_rules.forUpdatingQuantity], updateCart);
    app.put("/cart/shipping", [checks.verifyToken, checks.isUser, cart_rules.forFindingCart, cart_rules.forUpdatingShipping], updateCart);

    app.delete("/cart", [checks.verifyToken, checks.isUser, cart_rules.forFindingCart], deleteCart);
};
