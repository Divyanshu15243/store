import Cookies from "js-cookie";
import { useSession } from "next-auth/react";

const getCookieUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const cookie = Cookies.get("userInfo");
    if (!cookie) return null;
    const user = JSON.parse(cookie);
    return { ...user, id: user.id || user._id, _id: user._id || user.id };
  } catch (_) {
    return null;
  }
};

// Plain function — cookie only (safe to call anywhere)
const getUserSession = () => getCookieUser();

// Hook version — reads NextAuth session too (for email/OAuth login)
const useUserSession = () => {
  const { data: session } = useSession();

  // Cookie first (OTP users)
  const cookieUser = getCookieUser();
  if (cookieUser) return cookieUser;

  // NextAuth session fallback (email/OAuth users)
  if (session?.user) {
    const u = session.user;
    return { ...u, id: u.id || u._id, _id: u._id || u.id };
  }

  return null;
};

export { getUserSession, useUserSession };
