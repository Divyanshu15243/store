import { loadStripe } from "@stripe/stripe-js";
import SettingServices from "@services/SettingServices";

let stripePromise = null;

const getStripe = async () => {
  if (stripePromise) return stripePromise;

  try {
    const storeSetting = await SettingServices.getStoreSetting();
    const key = storeSetting?.stripe_key;
    if (!key || typeof key !== "string") return null;
    stripePromise = loadStripe(key);
    return stripePromise;
  } catch (_) {
    return null;
  }
};

export default getStripe;
