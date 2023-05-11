const moment = require("moment");
const mongoose = require("mongoose");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const plannedTransactionSchema = Schema(
  {
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, validationMessage.incomeRequired],
      min: [0, validationMessage.amountMinLength],
      max: [100000000, validationMessage.amountMaxLength],
    },
    transaction_period: {
      type: Date,
      required: [true, validationMessage.transactionPeriodRequired],
    }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

plannedTransactionSchema.pre("save", function (next) {
  let now = moment.utc(moment());

  this.updated_at = now;
  this.created_at = now;
  next();
});

plannedTransactionSchema.set("toJSON", { virtuals: true });

plannedTransactionSchema.virtual("expences", {
  ref: "expenses",
  localField: "transaction_id",
  foreignField: "_id",
  justOne: true,
});

plannedTransactionSchema.virtual("income", {
  ref: "income",
  localField: "transaction_id",
  foreignField: "_id",
  justOne: true,
});

plannedTransactionSchema.virtual("investment", {
  ref: "investment",
  localField: "transaction_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model(
  "planned_transaction",
  plannedTransactionSchema
);
