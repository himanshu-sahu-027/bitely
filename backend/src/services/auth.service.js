import AuthSession from "../models/user/authSession.model.js";

export const logoutUserSession = async (token) => {
  await AuthSession.deleteOne({ token });
};
