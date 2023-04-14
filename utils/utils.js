const moment = require("moment");

exports.pagination = ({ page: page, limit: limit }) => {
  let pageValue = parseInt(page, 10) || 1;
  let limitValue = parseInt(limit, 10) || 100;
  let skip;

  pageValue = pageValue >= 0 ? pageValue : 1;
  limitValue = limitValue >= 0 ? limitValue : 100;
  skip = (pageValue - 1) * limitValue;

  return {
    skip: skip,
    limit: limitValue,
  };
};
