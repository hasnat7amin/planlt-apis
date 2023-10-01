const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: [2, "Minimum password length is 2 characters"],
    default: null,
  },
  email: {
    type: String,
    // required: [false, "Please enter an email"],
    // unique: false,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    // required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  role: {
    type: String,
    required: [true, "Please enter your role"],
    enum: ["delegate", "admin"],
  },
  phoneNo: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  membership: {
    type: String,
    enum: ["none", "premium"],
    default: "none",
  },
  subscriptionSessionId: {
    type: String,
  },
  subscriptionCheckoutUrl: {
    type: String,
  },
  membershipExpiresAt: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
});

/* This is a static method that is used to login a user. */
UserSchema.statics.login = async function (email, password) {
  const isEmail = email.includes("@");

  let user;

  if (isEmail) {
    // If it's an email, search in the email field
    user = await this.findOne({ email: email });
  } else {
    // If it's not an email, search in both email and phoneNo fields for delegates
    user = await this.findOne({
      $or: [
        { email: email, role: "delegate" },
        { phoneNo: email, role: "delegate" },
      ],
    });
  }
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    console.log(auth);
    console.log(user);
    if (auth) {
      return user;
    }
    throw Error("Your password is incorrect");
  }
  throw Error("Your email/username is incorrect");
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
