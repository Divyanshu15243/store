import requests from "./httpServices";

const CustomerServices = {
  loginCustomer: async (body) => {
    return requests.post("/customer/login", body);
  },

  verifyEmailAddress: async (body) => {
    return requests.post("/customer/verify-email", body);
  },
  verifyPhoneNumber: async (body) => {
    return requests.post("/customer/verify-phone", body);
  },

  registerCustomer: async (token, body) => {
    return requests.post(`/customer/register/${token}`, body);
  },

  signUpWithOauthProvider: async (body) => {
    return requests.post(`/customer/signup/oauth`, body);
  },

  signUpWithProvider(token, body) {
    return requests.post(`/customer/signup/${token}`, body);
  },

  forgetPassword: async (body) => {
    return requests.put("/customer/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/customer/reset-password", body);
  },

  changePassword: async (body) => {
    return requests.post("/customer/change-password", body);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  getShippingAddress: async ({ userId = "" }) => {
    return requests.get(`/customer/shipping/address/${userId}`);
  },

  addShippingAddress: async ({ userId = "", shippingAddressData }) => {
    return requests.post(
      `/customer/shipping/address/${userId}`,
      shippingAddressData
    );
  },

  updateShippingAddress: async ({ userId, shippingId, shippingAddressData }) => {
    return requests.put(
      `/customer/shipping/address/${userId}/${shippingId}`,
      shippingAddressData
    );
  },

  deleteShippingAddress: async ({ userId, shippingId }) => {
    return requests.delete(`/customer/shipping/address/${userId}/${shippingId}`);
  },

  updateBankDetails: async (id, bankDetails) => {
    return requests.put(`/customer/${id}`, { bankDetails });
  },
};

export default CustomerServices;
