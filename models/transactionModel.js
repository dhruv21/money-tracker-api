const moment = require("moment");
const mongoose = require("mongoose");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const transactionSchema = Schema(
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
    },
    description: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [50, validationMessage.descriptionMaxLength],
    },
    transaction_source: {
      type: String,
      enum: ["INCOME", "INVESTMENT"],
      default: "INCOME",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

transactionSchema.pre("save", function (next) {
  let now = moment.utc(moment());

  this.updated_at = now;
  this.created_at = now;
  next();
});

transactionSchema.set("toJSON", { virtuals: true });

transactionSchema.virtual("expences", {
  ref: "expenses",
  localField: "transaction_id",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("income", {
  ref: "income",
  localField: "transaction_id",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("investment", {
  ref: "investment",
  localField: "transaction_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model(
  "transaction",
  transactionSchema
);
