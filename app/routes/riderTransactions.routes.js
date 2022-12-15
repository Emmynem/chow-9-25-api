import { checks } from "../middleware/index.js";
import { rider_transaction_rules } from "../rules/riderTransactions.rules.js";
import { rider_rules } from "../rules/riders.rules.js";
import {
    addRiderTransaction, addServiceChargePayment, addServiceChargePaymentExternally, addWithdrawal, addWithdrawalExternally,
    cancelServiceChargePayment, cancelServiceChargePaymentExternally, cancelWithdrawal, cancelWithdrawalExternally, rootGetRiderTransaction,
    completeServiceChargePayment, completeWithdrawal, getRiderTransaction, getRiderTransactions, removeTransaction, restoreTransaction,
    rootGetRidersTransactions, rootGetRidersTransactionsSpecifically, updateTransaction
} from "../controllers/riderTransactions.controller.js";

export default function (app) {
    app.get("/root/riders/transactions", [checks.verifyKey, checks.isAdministratorKey], rootGetRidersTransactions);
    app.get("/root/riders/transactions/via/rider", [checks.verifyKey, checks.isAdministratorKey, rider_rules.forFindingRiderAlt], rootGetRidersTransactionsSpecifically);
    app.get("/root/riders/transactions/via/type", [checks.verifyKey, checks.isAdministratorKey, rider_transaction_rules.forFindingViaType], rootGetRidersTransactionsSpecifically);
    app.get("/root/riders/transactions/via/transaction/status", [checks.verifyKey, checks.isAdministratorKey, rider_transaction_rules.forFindingViaTransactionStatus], rootGetRidersTransactionsSpecifically);
    app.get("/root/rider/transaction", [checks.verifyKey, checks.isAdministratorKey, rider_transaction_rules.forFindingRiderTransaction], rootGetRiderTransaction);

    app.get("/riders/transactions", [checks.verifyRiderToken, checks.isRider], getRiderTransactions);
    app.get("/riders/transaction", [checks.verifyRiderToken, checks.isRider, rider_transaction_rules.forFindingRiderTransaction], getRiderTransaction);

    // app.post("/riders/transaction", [checks.verifyRiderToken, checks.isRider, rider_transaction_rules.forAdding], addRiderTransaction); // Will use later, maybe
    app.post("/riders/transaction/payment/service/charge", [checks.verifyRiderToken, checks.isRider, rider_rules.forFindingRiderAlt, rider_transaction_rules.forServiceChargePayment], addServiceChargePayment);
    app.post("/riders/transaction/payment/service/charge/externally", [rider_rules.forFindingRiderAlt, rider_transaction_rules.forServiceChargePayment], addServiceChargePaymentExternally);
    app.post("/riders/transaction/payment/withdrawal", [checks.verifyRiderToken, checks.isRider, rider_rules.forFindingRiderAlt, rider_transaction_rules.forWithdrawal], addWithdrawal);
    app.post("/riders/transaction/payment/withdrawal/externally", [rider_rules.forFindingRiderAlt, rider_transaction_rules.forWithdrawal], addWithdrawalExternally);
    app.post("/riders/transaction/cancel/service/charge", [checks.verifyRiderToken, checks.isRider, rider_rules.forFindingRiderAlt, rider_transaction_rules.forFindingRiderTransaction], cancelServiceChargePayment);
    app.post("/riders/transaction/cancel/service/charge/externally", [rider_rules.forFindingRiderAlt, rider_transaction_rules.forFindingRiderTransaction], cancelServiceChargePaymentExternally);
    app.post("/riders/transaction/cancel/withdrawal", [checks.verifyRiderToken, checks.isRider, rider_rules.forFindingRiderAlt, rider_transaction_rules.forFindingRiderTransaction], cancelWithdrawal);
    app.post("/riders/transaction/cancel/withdrawal/externally", [rider_rules.forFindingRiderAlt, rider_transaction_rules.forFindingRiderTransaction], cancelWithdrawalExternally);
    app.post("/riders/transaction/complete/service/charge/externally", [rider_rules.forFindingRiderAlt, rider_transaction_rules.forFindingRiderTransaction], completeServiceChargePayment);
    app.post("/riders/transaction/complete/withdrawal/externally", [rider_rules.forFindingRiderAlt, rider_transaction_rules.forFindingRiderTransaction], completeWithdrawal);

    // app.put("/riders/transaction/details", [checks.verifyRiderToken, checks.isRider, rider_transaction_rules.forFindingRiderTransaction, rider_transaction_rules.forUpdatingDetails], updateTransaction); // Will use later, maybe
    // app.put("/riders/transaction/status", [checks.verifyRiderToken, checks.isRider, rider_transaction_rules.forFindingRiderTransaction, rider_transaction_rules.forUpdatingStatus], updateTransaction); // Will use later, maybe
    // app.put("/riders/transaction/details/externally", [rider_transaction_rules.forFindingRiderTransaction, rider_transaction_rules.forUpdatingDetails], updateTransaction); // Will use later, maybe
    // app.put("/riders/transaction/status/externally", [rider_transaction_rules.forFindingRiderTransaction, rider_transaction_rules.forUpdatingStatus], updateTransaction); // Will use later, maybe

    app.put("/riders/transaction/remove", [checks.verifyRiderToken, checks.isRider, rider_transaction_rules.forFindingRiderTransaction], removeTransaction);
    app.put("/riders/transaction/restore", [checks.verifyRiderToken, checks.isRider, rider_transaction_rules.forFindingRiderTransactionFalsy], restoreTransaction);
};