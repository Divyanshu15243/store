import Cookies from "js-cookie";

const getUserSession = () => {
  // Cookie-based session (OTP login)
  try {
    const cookie = Cookies.get("userInfo");
    if (cookie) {
      const user = JSON.parse(cookie);
      // normalize: ensure both _id and id are available
      return { ...user, id: user.id || user._id };
    }
  } catch (_) {}

  return null;
};

export { getUserSession };
