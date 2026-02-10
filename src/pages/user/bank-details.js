import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSave } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { notifySuccess, notifyError } from "@utils/toast";
import Dashboard from "@pages/user/dashboard";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";

const BankDetails = () => {
  const {
    state: { userInfo },
  } = useContext(UserContext);
  const { data: session } = useSession();
  const currentUser = userInfo || session?.user;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { data: customerData } = useQuery({
    queryKey: ["customer", currentUser?.email || currentUser?._id],
    queryFn: async () => {
      const userId = currentUser?._id || currentUser?.id;
      return await CustomerServices.getCustomerById(userId);
    },
    enabled: !!(currentUser?._id || currentUser?.id),
  });

  useEffect(() => {
    if (customerData?.bankDetails) {
      setValue("accountHolderName", customerData.bankDetails.accountHolderName || "");
      setValue("accountNumber", customerData.bankDetails.accountNumber || "");
      setValue("ifscCode", customerData.bankDetails.ifscCode || "");
      setValue("bankName", customerData.bankDetails.bankName || "");
      setValue("branchName", customerData.bankDetails.branchName || "");
    }
  }, [customerData, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userId = currentUser?._id || currentUser?.id;
      await CustomerServices.updateBankDetails(userId, data);
      notifySuccess("Bank details updated successfully!");
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard title="Bank Details" description="Manage your bank account details">
      <div className="max-w-screen-2xl">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-serif font-semibold mb-5">Bank Details</h2>
              <p className="text-sm text-gray-600">
                Add your bank account details to receive wallet amount transfers.
              </p>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Account Holder Name
                  </label>
                  <input
                    {...register("accountHolderName", {
                      required: "Account holder name is required",
                    })}
                    type="text"
                    placeholder="Enter account holder name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.accountHolderName && (
                    <p className="text-red-500 text-xs mt-1">{errors.accountHolderName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Account Number
                  </label>
                  <input
                    {...register("accountNumber", {
                      required: "Account number is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers allowed",
                      },
                    })}
                    type="text"
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    IFSC Code
                  </label>
                  <input
                    {...register("ifscCode", {
                      required: "IFSC code is required",
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: "Invalid IFSC code format",
                      },
                    })}
                    type="text"
                    placeholder="Enter IFSC code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ textTransform: "uppercase" }}
                  />
                  {errors.ifscCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bank Name
                  </label>
                  <input
                    {...register("bankName", {
                      required: "Bank name is required",
                    })}
                    type="text"
                    placeholder="Enter bank name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Branch Name
                  </label>
                  <input
                    {...register("branchName", {
                      required: "Branch name is required",
                    })}
                    type="text"
                    placeholder="Enter branch name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.branchName && (
                    <p className="text-red-500 text-xs mt-1">{errors.branchName.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <FiSave />
                    {loading ? "Saving..." : "Save Bank Details"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default BankDetails;
