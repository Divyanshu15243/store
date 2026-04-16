import dynamic from "next/dynamic";
import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { signIn } from "next-auth/react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { FiPhone, FiShield, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// internal import
import Layout from "@layout/Layout";
import { auth } from "@lib/firebase";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";

const Login = () => {
  const router = useRouter();
  const redirectUrl = useSearchParams().get("redirectUrl");
  const { dispatch } = useContext(UserContext);

  const [tab, setTab] = useState("otp"); // "otp" | "email"
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);

  // OTP states
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Email states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── OTP handlers ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 13) return notifyError("Enter a valid 10-digit number!");
    setLoading(true);
    try {
      // lazy-init so recaptcha-container div is guaranteed to exist in DOM
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
      notifySuccess("OTP sent successfully!");
    } catch (err) {
      notifyError(err?.message || "Failed to send OTP");
      window.recaptchaVerifier?.clear?.();
      window.recaptchaVerifier = null;
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return notifyError("Enter the OTP!");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const res = await CustomerServices.otpLogin({ phone });
      dispatch({ type: "USER_LOGIN", payload: res });
      Cookies.set("userInfo", JSON.stringify(res), { expires: 7 });
      notifySuccess("Login successful!");
      router.push(redirectUrl ? "/checkout" : "/user/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid OTP";
      if (err?.response?.status === 404) {
        notifyError("Phone number not registered! Please sign up first.");
        setStep("phone");
        setOtp("");
      } else {
        notifyError(msg);
      }
    }
    setLoading(false);
  };

  // ── Email/Password handler ──
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/user/dashboard",
      });
      if (result?.error) {
        notifyError(result.error);
      } else if (result?.ok) {
        router.push(redirectUrl ? "/checkout" : result.url);
      }
    } catch (err) {
      notifyError(err?.message);
    }
    setLoading(false);
  };

  const tabClass = (t) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
      tab === t
        ? "bg-emerald-500 text-white shadow"
        : "text-gray-500 hover:text-emerald-600"
    }`;

  return (
    <Layout title="Login" description="Login to your account">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-4 flex flex-col lg:flex-row w-full">
          <div className="w-full sm:p-5 lg:p-8">
            <div className="mx-auto w-full max-w-lg px-4 py-8 sm:p-10 bg-white shadow-xl rounded-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold font-serif">Login</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Welcome back to N23 Gujarati Basket
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-6">
                <button type="button" className={tabClass("otp")} onClick={() => { setTab("otp"); setStep("phone"); setOtp(""); }}>
                  📱 OTP Login
                </button>
                <button type="button" className={tabClass("email")} onClick={() => setTab("email")}>
                  ✉️ Email Login
                </button>
              </div>

              {/* ── OTP Tab ── */}
              {tab === "otp" && (
                <>
                  {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative flex items-center border border-gray-200 rounded-md overflow-hidden focus-within:border-emerald-500">
                          <span className="flex items-center gap-1 px-3 py-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-700 select-none">
                            <FiPhone size={15} /> +91
                          </span>
                          <input
                            type="tel"
                            value={phone.replace("+91", "")}
                            onChange={(e) => setPhone("+91" + e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="9876543210"
                            maxLength={10}
                            className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Enter 10-digit mobile number</p>
                      </div>

                      <div id="recaptcha-container" />

                      <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50">
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </button>

                      <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-emerald-600 underline font-medium">Sign Up</Link>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="grid grid-cols-1 gap-5">
                      <p className="text-sm text-center text-gray-500">OTP sent to <span className="font-semibold text-gray-700">{phone}</span></p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-400"><FiShield size={18} /></span>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="• • • • • •"
                            maxLength={6}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md text-center text-xl font-bold tracking-widest focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50">
                        {loading ? "Verifying..." : "Verify & Login"}
                      </button>

                      <button type="button" onClick={() => { setStep("phone"); setOtp(""); }}
                        className="text-sm text-center text-gray-500 underline">
                        Change phone number
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* ── Email Tab ── */}
              {tab === "email" && (
                <form onSubmit={handleEmailLogin} className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400"><FiMail size={18} /></span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400"><FiLock size={18} /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/auth/forget-password" className="text-sm text-emerald-600 underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50">
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-emerald-600 underline font-medium">Sign Up</Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Login), { ssr: false });
