const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Income = require("../models/incomeModel");

exports.addIncome = asyncHandler(async (req, res, next) => {
  req.body = { ...req.body, user_id: req.user.id };

  let income = await Income.findOne({
    name: req.body.name,
    user_id: req.user.id,
  });

  if (income && !income.is_active) {
    income = await Income.findByIdAndUpdate(
      income.id,
      {
        is_active: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    income
      ? res.status(201).json({
          data: [income],
          message: responseMessage.postIncomeSuccess,
        })
      : next(new ErrorResponse(responseMessage.postIncomeError, 400));
  } else {
    income = await Income.create(req.body);
    income
      ? res.status(201).json({
          data: [income],
          message: responseMessage.postIncomeSuccess,
        })
      : next(new ErrorResponse(responseMessage.postIncomeError, 400));
  }
});

exports.getActiveIncomes = asyncHandler(async (req, res, next) => {
  let incomes = await Income.find({
    is_active: true,
    user_id: req.user.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  incomes
    ? res.status(200).json({
        data: incomes,
        message: responseMessage.getIncomeSuccess,
      })
    : next(new ErrorResponse(responseMessage.getIncomeError, 400));
});

exports.getIncomes = asyncHandler(async (req, res, next) => {
  let incomes = await Income.find({
    user_id: req.user.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  incomes
    ? res.status(200).json({
        data: incomes,
        message: responseMessage.getIncomeSuccess,
      })
    : next(new ErrorResponse(responseMessage.getIncomeError, 400));
});

exports.updateIncome = asyncHandler(async (req, res, next) => {
  if (req && req.body && "is_active" in req.body) {
    delete req.body.is_active;
  }

  let income = await Income.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  income
    ? res.status(200).json({
        data: [income],
        message: responseMessage.updateIncomeSuccess,
      })
    : next(new ErrorResponse(responseMessage.updateIncomeError, 400));
});

exports.removeIncome = asyncHandler(async (req, res, next) => {
  let income = await Income.findByIdAndUpdate(
    req.params.id,
    {
      is_active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  income
    ? res.status(200).json({
        data: [],
        message: responseMessage.removeIncomeSuccess,
      })
    : next(new ErrorResponse(responseMessage.removeIncomeError, 400));
});
