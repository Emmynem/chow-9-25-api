import { checks } from "../middleware/index.js";
import { vendor_bank_account_rules } from "../rules/vendorBankAccounts.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import {
    addVendorBankAccount, changeVendorDefaultBankAccount, deleteVendorBankAccount, getVendorBankAccount,
    getVendorBankAccounts, getVendorDefaultBankAccount, rootGetDefaultVendorsBankAccounts,
    rootGetVendorsBankAccounts, rootGetVendorsBankAccountsSpecifically, updateVendorBankAccount
} from "../controllers/vendorBankAccounts.controller.js";

export default function (app) {
    app.get("/root/vendors/bank/accounts", [checks.verifyKey, checks.isAdministratorKey], rootGetVendorsBankAccounts);
    app.get("/root/default/vendors/bank/accounts", [checks.verifyKey, checks.isAdministratorKey], rootGetDefaultVendorsBankAccounts);
    app.get("/root/vendors/bank/accounts/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetVendorsBankAccountsSpecifically);
    app.get("/root/default/vendor/bank/account", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt, vendor_bank_account_rules.forUpdatingDefault], rootGetVendorsBankAccountsSpecifically);

    app.get("/vendors/bank/accounts", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorBankAccounts);
    app.get("/vendors/default/bank/account", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorDefaultBankAccount);
    app.get("/vendors/bank/account", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_bank_account_rules.forFindingVendorBankAccount], getVendorBankAccount);

    app.post("/vendors/bank/account", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_bank_account_rules.forAdding], addVendorBankAccount);

    app.put("/vendors/bank/account", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_bank_account_rules.forFindingVendorBankAccount, vendor_bank_account_rules.forUpdatingDetails], updateVendorBankAccount);
    app.put("/vendors/bank/account/default", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_bank_account_rules.forFindingVendorBankAccount], changeVendorDefaultBankAccount);

    app.delete("/vendors/bank/account", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_bank_account_rules.forFindingVendorBankAccount], deleteVendorBankAccount);
};