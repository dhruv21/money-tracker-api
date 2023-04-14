const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/userModel");
const { asyncHandler } = require("./async");
const responseMessage = require("../utils/responseMessage");

/**
 * desc         Check authtoken is valid or not
 * route        POST    /login
 *
 * access       User
 * steps        1. Check authtoken is valid or not
 *              2. If authtoken not valid then return 401 status code
 *              3. If authtoken valid then get user details
 *              4. Call next middleware
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    if (token) {
      const decodedId = jwt.verify(token, process.env.JWT_SECRET);

      if (decodedId && decodedId.id) {
        const user = await User.findOne({ _id: decodedId.id, is_active: true });

        if (user) {
          req.user = user;
          next();
        } else {
          next(new ErrorResponse(responseMessage.unauthorizedUser, 401));
        }
      } else {
        next(new ErrorResponse(responseMessage.unauthorizedUser, 401));
      }
    } else {
      next(new ErrorResponse(responseMessage.jwtTokenError, 400));
    }
  } else {
    next(new ErrorResponse(responseMessage.jwtTokenError, 400));
  }
});
