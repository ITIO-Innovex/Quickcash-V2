import React from "react";

import ModalUi from "../../primitives/ModalUi";

function AgreementContent(props) {
  
  const appName =
    "OpenSign™";
  const h2Style = "text-base-content font-medium text-lg";
  const ulStyle = "list-disc px-4 py-3";
  const handleOnclick = () => {
    props.setIsAgreeTour(false);
    props.setIsAgree(true);
    props.setIsShowAgreeTerms(false);
    props.showFirstWidget();
  };
  return (
    <div>
      <ModalUi
        isOpen={true}
        title={("Terms and conditions")}
        handleClose={() => props.setIsShowAgreeTerms(false)}
      >
        <div className="h-[100%] p-[20px]">
          <h2 className={h2Style}>{("ELECTRONIC RECORD AND SIGNATURE DISCLOSURE")}</h2>
          <span className="mt-2">
            {("This Electronic Record and Signature Disclosure ('Disclosure') is an agreement between the Document Creator ('Sender') and the Signer ('You'), facilitated through the QuickCash platform ('Platform'). By signing documents via QuickCash, you agree to the terms outlined in this Disclosure. Please read it carefully before proceeding.")}
          </span>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("1. Purpose and Scope")}</h2>
          <span className="mt-2">
            {("This Disclosure governs the use of electronic records and signatures for documents sent by the Sender and signed by You through the QuickCash platform. By agreeing, You acknowledge that:")}
          </span>
          <ul className={ulStyle}>
            <li>{("You will receive and sign documents electronically via QuickCash.")}</li>
            <li>{("Your electronic signature is legally binding and equivalent to a handwritten signature.")}</li>
          </ul>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("2. Consent to Use Electronic Records and Signatures")}</h2>
          <span className="mt-2">{("By agreeing to this Disclosure:")}</span>
          <ul className={ulStyle}>
            <li>{("You consent to transact electronically with the Sender using QuickCash and understand that this consent is valid until withdrawn.")}</li>
            <li>{("You agree to review, sign, and return documents electronically using QuickCash.")}</li>
            <li>{("This consent applies only to the specific document(s) provided by the Sender.")}</li>
          </ul>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("3. Right to Withdraw Consent")}</h2>
          <span className="mt-2">{("You have the right to withdraw your consent to use electronic records and signatures by:")}</span>
          <ul className={ulStyle}>
            <li>{("Contacting the Sender directly using the contact information provided in their communication.")}</li>
            <li>{("Notifying the Sender before completing the signing process.")}</li>
          </ul>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("4. Hardware and Software Requirements")}</h2>
          <span className="mt-2">
            {("To sign documents using QuickCash, You must have:")}
          </span>
          <ul className={ulStyle}>
            <li>{("A device with internet access.")}</li>
            <li>{("A compatible web browser with JavaScript enabled.")}</li>
            <li>{("An email account to receive notifications and signed documents.")}</li>
          </ul>
          <span>{("If these requirements change, the Sender or QuickCash will notify You of the updates.")}</span>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("5. Retention of Records and Request for Paper Copies")}</h2>
          <p>{("You are responsible for ensuring You can access and retain the electronically signed document(s). QuickCash provides tools to download or print the signed document immediately after the signing process is complete.")}</p>
          <p className="mt-2">{("If You prefer a paper copy of any electronically signed document, You may request it directly from the Sender. The Sender may charge a reasonable fee for providing paper copies unless prohibited by applicable law.")}</p>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("6. Acknowledgment and Agreement")}</h2>
          <span className="mt-2">{("By proceeding, You:")}</span>
          <ul className={ulStyle}>
            <li>{("Confirm that You can access and review electronic documents as described in this Disclosure.")}</li>
            <li>{("Agree to use electronic records and signatures for the specified transaction(s) with the Sender.")}</li>
            <li>{("Understand that QuickCash is a platform facilitating the transaction and is not a party to the agreement.")}</li>
          </ul>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("7. Legal Effect")}</h2>
          <span className="mt-2">
            {("Your electronic signature facilitated through QuickCash:")}
          </span>
          <ul className={ulStyle}>
            <li>{("Complies with applicable electronic signature laws, including but not limited to the E-SIGN Act in the United States, the EU eIDAS Regulation, and India's Information Technology Act.")}</li>
            <li>{("Is legally binding between You and the Sender for the signed document(s).")}</li>
          </ul>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("8. Platform Role and Limitation of Liability")}</h2>
          <span className="mt-2">
            {("QuickCash serves as a platform to facilitate electronic transactions. It is not responsible for the content, validity, or enforceability of the documents sent by the Sender. Any disputes or issues related to the document or its signing must be resolved directly between You and the Sender.")}
          </span>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <h2 className={h2Style}>{("9. Termination of Agreement")}</h2>
          <span className="mt-2">
            {("Your consent applies only to the current transaction unless otherwise specified by the Sender. QuickCash reserves the right to terminate access to its platform for violations of its Terms of Service or policies.")}
          </span>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <span className="mt-2 font-medium">
            {("By selecting 'I Agree,' You confirm that You understand and agree to the terms of this Electronic Record and Signature Disclosure and consent to electronically sign the document(s) provided by the Sender through QuickCash.")}
          </span>
              <hr className="bg-[#9f9f9f] w-full my-[15px]" />
              <span className="mt-2">
                {("If You have questions about this Disclosure, contact the Sender directly. For technical support with QuickCash, visit ")}
              </span>
              <a
                href="https://quickcash.oyefin.com/"
                target="_blank"
                className="text-blue-700 cursor-pointer"
              >
                QuickCash
              </a>

              <span>{(" or email")}</span>
              <span className="font-medium"> info@itio.in </span>
          <hr className="bg-[#9f9f9f] w-full my-[15px]" />
          <div className="mt-6 flex justify-start gap-2">
            <button
              onClick={() => handleOnclick()}
              className="op-btn op-btn-primary"
            >
              {("Agree & Continue")}
            </button>
            <button
              className="op-btn op-btn-ghost"
              onClick={() => props.setIsShowAgreeTerms(false)}
            >
              {("close")}
            </button>
          </div>
        </div>
      </ModalUi>
    </div>
  );
}

export default AgreementContent;
