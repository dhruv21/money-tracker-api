const { asyncHandler } = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const responseMessage = require("../utils/responseMessage");
const Income = require("../models/incomeModel");
const Expenses = require("../models/expensesModel");
const Investment = require("../models/investmentModel");
const Transaction = require("../models/transactionModel");
const PlannedTransaction = require("../models/plannedTransactionModel");
const moment = require("moment");
const _ = require("lodash");

exports.getSummaryByTransactionTag = asyncHandler(async (req, res, next) => {
    let summaryData = [];
    let incomeSummary = { type: "income", summary: [] };
    let expencesSummary = { type: "expenses", summary: [] };
    let investmentSummary = { type: "investment", summary: [] };

    let incomes = await Income.find({
        user_id: req.user.id,
    }).select(["-created_at", "-updated_at", "-__v"]);

    let expences = await Expenses.find({
        user_id: req.user.id,
    }).select(["-created_at", "-updated_at", "-__v"]);

    let investments = await Investment.find({
        user_id: req.user.id,
    }).select(["-created_at", "-updated_at", "-__v"]);

    for (let yearIndex = req.params.year; yearIndex > req.params.year - 3; yearIndex--) {
        let incomeSummaryByYear = { year: parseInt(yearIndex), tags: [], months: [] };
        let expencesSummaryByYear = { year: parseInt(yearIndex), tags: [], months: [] };
        let investmentSummaryByYear = { year: parseInt(yearIndex), tags: [], months: [] };

        let actualIncomeTags = [];
        let plannedIncomeTags = [];
        let actualExpencesTags = [];
        let plannedExpencesTags = [];
        let actualInvestmentTags = [];
        let plannedInvestmentTags = [];

        let actualIncomeMonths = [];
        let plannedIncomeMonths = [];
        let actualExpencesMonths = [];
        let plannedExpencesMonths = [];
        let actualInvestmentMonths = [];
        let plannedInvestmentMonths = [];

        req.startDate = `01-01-${yearIndex}`;
        req.endDate = `31-12-${yearIndex}`;

        let actualTransactionsByYear = await getActualTransactionByDate(req, res, next);
        let plannedTransactionsByYear = await getPlannedTransactionByDate(req, res, next);

        actualIncomeTags = calculateIncomes(incomes, actualTransactionsByYear);
        plannedIncomeTags = calculateIncomes(incomes, plannedTransactionsByYear);

        actualExpencesTags = calculateExpences(expences, actualTransactionsByYear);
        plannedExpencesTags = calculateExpences(expences, plannedTransactionsByYear);

        actualInvestmentTags = calculateInvestment(investments, actualTransactionsByYear);
        plannedInvestmentTags = calculateInvestment(investments, plannedTransactionsByYear);

        for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
            req.startDate = moment(`01-${monthIndex}-${yearIndex}`, "DD-MM-YYYY")
                .startOf("month")
                .format("DD-MM-YYYY");
            req.endDate = moment(`01-${monthIndex}-${yearIndex}`, "DD-MM-YYYY")
                .endOf("month")
                .format("DD-MM-YYYY");

            let actualTransactionsByMonth = await getActualTransactionByDate(req, res, next);
            let plannedTransactionsByMonth = await getPlannedTransactionByDate(req, res, next);

            actualIncomeMonths.push({
                month: calculateIncomes(incomes, actualTransactionsByMonth),
            });
            plannedIncomeMonths.push({
                month: calculateIncomes(incomes, plannedTransactionsByMonth),
            });

            actualExpencesMonths.push({
                month: calculateExpences(expences, actualTransactionsByMonth),
            });
            plannedExpencesMonths.push({
                month: calculateExpences(expences, plannedTransactionsByMonth),
            });

            actualInvestmentMonths.push({
                month: calculateInvestment(investments, actualTransactionsByMonth),
            });
            plannedInvestmentMonths.push({
                month: calculateInvestment(investments, plannedTransactionsByMonth),
            });
        }

        incomeSummaryByYear.tags.push(
            { actual: actualIncomeTags },
            { planned: plannedIncomeTags }
        );
        incomeSummaryByYear.months.push(
            { actual: actualIncomeMonths },
            { planned: plannedIncomeMonths }
        );

        expencesSummaryByYear.tags.push(
            { actual: actualExpencesTags },
            { planned: plannedExpencesTags }
        );
        expencesSummaryByYear.months.push(
            { actual: actualExpencesMonths },
            { planned: plannedExpencesMonths }
        );

        investmentSummaryByYear.tags.push(
            { actual: actualInvestmentTags },
            { planned: plannedInvestmentTags }
        );
        investmentSummaryByYear.months.push(
            { actual: actualInvestmentMonths },
            { planned: plannedInvestmentMonths }
        );

        incomeSummary.summary.push(incomeSummaryByYear);
        expencesSummary.summary.push(expencesSummaryByYear);
        investmentSummary.summary.push(investmentSummaryByYear);
    }

    summaryData.push(incomeSummary, expencesSummary, investmentSummary);

    res.status(200).json({
        data: summaryData,
        message: responseMessage.getSummarySuccess,
    });
});

exports.getSummaryByTransactionYear = asyncHandler(async (req, res, next) => {
    let summaryData = [];
    let incomeSummary = { type: "income", actual_amount: 0, planned_amount: 0, };
    let expenceseSummary = { type: "expenses", actual_amount: 0, planned_amount: 0, };
    let investmentSummary = { type: "investment", actual_amount: 0, planned_amount: 0, };

    let actualIncomeAmount = 0;
    let actualExpenceseAmount = 0;
    let actualInvestmentAmount = 0;

    let plannedIncomeAmount = 0;
    let plannedExpenceseAmount = 0;
    let plannedInvestmentAmount = 0;

    req.startDate = `01-01-${req.params.year}`;
    req.endDate = `31-12-${req.params.year}`;

    let actualTransactionsByYear = await getActualTransactionByDate(req, res, next);
    let plannedTransactionsByYear = await getPlannedTransactionByDate(req, res, next);

    actualTransactionsByYear.forEach((transaction) => {
        if (transaction.income != null) {
            actualIncomeAmount = actualIncomeAmount + transaction.amount;
        } else if (transaction.expences != null) {
            actualExpenceseAmount = actualExpenceseAmount + transaction.amount;
        } else if (transaction.investment != null) {
            actualInvestmentAmount = actualInvestmentAmount + transaction.amount;
        }
    })

    plannedTransactionsByYear.forEach((transaction) => {
        if (transaction.income != null) {
            plannedIncomeAmount = plannedIncomeAmount + transaction.amount;
        } else if (transaction.expences != null) {
            plannedExpenceseAmount = plannedExpenceseAmount + transaction.amount;
        } else if (transaction.investment != null) {
            plannedInvestmentAmount = plannedInvestmentAmount + transaction.amount;
        }
    })

    summaryData.push(
        { ...incomeSummary, actual_amount: actualIncomeAmount, planned_amount: plannedIncomeAmount},
        { ...expenceseSummary, actual_amount: actualExpenceseAmount, planned_amount: plannedExpenceseAmount },
        { ...investmentSummary, actual_amount: actualInvestmentAmount, planned_amount: plannedInvestmentAmount });

    res.status(200).json({
        data: summaryData,
        message: responseMessage.getSummarySuccess,
    });

});

exports.getSummaryByTransactionType = asyncHandler(async (req, res, next) => {
    let summaryData = [];
    let currentYear = moment().year();

    for(let yearIndex = currentYear; yearIndex > (currentYear-5); yearIndex--){
        let actualAmount = 0;
        let plannedAmount = 0;
        let months = [];

        req.startDate = `01-01-${yearIndex}`;
        req.endDate = `31-12-${yearIndex}`;
        
        let actualTransactionsByYear = await getActualTransactionByDate(req, res, next);
        let plannedTransactionsByYear = await getPlannedTransactionByDate(req, res, next);

        for(let monthIndex = 1; monthIndex <= 12; monthIndex++){
            let amountByMonth = 0.0;
            req.startDate = moment(`01-${monthIndex}-${yearIndex}`, "DD-MM-YYYY")
                .startOf("month")
                .format("DD-MM-YYYY");
            req.endDate = moment(`01-${monthIndex}-${yearIndex}`, "DD-MM-YYYY")
                .endOf("month")
                .format("DD-MM-YYYY");

            let actualTransactionsByMonth = await getActualTransactionByDate(req, res, next);

            if(req.params.type.toLowerCase() == 'income'){
                actualTransactionsByMonth.forEach((transaction) => {
                    if (transaction.income != null) {
                        amountByMonth = amountByMonth + transaction.amount;
                    } 
                })
            }else if(req.params.type.toLowerCase() == 'expenses'){
                actualTransactionsByMonth.forEach((transaction) => {
                    if (transaction.expences != null) {
                        amountByMonth = amountByMonth + transaction.amount;
                    } 
                })
            }else if(req.params.type.toLowerCase() == 'investment'){
                actualTransactionsByMonth.forEach((transaction) => {
                    if (transaction.investment != null) {
                        amountByMonth = amountByMonth + transaction.amount;
                    } 
                })
            }

            months.push(amountByMonth);
        }

        if(req.params.type.toLowerCase() == 'income'){
            actualTransactionsByYear.forEach((transaction) => {
                if (transaction.income != null) {
                    actualAmount = actualAmount + transaction.amount;
                } 
            })

            plannedTransactionsByYear.forEach((transaction) => {
                if (transaction.income != null) {
                    plannedAmount = plannedAmount + transaction.amount;
                } 
            })
        }else if(req.params.type.toLowerCase() == 'expenses'){
            actualTransactionsByYear.forEach((transaction) => {
                if (transaction.expences != null) {
                    actualAmount = actualAmount + transaction.amount;
                } 
            })

            plannedTransactionsByYear.forEach((transaction) => {
                if (transaction.expences != null) {
                    plannedAmount = plannedAmount + transaction.amount;
                } 
            })
        }else if(req.params.type.toLowerCase() == 'investment'){
            actualTransactionsByYear.forEach((transaction) => {
                if (transaction.investment != null) {
                    actualAmount = actualAmount + transaction.amount;
                } 
            })

            plannedTransactionsByYear.forEach((transaction) => {
                if (transaction.investment != null) {
                    plannedAmount = plannedAmount + transaction.amount;
                } 
            })
        }

        summaryData.push({year: {year: yearIndex, actual_amount: actualAmount, planned_amount: plannedAmount, }, months: months});
    }

    res.status(200).json({
        data: summaryData,
        message: responseMessage.getSummarySuccess,
    });

});

getActualTransactionByDate = asyncHandler(async (req, res, next) => {
    return await Transaction.find({
        account_id: req.params.id,
        transaction_period: {
            $gte: req.startDate
                ? moment(req.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : moment().startOf("month").format("YYYY-MM-DD"),
            $lte: req.endDate
                ? moment(req.endDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : moment().endOf("month").format("YYYY-MM-DD"),
        },
    })
        .select(["-created_at", "-updated_at", "-__v"])
        .populate("expences")
        .populate("income")
        .populate("investment");
});

getPlannedTransactionByDate = asyncHandler(async (req, res, next) => {
    return await PlannedTransaction.find({
        account_id: req.params.id,
        transaction_period: {
            $gte: req.startDate
                ? moment(req.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : moment().startOf("month").format("YYYY-MM-DD"),
            $lte: req.endDate
                ? moment(req.endDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : moment().endOf("month").format("YYYY-MM-DD"),
        },
    })
        .select(["-created_at", "-updated_at", "-__v"])
        .populate("expences")
        .populate("income")
        .populate("investment");
});

calculateIncomes = (incomes, transactions) => {
    let incomeDetail = [];

    incomes.forEach((income) => {
        let amount = 0;
        let filterData = _.filter(transactions, function (transaction) {
            return transaction.income && transaction.income.name == income.name;
        });
        filterData.forEach((data) => (amount = amount + data.amount));
        let detail = {
            id: income.id,
            name: income.name,
            is_active: income.is_active,
            amount: amount,
        };
        incomeDetail.push(detail);
    });

    return _.orderBy(incomeDetail, ['amount'], ['desc']);
};

calculateExpences = (expences, transactions) => {
    let expencesDetail = [];

    expences.forEach((expence) => {
        let amount = 0;
        let filterData = _.filter(transactions, function (transaction) {
            return transaction.expences && transaction.expences.name == expence.name;
        });

        filterData.forEach((data) => (amount = amount + data.amount));
        let detail = {
            id: expence.id,
            name: expence.name,
            is_active: expence.is_active,
            amount: amount,
        };
        expencesDetail.push(detail);
    });

    return _.orderBy(expencesDetail, ['amount'], ['desc']);
};

calculateInvestment = (investments, transactions) => {
    let investmentDetail = [];

    investments.forEach((investment) => {
        let amount = 0;
        let filterData = _.filter(transactions, function (transaction) {
            return transaction.investment && transaction.investment.name == investment.name;
        });
        filterData.forEach((data) => (amount = amount + data.amount));
        let detail = {
            id: investment.id,
            name: investment.name,
            is_active: investment.is_active,
            amount: amount,
        };
        investmentDetail.push(detail);
    });

    return _.orderBy(investmentDetail, ['amount'], ['desc']);
};
