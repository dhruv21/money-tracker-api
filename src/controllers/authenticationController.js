const User = require("../models/userModel");
const Account = require("../models/accountModel");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const { asyncHandler } = require("../middleware/async");
const { addAccount, getAccountsByUserId } = require("./accountController");

/**
 * desc         User signin process
 * route        POST /signin
 * access       User
 * steps        1. Add user detail 
 *              2. Add account detail
 */
exports.userSignin = asyncHandler(async (req, res, next) => {
  let accountReqObj = {
    name: `${req?.body?.owner_name}${req?.body?.bank}`,
    owner_name: req?.body?.owner_name,
    bank: req?.body?.bank,
    is_primary: true,
  };

  const userObj = User(req.body);
  const accountObj = Account(accountReqObj);

  const userError = await userObj.validateSync();
  const accountError = await accountObj.validateSync();

  if (userError || accountError) {
    next(new ErrorResponse(responseMessage.invalidCredentials, 404));
  } else {
    const user = await User.create(req.body);

    delete user._doc.password;
    delete user._doc.user_type;
    delete user._doc.is_active;
    delete user._doc.updated_at;
    delete user._doc.__v;

    if (user) {
      req.body = {
        ...accountReqObj,
        user_id: user.id,
        signin: true,
      };

      let account = await addAccount(req, res, next);

      if (account) {
        res.status(201).json({
          data: [user],
          message: responseMessage.postUserSignin,
        });
      } else {
        next(new ErrorResponse(responseMessage.postUserSigninError, 400));
      }
    } else {
      next(new ErrorResponse(responseMessage.postUserSigninError, 400));
    }
  }
});

/**
 * desc         User login (Expire authtoken in 365 days)
 * route        POST /login
 * access       User
 */
exports.userLogin = asyncHandler(async (req, res, next) => {
  if (req.body.pan_number && req.body.password) {
    const user = await User.findOne({
      pan_number: req.body.pan_number,
      is_active: true,
    }).select("+password -is_active -created_at -updated_at -__v");

    
    if (user) {
      const isPasswordMatch = await user.matchPassword(req.body.password);

      if (isPasswordMatch) {
        let token = user.getSignedJwtToken();
        user._doc.token = token;
        delete user._doc.password;

        req.body = {...req.body, user_id: user.id}
        let accounts = await getAccountsByUserId(req, res, next);

        if(accounts.length > 0){
          res.status(200).json({
            data: [user, accounts[0]],
            message: responseMessage.postUserLogin,
          });
        }else{
          next(new ErrorResponse(responseMessage.invalidCredentials, 401));
        }
      } else {
        next(new ErrorResponse(responseMessage.invalidCredentials, 401));
      }
    } else {
      next(new ErrorResponse(responseMessage.invalidCredentials, 401));
    }
  } else {
    next(new ErrorResponse(responseMessage.invalidFormat, 400));
  }
});
