const express = require("express");
const { protect } = require("../middleware/auth");
const { userSignin, userLogin } = require("../controllers/authenticationController");
const { getPlannedTransaction, checkTransactionRequest } = require("../controllers/plannedTransactionController");
const { addIncome, getIncomes, updateIncome, removeIncome, getActiveIncomes } = require("../controllers/incomeController");
const { addExpenses, getExpenses, updateExpenses, removeExpenses, getActiveExpenses } = require("../controllers/expensesController");
const { addAccount, getAccounts, removeAccount, updateAccountAsPrimary, updateAccount } = require("../controllers/accountController");
const { getSummaryByTransactionTag, getSummaryByTransactionYear, getSummaryByTransactionType } = require("../controllers/summaryController");
const { addInvestment, getInvestments, updateInvestment, removeInvestment, getActiveInvestments } = require("../controllers/investmentController");
const { addTransaction, getTransaction, removeTransaction, updateTransaction, getTransactionSummaryByMonth } = require("../controllers/transactionController");

const router = express.Router();

/**
 * Authentication route
 */
router
  .route("/signin")
  .post(userSignin);
router
  .route("/login")
  .post(userLogin);

/**
 * Accounts route
 */
router
  .route("/accounts")
  .post(protect, addAccount);
router
  .route("/accounts/:id")
  .get(protect, getAccounts)
  .put(protect, updateAccount)
  .delete(protect, removeAccount);
router
  .route("/accounts/primary/:id")
  .put(protect, updateAccountAsPrimary);

/**
 * Incomes route
 */
router
  .route("/incomes")
  .post(protect, addIncome)
  .get(protect, getIncomes);
router
  .route("/incomes/active")
  .get(protect, getActiveIncomes);
router
  .route("/incomes/:id")
  .put(protect, updateIncome)
  .delete(protect, removeIncome);

/**
 * expenses route
 */
router
  .route("/expenses")
  .post(protect, addExpenses)
  .get(protect, getExpenses);
router
  .route("/expenses/active")
  .get(protect, getActiveExpenses);
router
  .route("/expenses/:id")
  .put(protect, updateExpenses)
  .delete(protect, removeExpenses);

/**
 * Investments route
 */
router
  .route("/investments")
  .post(protect, addInvestment)
  .get(protect, getInvestments);
router
  .route("/investments/active")
  .get(protect, getActiveInvestments);
router
  .route("/investments/:id")
  .put(protect, updateInvestment)
  .delete(protect, removeInvestment);

/**
 * Transactions route
 */
router
  .route("/transactions")
  .post(protect, addTransaction);
router
  .route("/transactions/:id")
  .get(protect, getTransaction)
  .put(protect, updateTransaction)
  .delete(protect, removeTransaction);

/**
 * Planned transaction route
 */
router.route("/planned-transactions")
  .post(protect, checkTransactionRequest);
router.route("/planned-transactions/:id")
  .get(protect, getPlannedTransaction);

/**
 * Summary route
 */
router
  .route("/transactions/summary/:id/:date")
  .get(protect, getTransactionSummaryByMonth);
router
  .route("/summary-by-transaction-tag/:id/:year")
  .get(protect, getSummaryByTransactionTag);
router
  .route("/summary-by-transaction-year/:id/:year")
  .get(protect, getSummaryByTransactionYear);
router
  .route("/summary-by-transaction-type/:id/:type")
  .get(protect, getSummaryByTransactionType);

module.exports = router;
