import { checks } from "../middleware/index.js";
import { transaction_rules } from "../rules/transactions.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import {
    addTransaction, addServiceChargePayment, addServiceChargePaymentExternally, addWithdrawal, addWithdrawalExternally,
    cancelServiceChargePayment, cancelServiceChargePaymentExternally, cancelWithdrawal, cancelWithdrawalExternally, rootGetTransaction,
    completeServiceChargePayment, completeWithdrawal, getTransaction, getTransactions, removeTransaction, restoreTransaction,
    rootGetTransactions, rootGetTransactionsSpecifically, updateTransaction
} from "../controllers/transactions.controller.js";

export default function (app) {
    app.get("/root/vendors/transactions", [checks.verifyKey, checks.isAdministratorKey], rootGetTransactions);
    app.get("/root/vendors/transactions/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetTransactionsSpecifically);
    app.get("/root/vendors/transactions/via/type", [checks.verifyKey, checks.isAdministratorKey, transaction_rules.forFindingViaType], rootGetTransactionsSpecifically);
    app.get("/root/vendors/transactions/via/transaction/status", [checks.verifyKey, checks.isAdministratorKey, transaction_rules.forFindingViaTransactionStatus], rootGetTransactionsSpecifically);
    app.get("/root/vendor/transaction", [checks.verifyKey, checks.isAdministratorKey, transaction_rules.forFindingTransaction], rootGetTransaction);

    app.get("/vendors/transactions", [checks.verifyVendorUserToken, checks.isVendorUser], getTransactions);
    app.get("/vendors/transaction", [checks.verifyVendorUserToken, checks.isVendorUser, transaction_rules.forFindingTransaction], getTransaction);

    // app.post("/vendors/transaction", [checks.verifyVendorUserToken, checks.isVendorUser, transaction_rules.forAdding], addTransaction); // Will use later, maybe
    app.post("/vendors/transaction/payment/service/charge", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forFindingVendorAlt, transaction_rules.forServiceChargePayment], addServiceChargePayment);
    app.post("/vendors/transaction/payment/service/charge/externally", [vendor_rules.forFindingVendorAlt, transaction_rules.forServiceChargePayment], addServiceChargePaymentExternally);
    app.post("/vendors/transaction/payment/withdrawal", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forFindingVendorAlt, transaction_rules.forWithdrawal], addWithdrawal);
    app.post("/vendors/transaction/payment/withdrawal/externally", [vendor_rules.forFindingVendorAlt, transaction_rules.forWithdrawal], addWithdrawalExternally);
    app.post("/vendors/transaction/cancel/service/charge", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forFindingVendorAlt, transaction_rules.forFindingTransaction], cancelServiceChargePayment);
    app.post("/vendors/transaction/cancel/service/charge/externally", [vendor_rules.forFindingVendorAlt, transaction_rules.forFindingTransaction], cancelServiceChargePaymentExternally);
    app.post("/vendors/transaction/cancel/withdrawal", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_rules.forFindingVendorAlt, transaction_rules.forFindingTransaction], cancelWithdrawal);
    app.post("/vendors/transaction/cancel/withdrawal/externally", [vendor_rules.forFindingVendorAlt, transaction_rules.forFindingTransaction], cancelWithdrawalExternally);
    app.post("/vendors/transaction/complete/service/charge/externally", [vendor_rules.forFindingVendorAlt, transaction_rules.forFindingTransaction], completeServiceChargePayment);
    app.post("/vendors/transaction/complete/withdrawal/externally", [vendor_rules.forFindingVendorAlt, transaction_rules.forFindingTransaction], completeWithdrawal);

    // app.put("/vendors/transaction/details", [checks.verifyVendorUserToken, checks.isVendorUser, transaction_rules.forFindingTransaction, transaction_rules.forUpdatingDetails], updateTransaction); // Will use later, maybe
    // app.put("/vendors/transaction/status", [checks.verifyVendorUserToken, checks.isVendorUser, transaction_rules.forFindingTransaction, transaction_rules.forUpdatingStatus], updateTransaction); // Will use later, maybe
    // app.put("/vendors/transaction/details/externally", [transaction_rules.forFindingTransaction, transaction_rules.forUpdatingDetails], updateTransaction); // Will use later, maybe
    // app.put("/vendors/transaction/status/externally", [transaction_rules.forFindingTransaction, transaction_rules.forUpdatingStatus], updateTransaction); // Will use later, maybe

    app.put("/vendors/transaction/remove", [checks.verifyVendorUserToken, checks.isVendorUser, transaction_rules.forFindingTransaction], removeTransaction);
    app.put("/vendors/transaction/restore", [checks.verifyVendorUserToken, checks.isVendorUser, transaction_rules.forFindingTransactionFalsy], restoreTransaction);
};