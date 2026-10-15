import "@styles/custom.css";
import { CartProvider } from "react-use-cart";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

// Internal imports
import store from "@redux/store";
import { handlePageView } from "@lib/analytics";
import { UserProvider } from "@context/UserContext";
import DefaultSeo from "@components/common/DefaultSeo";
import RouteProgress from "@components/common/RouteProgress";
import { SidebarProvider } from "@context/SidebarContext";
import SettingServices from "@services/SettingServices";

let persistor = persistStore(store);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [storeSetting, setStoreSetting] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // fetch store settings once, not on every navigation
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const settings = await queryClient.fetchQuery({
          queryKey: ["storeSetting"],
          queryFn: async () => await SettingServices.getStoreSetting(),
          staleTime: 4 * 60 * 1000, // Cache data for 4 minutes
        });
        setStoreSetting(settings);
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };

    fetchStoreSettings();
  }, []);

  // Initialize Google Analytics once settings are known
  useEffect(() => {
    if (!storeSetting?.google_analytic_status) return;

    ReactGA.initialize(storeSetting?.google_analytic_key || "");
    handlePageView();

    const handleRouteChange = (url) => {
      handlePageView(url, "N23 Gujarati Basket");
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSetting?.google_analytic_status]);

  // load the chat widget after the page has settled so it doesn't slow first taps
  useEffect(() => {
    if (!storeSetting?.tawk_chat_status) return;
    const t = setTimeout(() => setShowChat(true), 5000);
    return () => clearTimeout(t);
  }, [storeSetting?.tawk_chat_status]);

  return (
    <>
      {/* Render TawkMessengerReact only if tawk_chat_status is enabled */}
      {showChat && (
        <TawkMessengerReact
          propertyId={storeSetting?.tawk_chat_property_id || ""}
          widgetId={storeSetting?.tawk_chat_widget_id || ""}
        />
      )}
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <UserProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <SidebarProvider>
                  <CartProvider>
                    <DefaultSeo />
                    <RouteProgress />
                    <Component {...pageProps} />
                  </CartProvider>
                </SidebarProvider>
              </PersistGate>
            </Provider>
          </UserProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
