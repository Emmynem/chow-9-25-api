import { checks } from "../middleware/index.js";
import { addressess_rules } from "../rules/addressess.rules.js";
import { 
    addUserAddress, changeUserDefaultAddress, deleteUserAddress, getUserAddress, getUserAddresses,
    getUserDefaultAddress, rootGetAddress, rootGetAddressess, rootGetDefaultAddressess, updateUserAddress 
} from "../controllers/addressess.controller.js";

export default function (app) {
    app.get("/root/addressess", [checks.verifyKey, checks.isAdministratorKey], rootGetAddressess);
    app.get("/root/default/addressess", [checks.verifyKey, checks.isAdministratorKey], rootGetDefaultAddressess);
    app.get("/root/address", [checks.verifyKey, checks.isAdministratorKey, addressess_rules.forFindingAddressAlt], rootGetAddress);

    app.get("/addressess", [checks.verifyToken, checks.isUser], getUserAddresses);
    app.get("/address", [checks.verifyToken, checks.isUser, addressess_rules.forFindingAddress], getUserAddress);
    app.get("/address/default", [checks.verifyToken, checks.isUser], getUserDefaultAddress);

    app.post("/address", [checks.verifyToken, checks.isUser, addressess_rules.forAdding], addUserAddress);

    app.put("/address", [checks.verifyToken, checks.isUser, addressess_rules.forFindingAddress, addressess_rules.forUpdatingDetails], updateUserAddress);
    app.put("/address/default", [checks.verifyToken, checks.isUser, addressess_rules.forFindingAddress], changeUserDefaultAddress);

    app.delete("/address", [checks.verifyToken, checks.isUser, addressess_rules.forFindingAddress], deleteUserAddress);
};