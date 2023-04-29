const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Transaction = require("../models/transactionModel");
const PlannedTransaction = require("../models/plannedTransactionModel");
const moment = require("moment");

exports.addTransaction = asyncHandler(async (req, res, next) => {
  req.body = {
    ...req.body,
    transaction_period: moment(
      req.body.transaction_period,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD"),
  };

  let transaction = await Transaction.create(req.body);

  transaction
    ? res.status(201).json({
        data: [transaction],
        message: responseMessage.postTransactionSuccess,
      })
    : next(new ErrorResponse(responseMessage.postTransactionError, 400));
});

exports.updateTransaction = asyncHandler(async (req, res, next) => {
  if (req && req.body && req.body.transaction_period) {
    req.body = {
      ...req.body,
      transaction_period: moment(
        req.body.transaction_period,
        "DD-MM-YYYY"
      ).format("YYYY-MM-DD"),
    };
  }

  let transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  transaction
    ? res.status(200).json({
        data: [transaction],
        message: responseMessage.updatePlannedTransactionSuccess,
      })
    : next(
        new ErrorResponse(responseMessage.updatePlannedTransactionError, 400)
      );
});

exports.removeTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findByIdAndRemove(req.params.id);

  transaction
    ? res.status(200).json({
        data: [],
        message: responseMessage.removeTransactionSuccess,
      })
    : next(new ErrorResponse(responseMessage.removeTransactionError, 400));
});

exports.getTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.find({
    account_id: req.params.id,
    transaction_period: {
      $gte: req.query.startDate
        ? moment(req.query.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
        : moment().startOf("month").format("YYYY-MM-DD"),
      $lte: req.query.endDate
        ? moment(req.query.endDate, "DD-MM-YYYY").format("YYYY-MM-DD")
        : moment().endOf("month").format("YYYY-MM-DD"),
    },
  })
    .select(["-created_at", "-updated_at", "-__v"])
    .populate("expences")
    .populate("income")
    .populate("investment");

    res.status(200).json({
      data: transaction,
      message: responseMessage.getTransactionSuccess,
    }) 
});

exports.getTransactionSummaryByMonth = asyncHandler(async (req, res, next) => {
  let summaryData = [];
  let incomeSummary = { type: "income", actual_amount: 0, planned_amount: 0, };
  let expenceseSummary = { type: "expenses", actual_amount: 0, planned_amount: 0, };
  let investmentSummary = { type: "investment", actual_amount: 0, planned_amount: 0, };

  let actualIncomeAmount = 0;
  let actualExpenceseAmount = 0;
  let actualInvestmentAmount = 0;

  let plannedIncomeAmount = 0;
  let plannedExpenceseAmount = 0;
  let plannedInvestmentAmount = 0;

  req.startDate = moment(req.params.date, "DD-MM-YYYY")
  .startOf("month")
  .format("DD-MM-YYYY");
  req.endDate = moment(req.params.date, "DD-MM-YYYY")
  .endOf("month")
  .format("DD-MM-YYYY");

  let actualTransactionsByYear = await getActualTransactionByDate(req, res, next);
  let plannedTransactionsByYear = await getPlannedTransactionByDate(req, res, next);

  actualTransactionsByYear.forEach((transaction) => {
      if (transaction.income != null) {
          actualIncomeAmount = actualIncomeAmount + transaction.amount;
      } else if (transaction.expences != null) {
          actualExpenceseAmount = actualExpenceseAmount + transaction.amount;
      } else if (transaction.investment != null) {
          actualInvestmentAmount = actualInvestmentAmount + transaction.amount;
      }
  })

  plannedTransactionsByYear.forEach((transaction) => {
      if (transaction.income != null) {
          plannedIncomeAmount = plannedIncomeAmount + transaction.amount;
      } else if (transaction.expences != null) {
          plannedExpenceseAmount = plannedExpenceseAmount + transaction.amount;
      } else if (transaction.investment != null) {
          plannedInvestmentAmount = plannedInvestmentAmount + transaction.amount;
      }
  })

  summaryData.push(
      { ...incomeSummary, actual_amount: actualIncomeAmount, planned_amount: plannedIncomeAmount},
      { ...expenceseSummary, actual_amount: actualExpenceseAmount, planned_amount: plannedExpenceseAmount },
      { ...investmentSummary, actual_amount: actualInvestmentAmount, planned_amount: plannedInvestmentAmount });

  res.status(200).json({
      data: summaryData,
      message: responseMessage.getSummarySuccess,
  });

});

getActualTransactionByDate = asyncHandler(async (req, res, next) => {
  return await Transaction.find({
      account_id: req.params.id,
      transaction_period: {
          $gte: req.startDate
              ? moment(req.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : moment().startOf("month").format("YYYY-MM-DD"),
          $lte: req.endDate
              ? moment(req.endDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : moment().endOf("month").format("YYYY-MM-DD"),
      },
  })
      .select(["-created_at", "-updated_at", "-__v"])
      .populate("expences")
      .populate("income")
      .populate("investment");
});

getPlannedTransactionByDate = asyncHandler(async (req, res, next) => {
  return await PlannedTransaction.find({
      account_id: req.params.id,
      transaction_period: {
          $gte: req.startDate
              ? moment(req.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : moment().startOf("month").format("YYYY-MM-DD"),
          $lte: req.endDate
              ? moment(req.endDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : moment().endOf("month").format("YYYY-MM-DD"),
      },
  })
      .select(["-created_at", "-updated_at", "-__v"])
      .populate("expences")
      .populate("income")
      .populate("investment");
});
