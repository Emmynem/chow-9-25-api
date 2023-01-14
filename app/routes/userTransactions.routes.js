import { checks } from "../middleware/index.js";
import { user_transaction_rules } from "../rules/userTransactions.rules.js";
import { user_rules } from "../rules/users.rules.js";
import {
    addUserTransaction, addDeposit, addDepositExternally, addWithdrawal, addWithdrawalExternally,
    cancelDeposit, cancelDepositExternally, cancelWithdrawal, cancelWithdrawalExternally, rootGetUserTransaction,
    completeDeposit, completeWithdrawal, getUserTransaction, getUserTransactions, removeTransaction, restoreTransaction,
    rootGetUsersTransactions, rootGetUsersTransactionsSpecifically, updateTransaction
} from "../controllers/userTransactions.controller.js";

export default function (app) {
    app.get("/root/users/transactions", [checks.verifyKey, checks.isAdministratorKey], rootGetUsersTransactions);
    app.get("/root/users/transactions/via/user", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt], rootGetUsersTransactionsSpecifically);
    app.get("/root/users/transactions/via/type", [checks.verifyKey, checks.isAdministratorKey, user_transaction_rules.forFindingViaType], rootGetUsersTransactionsSpecifically);
    app.get("/root/users/transactions/via/transaction/status", [checks.verifyKey, checks.isAdministratorKey, user_transaction_rules.forFindingViaTransactionStatus], rootGetUsersTransactionsSpecifically);
    app.get("/root/user/transaction", [checks.verifyKey, checks.isAdministratorKey, user_transaction_rules.forFindingUserTransaction], rootGetUserTransaction);

    app.get("/transactions", [checks.verifyToken, checks.isUser], getUserTransactions);
    app.get("/transaction", [checks.verifyToken, checks.isUser, user_transaction_rules.forFindingUserTransaction], getUserTransaction);

    // app.post("/transaction", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_transaction_rules.forAdding], addUserTransaction); // Will use later, maybe
    app.post("/transaction/payment/deposit", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_rules.forFindingUserAlt, user_transaction_rules.forDeposit], addDeposit);
    app.post("/transaction/payment/deposit/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, user_transaction_rules.forDeposit], addDepositExternally);
    // app.post("/transaction/payment/withdrawal", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_rules.forFindingUserAlt, user_transaction_rules.forWithdrawal], addWithdrawal); // For when logged in (Will use later, maybe)
    // app.post("/transaction/payment/withdrawal/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, user_transaction_rules.forWithdrawal], addWithdrawalExternally); // For when not logged in, external use only (Will use later, maybe)

    app.post("/transaction/cancel/deposit", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], cancelDeposit);
    app.post("/transaction/cancel/deposit/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], cancelDepositExternally);
    // app.post("/transaction/cancel/withdrawal", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], cancelWithdrawal); // Will use later, maybe
    // app.post("/transaction/cancel/withdrawal/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], cancelWithdrawalExternally); // Will use later, maybe

    app.post("/transaction/complete/deposit", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], completeDeposit);
    app.post("/transaction/complete/deposit/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], completeDeposit);
    app.post("/root/users/transaction/complete/deposit", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], completeDeposit);

    // app.post("/transaction/complete/withdrawal", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], completeWithdrawal); // Will use later, maybe
    // app.post("/transaction/complete/withdrawal/externally", [checks.verifyKey, checks.isInternalKey, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], completeWithdrawal); // Will use later, maybe
    // app.post("/root/users/transaction/complete/withdrawal", [checks.verifyKey, checks.isAdministratorKey, user_rules.forFindingUserAlt, user_transaction_rules.forFindingUserTransaction], completeWithdrawal); // Will use later, maybe

    // app.put("/transaction/details", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_transaction_rules.forFindingUserTransaction, user_transaction_rules.forUpdatingDetails], updateTransaction); // Will use later, maybe
    // app.put("/transaction/status", [checks.verifyKey, checks.isInternalKey, checks.verifyToken, checks.isUser, user_transaction_rules.forFindingUserTransaction, user_transaction_rules.forUpdatingStatus], updateTransaction); // Will use later, maybe
    // app.put("/transaction/details/externally", [checks.verifyKey, checks.isInternalKey, user_transaction_rules.forFindingUserTransaction, user_transaction_rules.forUpdatingDetails], updateTransactionExternally); // Will use later, maybe
    // app.put("/transaction/status/externally", [checks.verifyKey, checks.isInternalKey, user_transaction_rules.forFindingUserTransaction, user_transaction_rules.forUpdatingStatus], updateTransactionExternally); // Will use later, maybe

    app.put("/transaction/remove", [checks.verifyToken, checks.isUser, user_transaction_rules.forFindingUserTransaction], removeTransaction);
    app.put("/transaction/restore", [checks.verifyToken, checks.isUser, user_transaction_rules.forFindingUserTransactionFalsy], restoreTransaction);
};
