const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Account = require("../models/accountModel");
const User = require("../models/userModel");

/**
 * desc         User bank accounts
 * route        POST /accounts
 * access       User
 */
exports.addAccount = asyncHandler(async (req, res, next) => {
  if (req.body.signin) {
    let account = await Account.create(req.body);

    if (account) {
      return account;
    } else {
      await User.findByIdAndDelete(req.body.user_id);
      return undefined;
    }
  } else {
    req.body = {
      ...req.body,
      user_id: req.user.id,
      name: `${req?.body?.owner_name}${req?.body?.bank}`,
    };
    let account = await Account.create(req.body);
    account
      ? res.status(201).json({
          data: [account],
          message: responseMessage.postAccountSuccess,
        })
      : next(new ErrorResponse(responseMessage.postAccountError, 400));
  }
});

exports.getAccountsByUserId = asyncHandler(
  async (req, res, next) =>
    await Account.find({
      is_active: true,
      is_primary: true,
      user_id: req.body.user_id,
    }).select(["-created_at", "-updated_at", "-__v"])
);

exports.getAccounts = asyncHandler(async (req, res, next) => {
  let accounts = await Account.find({
    is_active: true,
    user_id: req.params.id,
  }).select(["-created_at", "-updated_at", "-__v"]);

  if (accounts && accounts.length > 0) {
    res.status(200).json({
      data: accounts,
      message: responseMessage.getAccountByUserSuccess,
    });
  } else {
    next(new ErrorResponse(responseMessage.getAccountByUserError, 400));
  }
});

exports.updateAccount = asyncHandler(async (req, res, next) => {
  if (req && req.body && req.body.owner_name && req.body.bank) {
    let account = await Account.findByIdAndUpdate(
      req.params.id,
      {
        name: `${req?.body?.owner_name}${req?.body?.bank}`,
        owner_name: req?.body?.owner_name,
        bank: req?.body?.bank,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (account) {
      res.status(200).json({
        data: [account],
        message: responseMessage.updateAccountSuccess,
      });
    } else {
      next(new ErrorResponse(responseMessage.updateAccountError, 400));
    }
  } else {
    next(new ErrorResponse(responseMessage.updateAccountError, 400));
  }
});

exports.updateAccountAsPrimary = asyncHandler(async (req, res, next) => {
  let account = await Account.findOne({
    is_active: true,
    is_primary: true,
    user_id: req.user.id,
  });

  if (account) {
    account = await Account.findByIdAndUpdate(
      account.id,
      { is_primary: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (account) {
      account = await Account.findByIdAndUpdate(
        req.params.id,
        { is_primary: true },
        {
          new: true,
          runValidators: true,
        }
      ).select(["-created_at", "-updated_at", "-__v"]);

      if (account) {
        res.status(200).json({
          data: [account],
          message: responseMessage.updateAccountSuccess,
        });
      } else {
        next(new ErrorResponse(responseMessage.updateAccountError, 400));
      }
    } else {
      next(new ErrorResponse(responseMessage.updateAccountError, 400));
    }
  } else {
    next(new ErrorResponse(responseMessage.updateAccountError, 400));
  }
});

exports.removeAccount = asyncHandler(async (req, res, next) => {
  let account = await Account.findOne({
    is_active: true,
    id: req.params.id,
  });

  if (account && account.is_primary) {
    account = await Account.findByIdAndUpdate(
      req.params.id,
      {
        is_active: false,
        is_primary: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (account) {
      let accounts = await Account.find({
        is_active: true,
        user_id: account.user_id,
      });

      if (accounts && accounts.length > 0) {
        account = await Account.findByIdAndUpdate(
          accounts[0].id,
          { is_primary: true },
          {
            new: true,
            runValidators: true,
          }
        );

        if (account) {
          res.status(200).json({
            data: [],
            message: responseMessage.removeAccountSuccess,
          });
        } else {
          next(new ErrorResponse(responseMessage.removeAccountError, 400));
        }
      } else {
        next(new ErrorResponse(responseMessage.removeAccountError, 400));
      }
    } else {
      next(new ErrorResponse(responseMessage.removeAccountError, 400));
    }
  } else {
    if (account) {
      account = await Account.findByIdAndUpdate(
        req.params.id,
        {
          is_active: false,
          is_primary: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (account) {
        res.status(200).json({
          data: [],
          message: responseMessage.removeAccountSuccess,
        });
      } else {
        next(new ErrorResponse(responseMessage.removeAccountError, 400));
      }
    }
  }
});
