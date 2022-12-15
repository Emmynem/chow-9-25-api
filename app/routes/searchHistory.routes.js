import { checks } from "../middleware/index.js";
import { search_history_rules } from "../rules/searchHistory.rules.js";
import { user_rules } from "../rules/users.rules.js";
import {
    deleteSearchHistory, getSearchHistories, rootGetSearchHistories, rootGetSearchHistorySpecifically, searchProducts
} from "../controllers/searchHistory.controller.js";

export default function (app) {
    app.get("/root/search/histories", [checks.verifyKey, checks.isAdministratorKey], rootGetSearchHistories);
    app.get("/root/search/history/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetSearchHistorySpecifically);
    app.get("/root/search/history/via/search", [checks.verifyKey, checks.isAdministratorKey, search_history_rules.forFindingViaSearch], rootGetSearchHistorySpecifically);

    app.get("/search/history", [checks.verifyToken, checks.isUser], getSearchHistories);

    app.post("/search", [checks.verifyToken, checks.isUser, search_history_rules.forAdding], searchProducts);
    app.post("/public/search", [search_history_rules.forAdding], searchProducts);

    app.delete("/search", [checks.verifyToken, checks.isUser, search_history_rules.forFindingSearchHistory], deleteSearchHistory);
};
