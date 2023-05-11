const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const PlannedTransaction = require("../models/plannedTransactionModel");
const moment = require("moment");

addPlannedTransaction = asyncHandler(async (req, res, next) => {
  let plannedTransaction = await PlannedTransaction.create(req.body);
  plannedTransaction
    ? res.status(201).json({
        data: [plannedTransaction],
        message: responseMessage.postPlannedTransactionSuccess,
      })
    : next(new ErrorResponse(responseMessage.postPlannedTransactionError, 400));
});

updatePlannedTransaction = asyncHandler(async (req, res, next) => {
  let plannedTransaction = await PlannedTransaction.findByIdAndUpdate(
    req.body.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  plannedTransaction
    ? res.status(200).json({
        data: [plannedTransaction],
        message: responseMessage.updatePlannedTransactionSuccess,
      })
    : next(
        new ErrorResponse(responseMessage.updatePlannedTransactionError, 400)
      );
});

removePlannedTransaction = asyncHandler(async (req, res, next) => {
  let plannedTransaction = await PlannedTransaction.findByIdAndRemove(
    req.body.id
  );

  plannedTransaction
    ? res.status(200).json({
        data: [],
        message: responseMessage.updatePlannedTransactionSuccess,
      })
    : next(
        new ErrorResponse(responseMessage.updatePlannedTransactionError, 400)
      );
});

exports.checkTransactionRequest = asyncHandler(async (req, res, next) => {
  const plannedTransactionObj = PlannedTransaction({
    ...req.body,
    transaction_period: moment(
      req.body.transaction_period,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD"),
  });
  const plannedTransactionError = await plannedTransactionObj.validateSync();

  console.log(
    "plannedTransactionError",
    moment(req.body.transaction_period, "DD-MM-YYYY").format("YYYY-MM-DD")
  );

  if (plannedTransactionError) {
    next(new ErrorResponse(responseMessage.invalidCredentials, 404));
  } else {
    let transactionPeriod = moment(
      req.body.transaction_period,
      "DD-MM-YYYY"
    ).format("DD-MM-YYYY");
    let currentMonth = moment().format("MM");
    let currentYear = moment().format("YYYY");
    let selectedMonth = moment(transactionPeriod, "DD-MM-YYYY").format("MM");
    let selectYear = moment(transactionPeriod, "DD-MM-YYYY").format("YYYY");

    if (selectYear >= currentYear && selectedMonth > currentMonth) {
      let plannedTransaction = await PlannedTransaction.findOne({
        account_id: req.body.account_id,
        transaction_id: req.body.transaction_id,
        transaction_period: {
          $gte: `${selectYear}-${selectedMonth}-${moment(
            req.body.transaction_period,
            "DD-MM-YYYY"
          )
            .startOf("month")
            .format("DD")}`,
          $lte: `${selectYear}-${selectedMonth}-${moment(
            req.body.transaction_period,
            "DD-MM-YYYY"
          )
            .endOf("month")
            .format("DD")}`,
        },
      });

      if (plannedTransaction) {
        req.body = { ...req.body, id: plannedTransaction.id };
        if (req.body.amount > 0) {
          req.body = {
            ...req.body,
            transaction_period: `${selectYear}-${selectedMonth}-01`,
          };
          await updatePlannedTransaction(req, res, next);
        } else {
          await removePlannedTransaction(req, res, next);
        }
      } else {
        req.body = {
          ...req.body,
          transaction_period: `${selectYear}-${selectedMonth}-01`,
        };
        await addPlannedTransaction(req, res, next);
      }
    } else {
      next(
        new ErrorResponse(
          responseMessage.plannedTranscationDateSelectionError,
          400
        )
      );
    }
  }
});

exports.getPlannedTransaction = asyncHandler(async (req, res, next) => {
  let plannedTransaction = await PlannedTransaction.find({
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
      data: plannedTransaction,
      message: responseMessage.getPlannedTransactionSuccess,
    })
});
