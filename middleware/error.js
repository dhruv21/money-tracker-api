const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");

const errorHandler = (error, req, res, next) => {
  console.log("error.value".bgRed, error.value);
  console.log("error.name".bgGreen, error.name);
  console.log("message".bgBlue,error.message);

  switch (error.name) {
    case "CastError":
      switch (typeof error.value) {
        case "string":
          error = new ErrorResponse(
            `${responseMessage.resourceNotFound} ${error.value}`,
            404
          );
          break;
        case "object":
          error = new ErrorResponse(
            error.value._id
              ? `${responseMessage.resourceNotFound} ${error.value._id}`
              : responseMessage.resourceNotFoundMessage,
            404
          );
          break;
        default:
          break;
      }
      break;
    case "ValidationError":
      let message = Object.values(error.errors)[0];
      error = new ErrorResponse(message, 400);
      break;
    case "TokenExpiredError":
      error = new ErrorResponse(responseMessage.jwtTokenExpire, 401);
    default:
  }

  switch (error.code) {
    case 11000:
      error = new ErrorResponse(responseMessage.duplicateField, 400);
      break;
    default:
  }

  return res.status(error.statusCode || 500).json({
    data: [],
    message: error.message || responseMessage.serverError,
  });
};

module.exports = errorHandler;
