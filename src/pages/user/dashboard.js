import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { IoLockOpenOutline } from "react-icons/io5";
import {
  FiCheck,
  FiFileText,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiSettings,
  FiShoppingCart,
  FiTruck,
  FiUser,
  FiGift,
  FiCopy,
} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

//internal import
import Layout from "@layout/Layout";
import Card from "@components/order-card/Card";
import OrderServices from "@services/OrderServices";
import CustomerServices from "@services/CustomerServices";
import RecentOrder from "@pages/user/recent-order";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import Loading from "@components/preloader/Loading";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Dashboard = ({ title, description, children }) => {
  const router = useRouter();
  const { isLoading, setIsLoading, currentPage } = useContext(SidebarContext);
  const {
    state: { userInfo },
  } = useContext(UserContext);
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  // Use session user if userInfo is null
  const currentUser = userInfo || session?.user;

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["orders", { currentPage }],
    queryFn: async () =>
      await OrderServices.getOrderCustomer({
        page: currentPage,
        limit: 10,
      }),
    enabled: !!(currentUser?._id || currentUser?.id || session?.user),
    retry: 1,
  });

  const { data: customerData, error: customerError, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", currentUser?.email || currentUser?._id],
    queryFn: async () => {
      const userId = currentUser?._id || currentUser?.id;
      console.log("Current user object:", currentUser);
      console.log("Fetching customer with ID:", userId);
      const result = await CustomerServices.getCustomerById(userId);
      console.log("Customer API result:", result);
      return result;
    },
    enabled: !!(currentUser?._id || currentUser?.id),
    retry: false,
  });

  const handleLogOut = () => {
    signOut();
    Cookies.remove("couponInfo");
    router.push("/");
  };

  const copyReferralCode = () => {
    if (customerData?.referralCode) {
      navigator.clipboard.writeText(customerData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const userSidebar = [
    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.dashboard_title
      ),
      href: "/user/dashboard",
      icon: FiGrid,
    },

    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.my_order
      ),
      href: "/user/my-orders",
      icon: FiList,
    },
    {
      title: "Referral Earnings",
      href: "/user/referral-earnings",
      icon: FiGift,
    },
    {
      title: "My Account",
      href: "/user/my-account",
      icon: FiUser,
    },

    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.update_profile
      ),
      href: "/user/update-profile",
      icon: FiSettings,
    },
    {
      title: "Bank Details",
      href: "/user/bank-details",
      icon: FiFileText,
    },
    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.change_password
      ),
      href: "/user/change-password",
      icon: FiFileText,
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout
          title={title ? title : "Dashboard"}
          description={description ? description : "This is User Dashboard"}
        >
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <div className="py-10 lg:py-12 flex flex-col lg:flex-row w-full">
              <div className="flex-shrink-0 w-full lg:w-80 mr-7 lg:mr-10  xl:mr-10 ">
                <div className="bg-white p-4 sm:p-5 lg:p-8 rounded-md sticky top-32">
                  {userSidebar?.map((item) => (
                    <span
                      key={item.title}
                      className="p-2 my-2 flex font-serif items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600"
                    >
                      <item.icon
                        className="flex-shrink-0 h-4 w-4"
                        aria-hidden="true"
                      />
                      <Link
                        href={item.href}
                        className="inline-flex items-center justify-between ml-2 text-sm font-medium w-full hover:text-emerald-600"
                      >
                        {item.title}
                      </Link>
                    </span>
                  ))}
                  <span className="p-2 flex font-serif items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                    <span className="mr-2">
                      <IoLockOpenOutline />
                    </span>{" "}
                    <button
                      onClick={handleLogOut}
                      className="inline-flex items-center justify-between text-sm font-medium w-full hover:text-emerald-600"
                    >
                      {showingTranslateValue(
                        storeCustomizationSetting?.navbar?.logout
                      )}
                    </button>
                  </span>
                </div>
              </div>
              <div className="w-full bg-white mt-4 lg:mt-0 p-4 sm:p-5 lg:p-8 rounded-md overflow-hidden">
                {!children && (
                  <div className="overflow-hidden">
                    <h2 className="text-xl font-serif font-semibold mb-5">
                      {showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.dashboard_title
                      )}
                    </h2>
                    <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-5">
                      <Card
                        title={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.total_order
                        )}
                        Icon={FiShoppingCart}
                        quantity={data?.totalDoc}
                        className="text-red-600  bg-red-200"
                      />
                      <Card
                        title={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.pending_order
                        )}
                        Icon={FiRefreshCw}
                        quantity={data?.pending}
                        className="text-orange-600 bg-orange-200"
                      />
                      <Card
                        title={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.processing_order
                        )}
                        Icon={FiTruck}
                        quantity={data?.processing}
                        className="text-indigo-600 bg-indigo-200"
                      />
                      <Card
                        title={showingTranslateValue(
                          storeCustomizationSetting?.dashboard?.complete_order
                        )}
                        Icon={FiCheck}
                        quantity={data?.delivered}
                        className="text-emerald-600 bg-emerald-200"
                      />
                      <Card
                        title="Referral Earnings"
                        Icon={FiGift}
                        quantity={`₹${data?.referralEarnings || 0}`}
                        className="text-purple-600 bg-purple-200"
                      />
                    </div>

                    {/* Referral & Wallet Section - Always show for debugging */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg mb-8 border border-emerald-200">
                      <div className="flex items-center mb-4">
                        <FiGift className="text-emerald-600 text-2xl mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Refer & Earn
                        </h3>
                      </div>
                      {customerData?.referralCode ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Your Referral Code:
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white px-4 py-3 rounded-md border border-emerald-300 font-mono text-lg font-bold text-emerald-700">
                                {customerData.referralCode}
                              </div>
                              <button
                                onClick={copyReferralCode}
                                className="px-4 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
                              >
                                <FiCopy />
                                {copied ? "Copied!" : "Copy"}
                              </button>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Wallet Balance:
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                              ₹{customerData.walletBalance || 0}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Share your code with friends and earn 40% of profit
                            when they make purchases!
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Loading referral code...</p>
                        </div>
                      )}
                    </div>

                    <RecentOrder data={data} loading={loading} error={error} />
                  </div>
                )}
                {children}
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
