import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  emailRegex,
} from "../constant/const";
import {
  contractUsers,
  saveLanguageInLocal
} from "../constant/Utils";
import logo from "/logo.png";
// import Parse from "parse";
// import SelectLanguage from "../components/pdf/SelectLanguage";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import Title from "../components/Title";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import { API_ROUTES } from "@/pages/User/constant/apiRoutes";

function GuestLogin() {
  // const { t, i18n } = useTranslation();
  const { id, userMail, contactBookId, base64url } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    userMail?.toLowerCase()?.replace(/\s/g, "")
  );
  const [OTP, setOTP] = useState("");
  const [EnterOTP, setEnterOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: ("loading-mssg")
  });
  const [appLogo, setAppLogo] = useState("");
  const [documentId, setDocumentId] = useState(id);
  const [contactId, setContactId] = useState(contactBookId);
  const [sendmail, setSendmail] = useState();
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });


  const navigateToDoc = async (docId, contactId) => {
    try {
      const docDetails = await axios.get(API_ROUTES.GET_DOCUMENT(docId));
      if (!docDetails.error) {
        if (sendmail === "false") {
          navigate(
            `/digital-signature/load/recipientSignPdf/${docId}/${contactId}?sendmail=${sendmail}`
          );
        } else {
          navigate(`/digital-signature/load/recipientSignPdf/${docId}/${contactId}`);
        }
        return true;
      } else {
        setIsLoading({ isLoad: false });
        return false;
      }
    } catch (err) {
      console.log("err while getting doc", err);
      return false;
    }
  };

  useEffect(() => {
    handleServerUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  //function generate serverUrl and parseAppId from url and save it in local storage
  const handleServerUrl = async () => {
      setAppLogo(logo);

    localStorage.clear(); // Clears everything
    localStorage.setItem(
      "appname",
        "OpenSign™"
    );
    //save isGuestSigner true in local to handle login flow header in mobile view
    localStorage.setItem("isGuestSigner", true);
    // saveLanguageInLocal(i18n);
    // const parseId = appInfo.appId;
    // const newServer = `${appInfo.baseUrl}/`;
    // localStorage.setItem("baseUrl", newServer);
    // localStorage.setItem("parseAppId", parseId);
    //this condition is used decode base64 to string and get userEmail,documentId, contactBoookId data.
    if (!id) {
      //`atob` function is used to decode base64
      const decodebase64 = atob(base64url);
      console.log('decodebase64', decodebase64)
      //split url in array from '/'
      const checkSplit = decodebase64.split("/");
      setDocumentId(checkSplit[0]);
      setContact((prev) => ({
        ...prev,
        email: checkSplit[1]?.toLowerCase()?.replace(/\s/g, "")
      }));
      setEmail(checkSplit[1]?.toLowerCase()?.replace(/\s/g, ""));
      const contactId = checkSplit?.[2];
      setSendmail(checkSplit[3]);
      if (!contactId) {
        const params = {
          email: checkSplit[1]?.toLowerCase()?.replace(/\s/g, ""),
          docId: checkSplit[0]
        };
        try {
          // const linkContactRes = await Parse.Cloud.run(
          //   "linkcontacttodoc",
          //   params
          // );
          // setContactId(linkContactRes?.contactId);
          await navigateToDoc(checkSplit[0], linkContactRes?.contactId);
        } catch (err) {
          setIsLoading({ isLoad: false });
          console.log("Err in link ext contact", err);
        }
      } else {
        setContactId(checkSplit[2]);
        await navigateToDoc(checkSplit[0], checkSplit[2]);
      }
    }
  };

  //send email OTP function
  const SendOtp = async () => {
    // setLoading(true);
    // setEmail(email?.toLowerCase()?.replace(/\s/g, ""));
    // try {
    //   const params = {
    //     email: email?.toLowerCase()?.replace(/\s/g, "")?.toString(),
    //     docId: documentId,
    //   };
    //   const Otp = await Parse.Cloud.run("SendOTPMailV1", params);
    //   if (Otp) {
    //     setLoading(false);
    //     setEnterOtp(true);
    //   }
    // } catch (error) {
    //   alert(("Something went wrong"));
    //   setLoading(false);
    // }
  };

  const handleSendOTPBtn = async (e) => {
    e.preventDefault();
    await SendOtp();
  };

  //verify OTP send on via email
  const VerifyOTP = async (e) => {
    // e.preventDefault();
    // const serverUrl =
    //   localStorage.getItem("baseUrl") && localStorage.getItem("baseUrl");
    // const parseId =
    //   localStorage.getItem("parseAppId") && localStorage.getItem("parseAppId");
    // if (OTP) {
    //   setLoading(true);
    //   try {
    //     let url = `${serverUrl}functions/AuthLoginAsMail`;
    //     const headers = {
    //       "Content-Type": "application/json",
    //       "X-Parse-Application-Id": parseId
    //     };
    //     let body = {
    //       email: email?.toLowerCase()?.replace(/\s/g, ""),
    //       otp: OTP
    //     };
    //     let user = await axios.post(url, body, { headers: headers });
    //     if (user.data.result === "Invalid Otp") {
    //       alert(("invalid-otp"));
    //       setLoading(false);
    //     } else if (user.data.result === "user not found!") {
    //       alert(("user-not-found"));
    //       setLoading(false);
    //     } else {
    //       let _user = user.data.result;
    //       await Parse.User.become(_user.sessionToken);
    //       const parseId = localStorage.getItem("parseAppId");
    //       if (_user) {
    //         localStorage.setItem("accesstoken", _user?.sessionToken);
    //         localStorage.setItem("UserInformation", JSON.stringify(_user));
    //         localStorage.setItem(
    //           `Parse/${parseId}/currentUser`,
    //           JSON.stringify(_user)
    //         );
    //       }
    //       const contractUserDetails = await contractUsers();
    //       if (contractUserDetails && contractUserDetails.length > 0) {
    //         localStorage.setItem(
    //           "Extand_Class",
    //           JSON.stringify(contractUserDetails)
    //         );
    //       }
    //       setLoading(false);
    //       if (sendmail === "false") {
    //         navigate(
    //           `/load/recipientSignPdf/${documentId}/${contactId}?sendmail=${sendmail}`
    //         );
    //       } else {
    //         navigate(`/load/recipientSignPdf/${documentId}/${contactId}`);
    //       }
    //     }
    //   } catch (error) {
    //     console.log("err ", error);
    //     setLoading(false);
    //   }
    // } else {
    //   alert(("enter-otp-alert"));
    // }
  };


  const handleUserData = async (e) => {
    // e.preventDefault();
    // if (!emailRegex.test(contact.email?.toLowerCase()?.replace(/\s/g, ""))) {
    //   aler("Please enter a valid email address.");
    // } else {
    //   const params = { ...contact, docId: documentId };
    //   try {
    //     setLoading(true);
    //     const linkContactRes = await Parse.Cloud.run(
    //       "linkcontacttodoc",
    //       params
    //     );
    //     setContactId(linkContactRes.contactId);
    //     const IsEnableOTP = await navigateToDoc(
    //       documentId,
    //       linkContactRes.contactId
    //     );
    //     if (!IsEnableOTP) {
    //       setEnterOtp(true);
    //       await SendOtp();
    //     }
    //   } catch (err) {
    //     setLoading(false);
    //     alert(("Something went wrong"));
    //     console.log("Err in link ext contact", err);
    //   }
    // }
  };

  const handleInputChange = (e) => {
    if (e.target.name === "email") {
      setContact((prev) => ({
        ...prev,
        [e.target.name]: e.target.value?.toLowerCase()?.replace(/\s/g, "")
      }));
    } else {
      setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  return (
    <div>
      <Title title="Request Sign" />

      {/* OTP Verification Modal */}
      {EnterOTP && (
        <ModalUi
          isOpen
          title={("otp-verification")}
          handleClose={() => setEnterOtp(false)}
        >
          {loading ? (
            <div className="h-[150px] flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <form onSubmit={(e) => VerifyOTP(e)}>
              <div className="px-6 py-3 text-base-content">
                <label className="mb-2">{("enter-otp")}</label>
                <input
                  onInvalid={(e) =>
                    e.target.setCustomValidity(("input-required"))
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                  type="tel"
                  pattern="[0-9]{4}"
                  className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                  placeholder={("otp-placeholder")}
                  value={OTP}
                  onChange={(e) => setOTP(e.target.value)}
                />
              </div>
              <div className="px-6 mb-3">
                <button type="submit" className="op-btn op-btn-primary">
                  {("verify")}
                </button>
                <button
                  className="op-btn op-btn-secondary ml-2"
                  onClick={(e) => handleSendOTPBtn(e)}
                >
                  {("resend")}
                </button>
              </div>
            </form>
          )}
        </ModalUi>
      )}

      {isLoading.isLoad ? (
        <LoaderWithMsg isLoading={isLoading} />
      ) : (
        <div className="pb-1 md:pb-4 pt-10 md:px-10 lg:px-16">
          <div className="md:p-4 lg:p-10 p-4 text-base-content bg-base-100 op-card shadow-md">
            <div className="w-[250px] h-[66px] inline-block overflow-hidden mb-6">
              {appLogo && (
                <img
                  src={appLogo}
                  className="object-contain h-full"
                  alt="logo"
                />
              )}
            </div>
            {contactId ? (
              <div className="w-full md:w-[50%] text-base-content">
                <h1 className="text-2xl md:text-[30px]">{("welcome")}</h1>
                <legend className="text-[12px] text-[#878787] mt-2 mb-1">
                  {("get-otp-alert")}
                </legend>
                <div className="p-[20px] outline outline-1 outline-slate-300/50 my-2 op-card shadow-md">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full disabled:text-[#5c5c5c] text-xs"
                    disabled
                  />
                </div>
                <div className="mt-3">
                  <button
                    className="op-btn op-btn-primary flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                        SendOtp();
                    }}
                    disabled={loading}
                  >
                        <i className="fa-light fa-message-sms mr-2"></i>
                        {loading ? ("loading") : ("get-verification-code")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-[50%] text-base-content">
                <h1 className="text-2xl md:text-[30px]">{("welcome")}</h1>
                <legend className="text-[12px] text-[#878787] mt-2">
                  {("provide-your-details")}
                </legend>
                <form
                  className="p-[20px] pt-[15px] outline outline-1 outline-slate-300/50 my-2 op-card shadow-md"
                  onSubmit={handleUserData}
                >
                  <div className="mb-2">
                    <label
                      htmlFor="name"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {("name")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contact.name}
                      onChange={handleInputChange}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      disabled={loading}
                      onInvalid={(e) =>
                        e.target.setCustomValidity(("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor="email"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {("email")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={handleInputChange}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      required
                      disabled
                    />
                  </div>
                  <div className="mt-2.5">
                    <label
                      htmlFor="phone"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {("phone")}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={contact.phone}
                      onChange={handleInputChange}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      disabled={loading}
                      placeholder={("phone-optional")}
                    />
                  </div>
                  <div className="mt-2 flex justify-start">
                    <button
                      type="submit"
                      className="op-btn op-btn-primary"
                      disabled={loading}
                    >
                      {loading ? ("loading") : ("next")}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          {/* <SelectLanguage /> */}
        </div>
      )}
    </div>
  );
}

export default GuestLogin;
