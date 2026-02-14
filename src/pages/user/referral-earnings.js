import { useContext, useEffect } from "react";
import { IoBagHandle } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";

//internal import
import Dashboard from "@pages/user/dashboard";
import OrderServices from "@services/OrderServices";
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";

const ReferralEarnings = () => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["referralEarnings"],
    queryFn: async () => await OrderServices.getReferralEarnings(),
    retry: 1,
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Dashboard
          title="Referral Earnings"
          description="This is referral earnings page"
        >
          <div className="overflow-hidden rounded-md font-serif">
            <div className="flex flex-col">
              <h2 className="text-xl font-serif font-semibold mb-5">
                Referral Earnings
              </h2>
              <div className="mb-4 p-4 bg-emerald-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Total Earnings: <span className="text-xl font-bold text-emerald-600">₹{data?.totalEarnings || 0}</span>
                </p>
              </div>
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="align-middle inline-block border border-gray-100 rounded-md min-w-full pb-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden border-b last:border-b-0 border-gray-100 rounded-md">
                    {loading ? (
                      <CMSkeletonTwo
                        count={20}
                        width={100}
                        error={error}
                        loading={loading}
                      />
                    ) : data?.orders?.length === 0 ? (
                      <div className="text-center">
                        <span className="flex justify-center my-30 pt-16 text-emerald-500 font-semibold text-6xl">
                          <IoBagHandle />
                        </span>
                        <h2 className="font-medium text-md my-4 text-gray-600">
                          No referral earnings yet!
                        </h2>
                      </div>
                    ) : (
                      <table className="table-auto min-w-full border border-gray-100 divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr className="bg-gray-100">
                            <th
                              scope="col"
                              className="text-left text-xs font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              Customer Name
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              Order Date
                            </th>
                            <th
                              scope="col"
                              className="text-center text-xs font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              Order Total
                            </th>
                            <th
                              scope="col"
                              className="text-right text-xs font-serif font-semibold px-6 py-2 text-gray-700 uppercase tracking-wider"
                            >
                              Your Earnings
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data?.orders?.map((order) => (
                            <tr key={order._id}>
                              <td className="px-5 py-3 leading-6 whitespace-nowrap">
                                <span className="font-medium text-sm">
                                  {order.user_info?.name}
                                </span>
                              </td>
                              <td className="px-5 py-3 leading-6 text-center whitespace-nowrap">
                                <span className="text-sm">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-5 py-3 leading-6 text-center whitespace-nowrap">
                                <span className="text-sm font-medium">
                                  ₹{order.total}
                                </span>
                              </td>
                              <td className="px-5 py-3 leading-6 text-right whitespace-nowrap">
                                <span className="text-sm font-bold text-emerald-600">
                                  ₹{order.referralCommission || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dashboard>
      )}
    </>
  );
};

export default ReferralEarnings;
