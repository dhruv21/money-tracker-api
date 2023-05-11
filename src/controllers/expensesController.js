const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Expenses = require("../models/expensesModel");

exports.addExpenses = asyncHandler(async (req, res, next) => {
  req.body = { ...req.body, user_id: req.user.id };

  let expenses = await Expenses.findOne({
    name: req.body.name,
    user_id: req.user.id,
  });

  if (expenses) {
    if(!expenses.is_active){
      expenses = await Expenses.findByIdAndUpdate(
        expenses.id,
        {
          is_active: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expenses
        ? res.status(201).json({
            data: [expenses],
            message: responseMessage.postExpensesSuccess,
          })
        : next(new ErrorResponse(responseMessage.postExpensesError, 400));
    }else{
      next(new ErrorResponse(responseMessage.postExpenseDuplicateEnteryError, 400));
    }
  } else {
    expenses = await Expenses.create(req.body);
    expenses
      ? res.status(201).json({
          data: [expenses],
          message: responseMessage.postExpensesSuccess,
        })
      : next(new ErrorResponse(responseMessage.postExpensesError, 400));
  }
});

exports.getActiveExpenses = asyncHandler(async (req, res, next) => {
  let expenses = await Expenses.find({
    is_active: true,
    user_id: req.user.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  expenses
    ? res.status(200).json({
        data: expenses,
        message: responseMessage.getExpensesSuccess,
      })
    : next(new ErrorResponse(responseMessage.getExpensesError, 400));
});

exports.getExpenses = asyncHandler(async (req, res, next) => {
  let expenses = await Expenses.find({
    user_id: req.user.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  expenses
    ? res.status(200).json({
        data: expenses,
        message: responseMessage.getExpensesSuccess,
      })
    : next(new ErrorResponse(responseMessage.getExpensesError, 400));
});


exports.updateExpenses = asyncHandler(async (req, res, next) => {
  if(req && req.body && "is_active" in req.body){
    delete req.body.is_active;
  }

  let expenses = await Expenses.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  expenses
    ? res.status(200).json({
        data: [expenses],
        message: responseMessage.updateExpensesSuccess,
      })
    : next(new ErrorResponse(responseMessage.updateExpensesError, 400));
});

exports.removeExpenses = asyncHandler(async (req, res, next) => {
  let expenses = await Expenses.findByIdAndUpdate(
    req.params.id,
    {
      is_active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  expenses
    ? res.status(200).json({
        data: [],
        message: responseMessage.removeExpensesSuccess,
      })
    : next(new ErrorResponse(responseMessage.removeExpensesError, 400));
});