import Cookies from "js-cookie";
import { useSession } from "next-auth/react";

const getUserSession = () => {
  const { data } = useSession();

  // NextAuth session (email/OAuth login)
  if (data?.user) return data.user;

  // Cookie-based session (OTP login / OTP signup)
  try {
    const cookie = Cookies.get("userInfo");
    if (cookie) return JSON.parse(cookie);
  } catch (_) {}

  return null;
};

export { getUserSession };
