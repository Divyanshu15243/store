import dynamic from "next/dynamic";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { FiUser, FiPhone, FiMail, FiGift, FiShield, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

// internal import
import Layout from "@layout/Layout";
import { auth } from "@lib/firebase";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";

const SignUp = () => {
  const router = useRouter();
  const { dispatch } = useContext(UserContext);

  const [step, setStep] = useState("form"); // "form" | "otp"
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "+91",
    email: "",
    referralCode: "",
  });

  // field-level errors
  const [fieldErrors, setFieldErrors] = useState({
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifierSignup) {
      window.recaptchaVerifierSignup = new RecaptchaVerifier(
        auth,
        "recaptcha-container-signup",
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => { window.recaptchaVerifierSignup = null; },
        }
      );
      window.recaptchaVerifierSignup.render();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData({ ...formData, phone: "+91" + value.replace(/[^0-9]/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // clear field error on change
    if (name === "phone" || name === "email") {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // check on blur
  const handleBlurCheck = async (field) => {
    const value = field === "phone" ? formData.phone : formData.email;
    if (!value || (field === "phone" && value === "+91")) return;
    setChecking(true);
    try {
      const res = await CustomerServices.checkExists({
        [field]: value,
      });
      if (field === "phone" && res.phoneExists) {
        setFieldErrors((prev) => ({
          ...prev,
          phone: "This phone number is already registered.",
        }));
      }
      if (field === "email" && res.emailExists) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "This email is already registered.",
        }));
      }
    } catch (_) {}
    setChecking(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const { name, phone, email } = formData;
    if (!name) return notifyError("Please enter your full name!");
    if (phone.length < 13) return notifyError("Enter a valid 10-digit phone number!");
    if (!email) return notifyError("Please enter your email!");
    if (fieldErrors.phone || fieldErrors.email) return notifyError("Please fix the errors before continuing!");

    setLoading(true);
    try {
      // final check before sending OTP
      const check = await CustomerServices.checkExists({ phone, email });
      if (check.phoneExists) {
        setFieldErrors((prev) => ({ ...prev, phone: "This phone number is already registered." }));
        setLoading(false);
        return;
      }
      if (check.emailExists) {
        setFieldErrors((prev) => ({ ...prev, email: "This email is already registered." }));
        setLoading(false);
        return;
      }

      const appVerifier = window.recaptchaVerifierSignup;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      notifySuccess("OTP sent to " + phone);
    } catch (err) {
      notifyError(err?.message || "Failed to send OTP");
      window.recaptchaVerifierSignup = null;
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return notifyError("Enter the OTP!");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const res = await CustomerServices.otpLogin({
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        referralCode: formData.referralCode || undefined,
      });
      dispatch({ type: "USER_LOGIN", payload: res });
      Cookies.set("userInfo", JSON.stringify(res), { expires: 7 });
      notifySuccess("Account created successfully!");
      router.push("/user/dashboard");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const FieldError = ({ message }) => (
    <div className="flex items-center gap-1.5 mt-1.5 p-2 bg-red-50 border border-red-200 rounded-md">
      <FiAlertCircle className="text-red-500 shrink-0" size={15} />
      <p className="text-xs text-red-600 font-medium">{message}</p>
      <Link href="/auth/login" className="ml-auto text-xs text-emerald-600 underline font-semibold whitespace-nowrap">
        Login instead →
      </Link>
    </div>
  );

  return (
    <Layout title="Sign Up" description="Create your account">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-4 flex flex-col lg:flex-row w-full">
          <div className="w-full sm:p-5 lg:p-8">
            <div className="mx-auto w-full max-w-lg px-4 py-8 sm:p-10 bg-white shadow-xl rounded-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold font-serif">Sign Up</h2>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  {step === "form"
                    ? "Create your account with phone OTP"
                    : "Enter the OTP sent to " + formData.phone}
                </p>
              </div>

              {step === "form" ? (
                <form onSubmit={handleSendOtp} className="grid grid-cols-1 gap-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400"><FiUser size={18} /></span>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className={`relative flex items-center border rounded-md overflow-hidden focus-within:border-emerald-500 ${fieldErrors.phone ? "border-red-400" : "border-gray-200"}`}>
                      <span className="flex items-center gap-1 px-3 py-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-700 select-none">
                        <FiPhone size={15} /> +91
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone.replace("+91", "")}
                        onChange={handleChange}
                        onBlur={() => handleBlurCheck("phone")}
                        placeholder="9876543210"
                        maxLength={10}
                        className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                        required
                      />
                      {checking && <span className="pr-3 text-xs text-gray-400">checking...</span>}
                      {!checking && !fieldErrors.phone && formData.phone.length === 13 && (
                        <FiCheckCircle className="mr-3 text-emerald-500" size={16} />
                      )}
                    </div>
                    {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
                    {!fieldErrors.phone && <p className="text-xs text-gray-400 mt-1">Enter 10-digit mobile number</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className={`relative border rounded-md focus-within:border-emerald-500 ${fieldErrors.email ? "border-red-400" : "border-gray-200"}`}>
                      <span className="absolute left-3 top-3 text-gray-400"><FiMail size={18} /></span>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlurCheck("email")}
                        placeholder="you@email.com"
                        className="w-full pl-10 pr-4 py-3 text-sm outline-none bg-white rounded-md"
                        required
                      />
                    </div>
                    {fieldErrors.email && <FieldError message={fieldErrors.email} />}
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400"><FiGift size={18} /></span>
                      <input
                        name="referralCode"
                        type="text"
                        value={formData.referralCode}
                        onChange={handleChange}
                        placeholder="Enter referral code"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container-signup" />

                  <button
                    type="submit"
                    disabled={loading || !!fieldErrors.phone || !!fieldErrors.email}
                    className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-emerald-600 underline font-medium">Login</Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="grid grid-cols-1 gap-5">
                  <p className="text-sm text-center text-gray-500">
                    OTP sent to <span className="font-semibold text-gray-700">{formData.phone}</span>
                  </p>
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Create Account"}
                  </button>

                  <button type="button" onClick={() => { setStep("form"); setOtp(""); }}
                    className="text-sm text-center text-gray-500 underline">
                    Go back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(SignUp), { ssr: false });
