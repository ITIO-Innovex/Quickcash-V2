import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { toast } from "react-toastify";
import axios from "axios";
import { API_ROUTES } from "../constant/apiRoutes";
import { getBearerToken } from "../constant/Utils";

const AddContact = (props) => {
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addYourself, setAddYourself] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isUserExist, setIsUserExist] = useState(false);

  useEffect(() => {
    checkUserExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Load user details from localStorage when the component mounts
  useEffect(() => {
    const savedUserDetails = JSON.parse(
      localStorage.getItem("UserInformation")
    );
    if (savedUserDetails && addYourself) {
      setName(savedUserDetails.name);
      setPhone(savedUserDetails?.phone || "");
      setEmail(savedUserDetails.email);
    }
  }, [addYourself]);

  const checkUserExist = async () => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/isuserincontactbook`;
      const token =
            { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      };
      const axiosRes = await axios.post(url, {}, { headers });
      const contactRes = axiosRes?.data?.result || {};
      if (!contactRes?.objectId) {
        setIsUserExist(true);
      }
    } catch (err) {
      console.log("err ", err);
    }
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!name || !email) return;
    
    setIsLoader(true);
    try {
      const payload = {
        Name: name,
        Email: email,
        Phone: phone
      };

      const { data } = await axios.post(API_ROUTES.ADD_CONTACTS, payload, {
        headers: { Authorization: getBearerToken() },
      });

      if (data) {
        props.details(data);
        if (props.closePopup) {
          props.closePopup();
          // Reset the form fields
          setAddYourself(false);
          setName("");
          setPhone("");
          setEmail("");
        }
      }
    } catch (error) {
      console.error("Failed to fetch signers:", error);
      toast.error("Could not load signers.");
    } finally {
      setIsLoader(false);
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleAddYourselfChange = () => {
    if (addYourself) {
      setAddYourself(false);
      setName("");
      setPhone("");
      setEmail("");
    } else {
      setAddYourself(true);
    }
  };
  const handleReset = () => {
    setAddYourself(false);
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <div className="h-full px-[20px] py-[10px]">
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto p-[8px]">
        {!props?.isDisableTitle && (
          <div className="text-[14px] font-[700]">{("Add Contact")}</div>
        )}
        {isUserExist && (
          <div className="mb-[0.75rem] flex items-center mt-1">
            <input
              type="checkbox"
              id="addYourself"
              checked={addYourself}
              onChange={handleAddYourselfChange}
              className="op-checkbox op-checkbox-sm"
            />
            <label
              htmlFor="addYourself"
              className="ml-[0.5rem] text-base-content mb-0"
            >
              {("add-yourself")}
            </label>
          </div>
        )}
        <form className="text-base-content" onSubmit={handleSubmit}>
          <div className="mb-[0.75rem]">
            <label htmlFor="name" className="text-[13px]">
              {("name")}
              <span className="text-[13px] text-[red]"> *</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onInvalid={(e) => e.target.setCustomValidity(("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
          <div className="mb-[0.75rem]">
            <label htmlFor="email" className="text-[13px]">
              {("email")}
              <span className="text-[13px] text-[red]"> *</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value?.toLowerCase()?.replace(/\s/g, ""))
              }
              onInvalid={(e) => e.target.setCustomValidity(("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs lowercase"
            />
          </div>
          <div className="mb-[0.75rem]">
            <label htmlFor="phone" className="text-[13px]">
              {("phone")}
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={addYourself}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={("phone-optional")}
            />
          </div>

          <div className="mt-6 flex justify-start gap-2">
            <button type="submit" className="op-btn op-btn-primary">
              {("Submit")}
            </button>
            <button
              type="button"
              onClick={() => handleReset()}
              className="op-btn op-btn-secondary"
            >
              {("Reset")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;
