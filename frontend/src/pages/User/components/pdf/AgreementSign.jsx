import React, { useState } from "react";

import AgreementContent from "./AgreementContent";

function AgreementSign(props) {
  
  const [isChecked, setIsChecked] = useState(false);
  const [isShowAgreeTerms, setIsShowAgreeTerms] = useState(false);

  return (
    <>
      <div className="op-modal op-modal-open absolute z-[448]">
        <div className="w-[95%] md:w-[60%] lg:w-[40%] op-modal-box overflow-y-auto hide-scrollbar text-sm p-4">
          <div className="flex flex-row items-center">
            <input
              data-tut="IsAgree"
              className="mr-3 op-checkbox op-checkbox-m"
              type="checkbox"
              value={isChecked}
              onChange={(e) => {
                setIsChecked(e.target.checked);
                if (e.target.checked) {
                  props.setIsAgreeTour(false);
                }
                props.showFirstWidget();
              }}
            />
            <div className="text-[11px] md:text-base">
              <span>{("I confirm that I have read and understood the ")}</span>
              <span
                className="font-bold text-blue-600 cursor-pointer"
                onClick={() => {
                  setIsShowAgreeTerms(true);
                  props.setIsAgreeTour(false);
                }}
              >
                {(" Electronic Record and Signature Disclosure")}
              </span>
              <span> {("and consent to use electronic records and signatures.")}</span>
            </div>
          </div>
          <div className="flex ml-[35px] mt-3">
            <button
              onClick={() => {
                if (isChecked) {
                  props.setIsAgreeTour(false);
                  props.setIsAgree(true);
                } else {
                  props.setIsAgreeTour(true);
                }
              }}
              className="op-btn op-btn-primary op-btn-sm w-full md:w-auto"
            >
              {("Agree & Continue")}
            </button>
          </div>
          <div className="mt-2">
            <span className="text-[11px]">{("Note: Agreeing to this does not mean you are signing the document immediately. This only allows you to review the document electronically. You will have the opportunity to read it in full and decide whether to sign it afterward.")}</span>
          </div>
        </div>
      </div>
      {isShowAgreeTerms && (
        <AgreementContent
          setIsAgreeTour={props.setIsAgreeTour}
          setIsAgree={props.setIsAgree}
          setIsShowAgreeTerms={setIsShowAgreeTerms}
          showFirstWidget={props.showFirstWidget}
        />
      )}
    </>
  );
}

export default AgreementSign;
