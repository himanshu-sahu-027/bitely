import User from "../models/user/user.model.js";
import AuthSession from "../models/user/authSession.model.js";
import { generateToken } from "../utils/generateToken.js";

export const loginOrSignupUser = async ({ identifier, type, full_name }) => {
  let user;

  if (type === "phone") {
    user = await User.findOne({ phone: identifier });

    if (!user) {
      user = await User.create({
        phone: identifier,
        full_name: full_name || "User",
        is_phone_verified: true,
      });
    } else {
      user.is_phone_verified = true;
      await user.save();
    }
  }

  if (type === "email") {
    user = await User.findOne({ email: identifier });

    if (!user) {
      user = await User.create({
        email: identifier,
        full_name: full_name || "User",
        is_email_verified: true,
      });
    } else {
      user.is_email_verified = true;
      await user.save();
    }
  }

  const token = generateToken(user);

  await AuthSession.create({
    user_id: user._id,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    token,
    user,
  };
};

export const logoutUserSession = async (token) => {
  await AuthSession.deleteOne({ token });
};
