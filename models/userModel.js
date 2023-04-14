const moment = require("moment");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const validationMessage = require("../utils/validationMessage");

const { Schema } = mongoose;

const userSchema = Schema(
  {
    pan_number: {
      type: String,
      trim: true,
      unique: true,
      required: [true, validationMessage.panNumberRequired],
      validate: {
        validator: function () {
          let status = true;
          let panNumberRegex = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
          if (!panNumberRegex.test(this.pan_number)) {
            status = false;
          }

          return status;
        },
        message: validationMessage.inValidPanNumberFormat,
      },
    },
    phone_number: {
      type: String,
      trim: true,
      required: [true, validationMessage.phoneNumberRequired],
      validate: {
        validator: function () {
          let status = true;
          let phoneNumberRegex = /^\d{10}$/;
          if (!phoneNumberRegex.test(this.phone_number)) {
            status = false;
          }

          return status;
        },
        message: validationMessage.inValidPhoneNumberFormat,
      },
    },
    password: {
      type: String,
      required: [true, validationMessage.passwordRequired],
      maxlength: [200, validationMessage.passwordMaxLength],
      minlength: [5, validationMessage.passwordMinLength],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    is_active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userSchema.pre("save", async function (next) {
  let now =  moment.utc(moment());
  const salt = await bcrypt.genSalt(10);

  this.updated_at = now;
  this.created_at = now;
  this.is_active = false;
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  if(this._update && this._update.password){
    const salt = await bcrypt.genSalt(10);
    this._update.password = await bcrypt.hash(this._update.password, salt);
  }
  next();
});

userSchema.methods.getSignedJwtToken = function () {
  let expiresIn = "60000";
  expiresIn = process.env.USER_JWT_EXPIRE_TIME;
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.methods.matchPassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
