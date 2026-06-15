import User from "../models/user/user.model.js";
import AuthSession from "../models/user/authSession.model.js";
import { generateToken } from "../utils/generateToken.js";

export const loginOrSignupUser = async ({ identifier, type, full_name }) => {
  
  let user;

  if (type === "email") {
    user = await User.findOne({ email: identifier });

    if (!user) {
      user = await User.create({
        name: full_name || "User",
        email: identifier,
        authProvider: "email",
        isVerified: true,
      });
    } else {
      user.isVerified = true;
      user.authProvider = user.authProvider || "email";
      await user.save();
    }
  }

  if (!user) {
    throw new Error("Unsupported authentication type");
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
