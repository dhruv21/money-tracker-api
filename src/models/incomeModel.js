const moment = require("moment");
const mongoose = require("mongoose");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const incomeSchema = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, validationMessage.incomeRequired],
      maxlength: [50, validationMessage.incomeMaxLength],
      minlength: [4, validationMessage.incomeMinLength],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

incomeSchema.pre("save", function (next) {
  let now = moment.utc(moment());

  this.updated_at = now;
  this.created_at = now;
  this.is_active = true;
  next();
});

incomeSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("income", incomeSchema);
