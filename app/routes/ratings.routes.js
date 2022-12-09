import { checks } from "../middleware/index.js";
import { rating_rules } from "../rules/ratings.rules.js";
import { product_rules } from "../rules/products.rules.js";
import { user_rules } from "../rules/users.rules.js";
import {
    addRating, deleteRating, getRatingSpecifically, getRatings, rootGetRating, rootGetRatings,
    rootGetRatingsSpecifically
} from "../controllers/ratings.controller.js";

export default function (app) {
    app.get("/root/ratings", [checks.verifyKey, checks.isAdministratorKey], rootGetRatings);
    app.get("/root/ratings/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetRatingsSpecifically);
    app.get("/root/ratings/via/product", [checks.verifyKey, checks.isAdministratorKey, product_rules.forFindingProductAlt], rootGetRatingsSpecifically);
    app.get("/root/rating", [checks.verifyKey, checks.isAdministratorKey, rating_rules.forFindingRating], rootGetRating);
    app.get("/root/rating/via/product", [checks.verifyKey, checks.isAdministratorKey, rating_rules.forFindingRatingViaProduct], rootGetRating);

    app.get("/ratings", [checks.verifyToken, checks.isUser], getRatings);
    app.get("/rating", [checks.verifyToken, checks.isUser], product_rules.forFindingProductAlt, getRatingSpecifically);

    app.post("/rating", [checks.verifyToken, checks.isUser, rating_rules.forAdding], addRating);

    app.delete("/rating", [checks.verifyToken, checks.isUser, rating_rules.forFindingRatingViaProduct], deleteRating);
};
