import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import useRazorpay from "react-razorpay";
import { useQuery } from "@tanstack/react-query";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

//internal import
import { useUserSession } from "@lib/auth";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "./useUtilsFunction";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import NotificationServices from "@services/NotificationServices";
import SettingServices from "@services/SettingServices";

const useCheckoutSubmit = () => {
  const { dispatch } = useContext(UserContext);

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);

  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const couponRef = useRef("");
  const [Razorpay] = useRazorpay();
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  const userInfo = useUserSession();
  const { showDateFormat, currency, globalSetting } = useUtilsFunction();

  // fetch store settings for razorpay key
  const { data: storeSetting } = useQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => await SettingServices.getStoreSetting(),
    staleTime: 4 * 60 * 1000,
  });

  const userId = userInfo?._id || userInfo?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["shippingAddress", { id: userId }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({ userId }),
    select: (data) => data?.shippingAddress,
    enabled: !!userId,
  });

  const hasShippingAddress =
    !isLoading && data && Object.keys(data)?.length > 0;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
    // only set email if it exists (OTP users may not have one)
    if (userInfo?.email) {
      setValue("email", userInfo.email);
    }
  }, [isCouponApplied, userInfo?.email]);

  // Auto-fill address fields on page load if user has shipping address
  useEffect(() => {
    if (hasShippingAddress && useExistingAddress && data) {
      const address = data;
      const nameParts = (address?.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("address", address.address);
      setValue("contact", address.contact);
      setValue("city", address.city || "Surat");
      setValue("area", address.area);
      setValue("country", address.country);
      setValue("zipCode", address.zipCode);
    }
  }, [hasShippingAddress, data, useExistingAddress]);

  // remove coupon if total less than minimum amount
  useEffect(() => {
    if (minimumAmount - discountAmount > total || isEmpty) {
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total]);

  // calculate total and discount
  useEffect(() => {
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + currentValue.itemTotal,
      0
    );

    const subTotal = parseFloat(cartTotal + Number(shippingCost)).toFixed(2);
    const discountAmt =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = discountAmt ? discountAmt : 0;
    setDiscountAmount(discountAmountTotal);
    setTotal(Number(subTotal) - discountAmountTotal);
  }, [cartTotal, shippingCost, discountPercentage]);

  const submitHandler = async (data) => {
    try {
      setIsCheckoutSubmit(true);
      setError("");

      const userDetails = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        contact: data.contact,
        email: data.email || userInfo?.email || "",
        address: data.address,
        country: data.country,
        city: data.city,
        area: data.area,
        zipCode: data.zipCode,
      };

      let orderInfo = {
        user_info: userDetails,
        shippingOption: data.shippingOption,
        paymentMethod: data.paymentMethod,
        status: "Pending",
        cart: items,
        subTotal: cartTotal,
        shippingCost: shippingCost,
        discount: discountAmount,
        total: total,
      };

      // save shipping address
      if (userId) {
        await CustomerServices.addShippingAddress({
          userId,
          shippingAddressData: { ...userDetails },
        });
      }

      switch (data.paymentMethod) {
        case "Card":
          await handlePaymentWithStripe(orderInfo);
          break;
        case "RazorPay":
          await handlePaymentWithRazorpay(orderInfo);
          break;
        case "Cash":
          await handleCashPayment(orderInfo);
          break;
        default:
          throw new Error("Invalid payment method selected");
      }
    } catch (error) {
      notifyError(error?.response?.data?.message || error?.message);
      setIsCheckoutSubmit(false);
    }
  };

  const handleOrderSuccess = async (orderResponse, orderInfo) => {
    try {
      const notificationInfo = {
        orderId: orderResponse?._id,
        message: `${orderResponse?.user_info?.name} placed an order of ${parseFloat(orderResponse?.total).toFixed(2)}!`,
        image: "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
      };

      const updatedData = {
        ...orderResponse,
        date: showDateFormat(orderResponse.createdAt),
        company_info: {
          currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      if (globalSetting?.email_to_customer) {
        OrderServices.sendEmailInvoiceToCustomer(updatedData).catch((e) =>
          console.error("Failed to send email invoice:", e.message)
        );
      }

      await NotificationServices.addNotification(notificationInfo);

      router.push(`/order/${orderResponse?._id}`);
      notifySuccess("Your Order Confirmed! The invoice will be emailed to you shortly.");
      Cookies.remove("couponInfo");
      emptyCart();
      setIsCheckoutSubmit(false);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const handleCashPayment = async (orderInfo) => {
    const orderResponse = await OrderServices.addOrder(orderInfo);
    await handleOrderSuccess(orderResponse, orderInfo);
  };

  const handlePaymentWithStripe = async (orderInfo) => {
    if (!stripe || !elements) throw new Error("Stripe is not initialized");

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error || !paymentMethod) throw new Error(error?.message || "Stripe payment failed");

    const stripeInfo = await OrderServices.createPaymentIntent({
      ...orderInfo,
      cardInfo: paymentMethod,
    });

    stripe.confirmCardPayment(stripeInfo?.client_secret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    const orderResponse = await OrderServices.addOrder({ ...orderInfo, cardInfo: stripeInfo });
    await handleOrderSuccess(orderResponse, orderInfo);
  };

  const handlePaymentWithRazorpay = async (orderInfo) => {
    const { amount, id, currency: rzpCurrency } =
      await OrderServices.createOrderByRazorPay({
        amount: Math.round(orderInfo.total).toString(),
      });

    const options = {
      key: storeSetting?.razorpay_id,
      amount,
      currency: rzpCurrency,
      name: "N23 Gujarati Basket",
      description: "This is the total cost of your purchase",
      order_id: id,
      handler: async (response) => {
        const razorpayDetails = {
          amount: orderInfo.total,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        // fixed: removed stray `car` variable
        const orderData = { ...orderInfo, razorpay: razorpayDetails };
        const orderResponse = await OrderServices.addRazorpayOrder(orderData);
        await handleOrderSuccess(orderResponse, orderInfo);
      },
      prefill: {
        name: orderInfo?.user_info?.name || "Customer",
        email: orderInfo?.user_info?.email || "customer@example.com",
        contact: orderInfo?.user_info?.contact || "0000000000",
      },
      theme: { color: "#10b981" },
    };

    const rzpay = new Razorpay(options);
    rzpay.open();
  };

  const handleShippingCost = (value) => setShippingCost(Number(value));

  const handleDefaultShippingAddress = (value) => {
    setUseExistingAddress(value);
    if (value && data) {
      const nameParts = (data?.name || "").split(" ");
      setValue("firstName", nameParts[0] || "");
      setValue("lastName", nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
      setValue("address", data.address);
      setValue("contact", data.contact);
      setValue("city", data.city || "Surat");
      setValue("area", data.area);
      setValue("country", data.country);
      setValue("zipCode", data.zipCode);
    } else {
      ["firstName", "lastName", "address", "contact", "city", "area", "country", "zipCode"]
        .forEach((f) => setValue(f, ""));
    }
  };

  const handleCouponCode = async (e) => {
    e.preventDefault();
    if (!couponRef.current.value) {
      notifyError("Please Input a Coupon Code!");
      return;
    }
    setIsCouponAvailable(true);
    try {
      const coupons = await CouponServices.getShowingCoupons();
      const result = coupons.filter(
        (coupon) => coupon.couponCode === couponRef.current.value
      );
      setIsCouponAvailable(false);

      if (result.length < 1) return notifyError("Please Input a Valid Coupon!");
      if (dayjs().isAfter(dayjs(result[0]?.endTime))) return notifyError("This coupon is not valid!");
      if (total < result[0]?.minimumAmount) {
        return notifyError(`Minimum ${result[0].minimumAmount} required to apply this coupon!`);
      }

      notifySuccess(`Coupon ${result[0].couponCode} applied!`);
      setIsCouponApplied(true);
      setMinimumAmount(result[0]?.minimumAmount);
      setDiscountPercentage(result[0].discountType);
      dispatch({ type: "SAVE_COUPON", payload: result[0] });
      Cookies.set("couponInfo", JSON.stringify(result[0]));
    } catch (error) {
      notifyError(error.message);
    }
  };

  return {
    register,
    errors,
    showCard,
    setShowCard,
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    currency,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountPercentage,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    isCouponApplied,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    handleDefaultShippingAddress,
  };
};

export default useCheckoutSubmit;
