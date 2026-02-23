import React, { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCart } from "react-use-cart";
import { FiHome, FiUser, FiShoppingCart, FiAlignLeft } from "react-icons/fi";

//internal imports
import { getUserSession } from "@lib/auth";
import { SidebarContext } from "@context/SidebarContext";
import CategoryDrawer from "@components/drawer/CategoryDrawer";

const MobileFooter = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { toggleCartDrawer, toggleCategoryDrawer } = useContext(SidebarContext);
  const { totalItems } = useCart();
  const userInfo = getUserSession();

  return (
    <>
      <div className="flex flex-col h-full justify-between align-middle bg-white rounded cursor-pointer overflow-y-scroll flex-grow scrollbar-hide w-full">
        <CategoryDrawer className="w-6 h-6 drop-shadow-xl" />
      </div>
      <footer className="lg:hidden fixed z-30 bottom-0 bg-emerald-500 flex items-center justify-between w-full h-16 px-3 sm:px-10">
        <button
          aria-label="Bar"
          onClick={toggleCategoryDrawer}
          className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none"
        >
          <span className="text-xl text-white">
            <FiAlignLeft className="w-6 h-6 drop-shadow-xl" />
          </span>
        </button>
        <Link
          href="/"
          className="text-xl text-white"
          rel="noreferrer"
          aria-label="Home"
        >
          <FiHome className="w-6 h-6 drop-shadow-xl" />
        </Link>

        <Link
          href="#"
          className="text-xl text-white"
          aria-label="Language"
        >
          <svg className="w-6 h-6 drop-shadow-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </Link>

        <button
          onClick={toggleCartDrawer}
          className="h-9 w-9 relative whitespace-nowrap inline-flex items-center justify-center text-white text-lg"
        >
          <span className="absolute z-10 top-0 right-0 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 bg-red-500 rounded-full">
            {totalItems}
          </span>
          <FiShoppingCart className="w-6 h-6 drop-shadow-xl" />
        </button>
        <button
          aria-label="User"
          type="button"
          className="text-xl text-white indicator justify-center"
        >
          {userInfo?.image ? (
            <Link href="/user/dashboard" className="relative top-1 w-6 h-6">
              <Image
                width={29}
                height={29}
                src={userInfo.image}
                alt="user"
                className="rounded-full"
              />
            </Link>
          ) : userInfo?.name ? (
            <Link
              href="/user/dashboard"
              className="leading-none font-bold font-serif block"
            >
              {userInfo?.name[0]}
            </Link>
          ) : (
            <Link href="/auth/login">
              <FiUser className="w-6 h-6 drop-shadow-xl" />
            </Link>
          )}
        </button>
      </footer>
    </>
  );
};

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });
