import React, { useState } from "react";
import "../styles/signature.css";
import Loader from "./Loader";

function CustomModal(props) {
  const [reason, setReason] = useState("");
  const [isExtendExpiry, setIsExtendExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const localuser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );

  const currentUser = JSON.parse(localuser);
  const isCreator = props?.doc
    ? props?.doc?.CreatedBy?.objectId === currentUser?.objectId &&
      localStorage.getItem("_user_role") !== "Guest"
    : false;
  const handleExtendBtn = () => setIsExtendExpiry(!isExtendExpiry);

  const handleUpdateExpiry = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (expiryDate) {
      props.handleExpiry && props.handleExpiry(expiryDate);
    } else {
      alert(("expiry-date-error"));
    }
  };

  return (
    props.show && (
      <dialog className="op-modal op-modal-open absolute z-[448]">
        <div className="w-[95%] md:w-[60%] lg:w-[40%] op-modal-box p-0 overflow-y-auto hide-scrollbar text-sm">
          {props?.isLoader && (
            <div className="absolute h-full w-full flex flex-col justify-center items-center z-[999] bg-[#e6f2f2] bg-opacity-80">
              <Loader />
            </div>
          )}
          <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
            {props?.headMsg && props?.headMsg}
          </h3>
          {!isExtendExpiry && (
            <div className="p-[10px] px-[20px]">
              <p className="text-[15px]">{props.bodyMssg && props.bodyMssg}</p>
            </div>
          )}
          {!isExtendExpiry && (
            <div className="flex flex-row items-center">
              {isCreator && (
                <button
                  className="op-btn op-btn-primary px-6 ml-[20px] mb-3 mt-1"
                  onClick={() => handleExtendBtn()}
                >
                  Extend
                </button>
              )}
              {props.isDownloadBtn && (
                <button
                  className="op-btn op-btn-secondary ml-[10px] mb-3 mt-1"
                  onClick={() => props.handleDownloadBtn()}
                >
                  Download
                </button>
              )}
            </div>
          )}
          {props.footerMessage && (
            <>
              <div className="mx-3">
                <textarea
                  rows={3}
                  placeholder="Reason (optional)"
                  className="px-4 op-textarea op-textarea-bordered focus:outline-none hover:border-base-content w-full text-xs"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              <div className="m-[15px]">
                <button
                  className="op-btn op-btn-primary mr-2 px-6"
                  type="button"
                  onClick={() => {
                    props.declineDoc(reason);
                    setReason("");
                  }}
                >
                  {("yes")}
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-secondary"
                  onClick={() => {
                    setReason("");
                    props.setIsDecline({ isDeclined: false });
                  }}
                >
                  {("close")}
                </button>
              </div>
            </>
          )}
          {isExtendExpiry && (
            <form className="mx-3 mb-3" onSubmit={handleUpdateExpiry}>
              <label className="ml-2 mt-2">
                {("expiry-date")} {"(dd-mm-yyyy)"}
              </label>
              <input
                type="date"
                className="rounded-full bg-base-300 w-full px-4 py-2 text-black border-2 hover:border-spacing-2"
                defaultValue={props?.doc?.ExpiryDate?.iso?.split("T")?.[0]}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <div className="flex flex-row items-center mt-2">
                <button type="submit" className="op-btn op-btn-primary mr-2">
                  {("update")}
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-secondary"
                  onClick={() => {
                    setExpiryDate("");
                    setIsExtendExpiry(false);
                  }}
                >
                  {("cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    )
  );
}

export default CustomModal;
