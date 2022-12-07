import { checks } from "../middleware/index.js";
import { favorite_rules } from "../rules/favorites.rules.js";
import { product_rules } from "../rules/products.rules.js";
import { user_rules } from "../rules/users.rules.js";
import {
    addFavorite, deleteFavorite, getFavorites, getFavoriteSpecifically, rootGetFavorite, 
    rootGetFavorites, rootGetFavoritesSpecifically
} from "../controllers/favorites.controller.js";

export default function (app) {
    app.get("/root/favorites", [checks.verifyKey, checks.isAdministratorKey], rootGetFavorites);
    app.get("/root/favorites/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetFavoritesSpecifically);
    app.get("/root/favorites/via/product", [checks.verifyKey, checks.isAdministratorKey, product_rules.forFindingProductAlt], rootGetFavoritesSpecifically);
    app.get("/root/favorite", [checks.verifyKey, checks.isAdministratorKey, favorite_rules.forFindingFavoriteAlt], rootGetFavorite);

    app.get("/favorites", [checks.verifyToken, checks.isUser], getFavorites);
    app.get("/favorite/via/product", [checks.verifyToken, checks.isUser, product_rules.forFindingProductAlt], getFavoriteSpecifically);
    
    app.post("/favorite", [checks.verifyToken, checks.isUser, favorite_rules.forAdding], addFavorite);

    app.delete("/favorite", [checks.verifyToken, checks.isUser, favorite_rules.forFindingFavorite], deleteFavorite);
};
