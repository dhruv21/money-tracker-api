const moment = require("moment");
const mongoose = require("mongoose");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const investmentSchema = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, validationMessage.investmentRequired],
      maxlength: [50, validationMessage.investmentMaxLength],
      minlength: [4, validationMessage.investmentMinLength],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

investmentSchema.pre("save", function (next) {
  let now = moment.utc(moment());

  this.updated_at = now;
  this.created_at = now;
  this.is_active = true;
  next();
});

investmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("investment", investmentSchema);
