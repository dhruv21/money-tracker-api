const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Investment = require("../models/investmentModel");

exports.addInvestment = asyncHandler(async (req, res, next) => {
  req.body = { ...req.body, user_id: req.user.id };

  let investment = await Investment.findOne({
    name: req.body.name,
    user_id: req.user.id,
  });

  if (investment) {
    if(!investment.is_active){
      investment = await Investment.findByIdAndUpdate(
        investment.id,
        {
          is_active: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      investment
        ? res.status(201).json({
            data: [investment],
            message: responseMessage.postInvestmentSuccess,
          })
        : next(new ErrorResponse(responseMessage.postInvestmentError, 400));
      }else{
        next(new ErrorResponse(responseMessage.postInvestmentDuplicateEnteryError, 400));
      }
  } else {
    investment = await Investment.create(req.body);

    investment
      ? res.status(201).json({
          data: [investment],
          message: responseMessage.postInvestmentSuccess,
        })
      : next(new ErrorResponse(responseMessage.postInvestmentError, 400));
  }
});

exports.getActiveInvestments = asyncHandler(async (req, res, next) => {
  let investments = await Investment.find({
    is_active: true,
    user_id: req.user.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  investments
    ? res.status(200).json({
        data: investments,
        message: responseMessage.getInvestmentSuccess,
      })
    : next(new ErrorResponse(responseMessage.getInvestmentError, 400));
});

exports.getInvestments = asyncHandler(async (req, res, next) => {
  let investments = await Investment.find({
    user_id: req.user.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  investments
    ? res.status(200).json({
        data: investments,
        message: responseMessage.getInvestmentSuccess,
      })
    : next(new ErrorResponse(responseMessage.getInvestmentError, 400));
});

exports.updateInvestment = asyncHandler(async (req, res, next) => {
  if (req && req.body && "is_active" in req.body) {
    delete req.body.is_active;
  }

  let investment = await Investment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  investment
    ? res.status(200).json({
        data: [investment],
        message: responseMessage.updateInvestmentSuccess,
      })
    : next(new ErrorResponse(responseMessage.updateInvestmentError, 400));
});

exports.removeInvestment = asyncHandler(async (req, res, next) => {
  let investment = await Investment.findByIdAndUpdate(
    req.params.id,
    {
      is_active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  investment
    ? res.status(200).json({
        data: [],
        message: responseMessage.removeInvestmentSuccess,
      })
    : next(new ErrorResponse(responseMessage.removeInvestmentError, 400));
});