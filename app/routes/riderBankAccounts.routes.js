import { checks } from "../middleware/index.js";
import { rider_bank_account_rules } from "../rules/riderBankAccounts.rules.js";
import { rider_rules } from "../rules/riders.rules.js";
import {
    addRiderBankAccount, changeRiderDefaultBankAccount, deleteRiderBankAccount, getRiderBankAccount,
    getRiderBankAccounts, getRiderDefaultBankAccount, rootGetDefaultRidersBankAccounts,
    rootGetRidersBankAccounts, rootGetRidersBankAccountsSpecifically, updateRiderBankAccount
} from "../controllers/riderBankAccounts.controller.js";

export default function (app) {
    app.get("/root/riders/bank/accounts", [checks.verifyKey, checks.isAdministratorKey], rootGetRidersBankAccounts);
    app.get("/root/default/riders/bank/accounts", [checks.verifyKey, checks.isAdministratorKey], rootGetDefaultRidersBankAccounts);
    app.get("/root/riders/bank/accounts/via/rider", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRiderAlt], rootGetRidersBankAccountsSpecifically);
    app.get("/root/default/rider/bank/account", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRiderAlt, rider_bank_account_rules.forUpdatingDefault], rootGetRidersBankAccountsSpecifically);

    app.get("/riders/bank/accounts", [checks.verifyRiderToken, checks.isRider], getRiderBankAccounts);
    app.get("/riders/default/bank/account", [checks.verifyRiderToken, checks.isRider], getRiderDefaultBankAccount);
    app.get("/riders/bank/account", [checks.verifyRiderToken, checks.isRider, rider_bank_account_rules.forFindingRiderBankAccount], getRiderBankAccount);

    app.post("/riders/bank/account", [checks.verifyRiderToken, checks.isRider, rider_bank_account_rules.forAdding], addRiderBankAccount);

    app.put("/riders/bank/account", [checks.verifyRiderToken, checks.isRider, rider_bank_account_rules.forFindingRiderBankAccount, rider_bank_account_rules.forUpdatingDetails], updateRiderBankAccount);
    app.put("/riders/bank/account/default", [checks.verifyRiderToken, checks.isRider, rider_bank_account_rules.forFindingRiderBankAccount], changeRiderDefaultBankAccount);

    app.delete("/riders/bank/account", [checks.verifyRiderToken, checks.isRider, rider_bank_account_rules.forFindingRiderBankAccount], deleteRiderBankAccount);
};