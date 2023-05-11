const moment = require("moment");
const mongoose = require("mongoose");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const expensesSchema = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, validationMessage.expensesRequired],
      maxlength: [50, validationMessage.expensesMaxLength],
      minlength: [4, validationMessage.expensesMinLength],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

expensesSchema.pre("save", function (next) {
  let now = moment.utc(moment());

  this.updated_at = now;
  this.created_at = now;
  this.is_active = true;
  next();
});

expensesSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("expenses", expensesSchema);
