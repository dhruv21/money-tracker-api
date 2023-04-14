const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Transaction = require("../models/transactionModel");
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
