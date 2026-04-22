import Cookies from "js-cookie";
import { useSession } from "next-auth/react";

const getUserSession = () => {
  // 1. Cookie-based session (OTP login / signup)
  try {
    const cookie = Cookies.get("userInfo");
    if (cookie) {
      const user = JSON.parse(cookie);
      return { ...user, id: user.id || user._id, _id: user._id || user.id };
    }
  } catch (_) {}

  return null;
};

// Hook version — reads NextAuth session too (for email/OAuth login)
const useUserSession = () => {
  const { data: session } = useSession();

  // Cookie first (OTP users)
  try {
    const cookie = Cookies.get("userInfo");
    if (cookie) {
      const user = JSON.parse(cookie);
      return { ...user, id: user.id || user._id, _id: user._id || user.id };
    }
  } catch (_) {}

  // NextAuth session fallback (email/OAuth users)
  if (session?.user) {
    const u = session.user;
    return { ...u, id: u.id || u._id, _id: u._id || u.id };
  }

  return null;
};

export { getUserSession, useUserSession };
