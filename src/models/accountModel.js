const moment = require("moment");
const mongoose = require("mongoose");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const accountSchema = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, validationMessage.accountRequired],
      maxlength: [50, validationMessage.accountMaxLength],
      minlength: [4, validationMessage.accountMinLength],
    },
    owner_name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, validationMessage.ownerRequired],
      maxlength: [20, validationMessage.ownerMaxLength],
      minlength: [2, validationMessage.ownerMinLength],
    },
    bank: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, validationMessage.bankRequired],
      maxlength: [20, validationMessage.bankMaxLength],
      minlength: [2, validationMessage.bankMinLength],
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

accountSchema.pre("save", function (next) {
  let now = moment.utc(moment());

  this.updated_at = now;
  this.created_at = now;
  this.is_active = true;
  next();
});

accountSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("account", accountSchema);
