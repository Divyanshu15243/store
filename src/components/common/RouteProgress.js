import { useEffect, useRef, useState } from "react";
import Router from "next/router";

// thin bar at the top of the screen while the next page loads,
// so taps get instant feedback without hiding the current page
const RouteProgress = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const start = (url, { shallow } = {}) => {
      if (shallow) return;
      clearInterval(timer.current);
      setVisible(true);
      setProgress(15);
      // creep towards 90% until the page arrives
      timer.current = setInterval(() => {
        setProgress((p) => (p < 90 ? p + (90 - p) * 0.1 : p));
      }, 200);
    };

    const done = () => {
      clearInterval(timer.current);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    };

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", done);
    Router.events.on("routeChangeError", done);
    return () => {
      clearInterval(timer.current);
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", done);
      Router.events.off("routeChangeError", done);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none">
      <div
        className="h-full bg-emerald-500 transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default RouteProgress;
