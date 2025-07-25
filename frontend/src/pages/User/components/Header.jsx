import React, { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import { useNavigate } from "react-router";
import { useWindowSize } from "../hook/useWindowSize";
import {
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";


const Header = ({ showSidebar, setIsMenu, isConsole }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const username = localStorage.getItem("username") || "Admin User";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (width <= 768) {
      setIsMenu(false);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    // Clear all local storage except essential items
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);

    navigate("/");
  };

  //handle to close profile drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest("#profile-menu")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <div>
      <div className="op-navbar bg-base-100 shadow">
        <div className="flex-none">
          <button
            className="op-btn op-btn-square op-btn-ghost focus:outline-none hover:bg-transparent op-btn-sm no-animation"
            onClick={showSidebar}
          >
            <i className="fa-light fa-bars text-xl text-base-content"></i>
          </button>
        </div>
        <div className="flex-1 ml-2">
          <div className="h-[25px] md:h-[40px] w-auto overflow-hidden">
            <h1 className="text-xl font-bold text-primary">ITIO Digital Signature</h1>
          </div>
        </div>
        <div id="profile-menu" className="flex-none gap-2">
          <div>
            <FullScreenButton />
          </div>
          {width >= 768 && (
            <div
              onClick={toggleDropdown}
              className="cursor-pointer w-[35px] h-[35px] rounded-full ring-[1px] ring-offset-2 ring-gray-400 overflow-hidden"
            >
              <img
                className="w-[35px] h-[35px] object-contain"
                src={image}
                alt="Profile"
              />
            </div>
          )}
          {width >= 768 && (
            <div
              onClick={toggleDropdown}
              role="button"
              tabIndex="0"
              className="cursor-pointer text-base-content text-sm"
            >
              {username}
            </div>
          )}
          <div
            className="op-dropdown op-dropdown-open op-dropdown-end"
            id="profile-menu"
          >
            <div
              tabIndex={0}
              role="button"
              onClick={toggleDropdown}
              className="op-btn op-btn-ghost op-btn-xs w-[10px] h-[20px] hover:bg-transparent"
            >
              <i className="fa-light fa-angle-down text-base-content"></i>
            </div>
            <ul
              tabIndex={0}
              className={`mt-3 z-[1] p-2 shadow op-dropdown-open op-menu op-menu-sm op-dropdown-content text-base-content bg-base-100 rounded-box w-52 ${
                isOpen ? "" : "hidden"
              }`}
            >
              {!isConsole && (
                <>
                  <li
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <span>
                      <i className="fa-light fa-user"></i> {("profile")}
                    </span>
                  </li>
                </>
              )}
              <li onClick={closeDropdown}>
                <span>
                  <i className="fa-light fa-arrow-right-from-bracket"></i>{" "}
                  {("log-out")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
