import React, { useRef, useState } from "react";
import PrevNext from "./PrevNext";
import {
  base64ToArrayBuffer,
  deletePdfPage,
  handleDownloadCertificate,
  handleDownloadPdf,
  handleRemoveWidgets,
  handleToPrint
} from "../../constant/Utils.jsx";
import "../../styles/signature.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ModalUi from "../../primitives/ModalUi";
import Loader from "../../primitives/Loader";
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import DownloadIcon from '@mui/icons-material/Download';

import { PDFDocument } from "pdf-lib";
import { maxFileSize } from "../../constant/const";

function Header(props) {
  
  const filterPrefill =
    props?.signerPos &&
    props?.signerPos?.filter((data) => data.Role !== "prefill");
  const isMobile = window.innerWidth < 767;
  const [isDownloading, setIsDownloading] = useState("");
  const [isDeletePage, setIsDeletePage] = useState(false);
  const mergePdfInputRef = useRef(null);
  const enabledBackBtn = props?.disabledBackBtn === true ? false : true;
  //function for show decline alert
  const handleDeclinePdfAlert = async () => {
    if (props?.handleDecline) {
      props.handleDecline();
    } else {
      const currentDecline = { currnt: "Sure", isDeclined: true };
      props?.setIsDecline(currentDecline);
    }
  };
  const handleDetelePage = async () => {
    props?.setIsUploadPdf && props?.setIsUploadPdf(true);
    const pdfupdatedData = await deletePdfPage(
      props?.pdfArrayBuffer,
      props?.pageNumber
    );
    if (pdfupdatedData?.totalPages === 1) {
      alert(("delete-alert"));
    } else {
      props?.setPdfBase64Url(pdfupdatedData.base64);
      props?.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
      setIsDeletePage(false);
      handleRemoveWidgets(
        props?.setSignerPos,
        props?.signerPos,
        props?.pageNumber
      );
    }
  };

  // `removeFile` is used to  remove file if exists
  const removeFile = (e) => {
    if (e) {
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please upload a valid PDF file.");
      return;
    }
    if (!file.type.includes("pdf")) {
      alert("Only PDF files are allowed.");
      return;
    }

    const mb = Math.round(file?.size / Math.pow(1024, 2));
    if (mb > maxFileSize) {
      alert(`${("file-alert-1")} ${maxFileSize} MB`);
      removeFile(e);
      return;
    }
    try {
      const uploadedPdfBytes = await file.arrayBuffer();
      const uploadedPdfDoc = await PDFDocument.load(uploadedPdfBytes, {
        ignoreEncryption: true
      });
      const basePdfDoc = await PDFDocument.load(props.pdfArrayBuffer);

      // Copy pages from the uploaded PDF to the base PDF
      const uploadedPdfPages = await basePdfDoc.copyPages(
        uploadedPdfDoc,
        uploadedPdfDoc.getPageIndices()
      );
      uploadedPdfPages.forEach((page) => basePdfDoc.addPage(page));
      // Save the updated PDF
      const pdfBase64 = await basePdfDoc.saveAsBase64({
        useObjectStreams: false
      });
      const pdfBuffer = base64ToArrayBuffer(pdfBase64);
      props.setPdfArrayBuffer(pdfBuffer);
      props.setPdfBase64Url(pdfBase64);
      props.setIsUploadPdf && props.setIsUploadPdf(true);
      mergePdfInputRef.current.value = "";
    } catch (error) {
      mergePdfInputRef.current.value = "";
      console.error("Error merging PDF:", error);
    }
  };
  return (
    <div className="flex py-[5px]">
      {isMobile && props?.isShowHeader ? (
        <div
          id="navbar"
          className="stickyHead"
          style={{
            width: window.innerWidth + "px"
          }}
        >
          <div className="flex justify-between items-center py-[5px] pl-[10px] ">
            <div onClick={() => window.history.go(-2)}>
              <i
                className="fa-light fa-arrow-left text-base-content"
                aria-hidden="true"
              ></i>
            </div>
            <PrevNext
              pageNumber={props?.pageNumber}
              allPages={props?.allPages}
              changePage={props?.changePage}
            />
            {props?.isCompleted || props?.alreadySign ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <div className="op-link op-link-primary no-underline text-[16px] font-semibold px-3">
                    <i
                      className="fa-light fa-ellipsis-v"
                      aria-hidden="true"
                    ></i>
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={() => {
                        if (props?.isCompleted) {
                          props?.setIsDownloadModal(true);
                        } else {
                          handleDownloadPdf(
                            props?.pdfDetails,
                            setIsDownloading,
                            props.pdfBase64
                          );
                        }
                      }}
                    >
                      <div className="flex flex-row">
                        <i
                          className="fa-light fa-arrow-down mr-[3px]"
                          aria-hidden="true"
                        ></i>
                        {("Download")}
                      </div>
                    </DropdownMenu.Item>
                    {props?.isCompleted && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() =>
                          handleDownloadCertificate(
                            props?.pdfDetails,
                            setIsDownloading
                          )
                        }
                      >
                        <div className="border-none bg-[#fff]">
                       <MilitaryTechIcon />
                          {("Certificate")}
                        </div>
                      </DropdownMenu.Item>
                    )}
                    {props?.isSignYourself && (
                      <DropdownMenu.Item
                        className="DropdownMenuItem"
                        onClick={() => props?.setIsEmail(true)}
                      >
                        <div className="flex flex-row">
                          <i
                            className="fa-light fa-envelope mr-[3px]"
                            aria-hidden="true"
                          ></i>
                          {("Mail")}
                        </div>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      className="DropdownMenuItem"
                      onClick={(e) =>
                        handleToPrint(e, setIsDownloading, props?.pdfDetails)
                      }
                    >
                      <div className="flex flex-row">
                      <PrintIcon />
                        {("Print")}
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex justify-around items-center">
                {/* current signer is checking user send request and check status of pdf sign than if current 
                user exist than show finish button else no
                */}
                {props?.currentSigner && (
                  <div className="flex items-center" data-tut="reactourFifth">
                    {props?.decline && (
                      <div
                        onClick={() => handleDeclinePdfAlert()}
                        className="text-[red] border-none font-[650] text-[14px] mr-2"
                      >
                        {("Decline")}
                      </div>
                    )}
                    {props?.isPlaceholder ? (
                      <div
                        onClick={() => {
                          if (!props?.isMailSend) {
                            props?.alertSendEmail();
                          }
                        }}
                        className={`${
                          props?.isMailSend ? "" : "op-link-primary"
                        } op-link no-underline font-[650] text-[14px]`}
                        data-tut="headerArea"
                      >
                        {props?.completeBtnTitle
                          ? props?.completeBtnTitle
                          : ("Send")}
                      </div>
                    ) : (
                      <div
                        data-tut="reactourThird"
                        onClick={() => props?.embedWidgetsData()}
                        className="border-none font-[650] text-[14px] op-link op-link-primary no-underline"
                      >
                        {("finish")}
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      ref={mergePdfInputRef}
                      onChange={handleFileUpload}
                    />
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <div className="font-[650] text-[18px] px-3  text-base-content no-underline">
                          <i
                            className="fa-light fa-ellipsis-v"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="bg-white shadow-md rounded-md px-3 py-2"
                          sideOffset={5}
                        >
                          {props?.setIsEditTemplate && (
                            <DropdownMenu.Item
                              className="DropdownMenuItem"
                              onClick={() => props?.setIsEditTemplate(true)}
                            >
                              <div className="flex flex-row">
                                <i
                                  className="fa-light fa-gear mr-[3px]"
                                  aria-hidden="true"
                                ></i>
                                <span className="font-[500]">{("Edit")}</span>
                              </div>
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() =>
                              handleDownloadPdf(
                                props?.pdfDetails,
                                setIsDownloading,
                                props.pdfBase64
                              )
                            }
                          >
                            <div className="flex flex-row">
                              <i
                                className="fa-light fa-arrow-down mr-[3px]"
                                aria-hidden="true"
                              ></i>
                              <span className="font-[500]">
                                {("Download")}
                              </span>
                            </div>
                          </DropdownMenu.Item>
                          {!props?.isDisablePdfEditTools && (
                            <>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => mergePdfInputRef.current.click()}
                              >
                                <div className="flex flex-row">
                               <AddIcon />
                                  <span className="font-[500]">
                                    {("add-pages")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => setIsDeletePage(true)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-trash text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {("delete-page")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>

                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => props?.handleRotationFun(90)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-rotate-right text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {("rotate-right")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="DropdownMenuItem"
                                onClick={() => props?.handleRotationFun(-90)}
                              >
                                <div className="flex flex-row">
                                  <i className="fa-light fa-rotate-left text-gray-500 2xl:text-[30px] mr-[3px]"></i>
                                  <span className="font-[500]">
                                    {("rotate-left")}
                                  </span>
                                </div>
                              </DropdownMenu.Item>
                            </>
                          )}

                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => props?.clickOnZoomIn()}
                          >
                            <div className="flex flex-row">
                              <ZoomInIcon/>
                              <span className="font-[500]">{("zoom-in")}</span>
                            </div>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="DropdownMenuItem"
                            onClick={() => props?.clickOnZoomOut()}
                          >
                            <div className="flex flex-row">
                              <ZoomOutIcon/>
                              <span className="font-[500]">
                                {("zoom-out")}
                              </span>
                            </div>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
                {props?.isPublicTemplate && (
                  <div
                    data-tut="reactourThird"
                    onClick={() => props?.embedWidgetsData()}
                    className="border-none font-[650] text-[14px] pr-2 op-link op-link-primary no-underline"
                  >
                    {("sign-now")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-between items-center w-full gap-y-1 ml-1">
          <PrevNext
            pageNumber={props?.pageNumber}
            allPages={props?.allPages}
            changePage={props?.changePage}
          />
          {props?.isPlaceholder ? (
            <>
              <div className="flex mx-[100px] lg:mx-0 order-last lg:order-none">
                {!props?.isMailSend &&
                  props?.signersdata.length > 0 &&
                  props?.signersdata.length !== filterPrefill.length && (
                    <div>
                      {filterPrefill.length === 0 ? (
                        <span className="text-[13px] text-[#f5405e]">
                          {("add")}{" "}
                          {props?.signersdata.length - filterPrefill.length}{" "}
                          {("recipients")} {("widgets-name.signature")}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#f5405e]">
                          {("add")}{" "}
                          {props?.signersdata.length - filterPrefill.length}{" "}
                          {("more")}
                          {("recipients")} {("widgets-name.signature")}
                        </span>
                      )}
                    </div>
                  )}
              </div>
              <div className="flex">
                {props?.setIsEditTemplate && (
                  <button
                    onClick={() => props?.setIsEditTemplate(true)}
                    className="outline-none border-none text-center mr-[3px]"
                  >
                    <i className="fa-light fa-gear fa-lg"></i>
                  </button>
                )}
                {enabledBackBtn && (
                  <button
                    onClick={() => window.history.go(-2)}
                    type="button"
                    className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                  >
                    {("Back")}
                  </button>
                )}
                <button
                  disabled={props?.isMailSend && true}
                  data-tut="headerArea"
                  className="op-btn op-btn-primary op-btn-sm mr-[3px]"
                  onClick={() => props?.alertSendEmail()}
                >
                  {props?.completeBtnTitle
                    ? props?.completeBtnTitle
                    : props?.isMailSend
                      ? ("sent")
                      : ("send")}
                </button>
              </div>
            </>
          ) : props?.isPdfRequestFiles || props?.isSelfSign ? (
            props?.alreadySign || (props?.isSelfSign && props?.isCompleted) ? (
              <div className="flex flex-row">
                <button
                  onClick={(e) =>
                    handleToPrint(e, setIsDownloading, props?.pdfDetails)
                  }
                  type="button"
                  className="op-btn op-btn-neutral op-btn-sm mr-[3px] shadow"
                >
                  <PrintIcon />
                  <span className="hidden lg:block">{("Print")}</span>
                </button>
                {props?.isCompleted && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadCertificate(
                        props?.pdfDetails,
                        setIsDownloading
                      )
                    }
                    className="op-btn op-btn-secondary op-btn-sm mr-[3px] shadow"
                  >
                   <MilitaryTechIcon/>
                    <span className="hidden lg:block">{("Certificate")}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="op-btn op-btn-primary op-btn-sm mr-[3px] shadow"
                  onClick={() => {
                    if (props?.isCompleted) {
                      props?.setIsDownloadModal(true);
                    } else {
                      handleDownloadPdf(
                        props?.pdfDetails,
                        setIsDownloading,
                        props.pdfBase64
                      );
                    }
                  }}
                >
                  <DownloadIcon/>
                  <span className="hidden lg:block">{("Download")}</span>
                </button>
              </div>
            ) : (
              <div className="flex" data-tut="reactourFifth">
                {props?.currentSigner && (
                  <>
                    {props?.templateId && (
                      <button
                        onClick={() =>
                          handleDownloadPdf(
                            props?.pdfDetails,
                            setIsDownloading,
                            props.pdfBase64
                          )
                        }
                        type="button"
                        className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                      >
                        <span className="hidden lg:block">{("Download")}</span>
                      </button>
                    )}
                    {!props?.isSelfSign && (
                      <button
                        className="op-btn op-btn-secondary op-btn-sm mr-[3px] shadow"
                        onClick={() => handleDeclinePdfAlert()}
                      >
                        {("decline")}
                      </button>
                    )}
                    {!props?.templateId && (
                      <button
                        type="button"
                        className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
                        onClick={() =>
                          handleDownloadPdf(
                            props?.pdfDetails,
                            setIsDownloading,
                            props.pdfBase64
                          )
                        }
                      >
                        <i className="fa-light fa-arrow-down font-semibold lg:hidden"></i>
                        <span className="hidden lg:block">{("Download")}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm mr-[3px] shadow"
                      onClick={() => props?.embedWidgetsData()}
                    >
                      {("finish")}
                    </button>
                  </>
                )}
              </div>
            )
          ) : props?.isCompleted ? (
            <div className="flex flex-row">
              {props?.isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadCertificate(
                      props?.pdfDetails,
                      setIsDownloading
                    )
                  }
                  className="op-btn op-btn-secondary op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                >
                  <MilitaryTechIcon/>
                </button>
              )}
              <button
                onClick={(e) =>
                  handleToPrint(e, setIsDownloading, props?.pdfDetails)
                }
                type="button"
                className="op-btn op-btn-neutral op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
              >
                <PrintIcon />
                <span className="hidden lg:block ml-1">{("Print")}</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() => props?.setIsDownloadModal(true)}
              >
                <DownloadIcon/>
                <span className="hidden lg:block ml-1">{("Download")}</span>
              </button>
              <button
                type="button"
                className="op-btn op-btn-info op-btn-sm gap-0 font-medium text-[12px] mr-[3px] shadow"
                onClick={() => props?.setIsEmail(true)}
              >
                <i className="fa-light fa-envelope" aria-hidden="true"></i>
                <span className="hidden lg:block ml-1">{("mail")}</span>
              </button>
            </div>
          ) : props?.isPublicTemplate ? (
            <div className="flex">
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm  shadow"
                onClick={() => props?.embedWidgetsData()}
              >
                {("sign-now")}
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                onClick={() => window.history.go(-2)}
                type="button"
                className="op-btn op-btn-ghost op-btn-sm mr-[3px]"
              >
                {("back")}
              </button>
              <button
                type="button"
                className="op-btn op-btn-primary op-btn-sm mr-[3px]"
                onClick={() => props?.embedWidgetsData()}
              >
                {("finish")}
              </button>
            </div>
          )}
        </div>
      )}
      {isDownloading === "pdf" && (
        <div className="fixed z-[200] inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <ModalUi
        isOpen={
          isDownloading === "certificate" || isDownloading === "certificate_err"
        }
        title={
          isDownloading === "certificate" || isDownloading === "certificate_err"
            ? ("Generating certificate")
            : ("pdf-download")
        }
        handleClose={() => setIsDownloading("")}
      >
        <div className="p-3 md:p-5 text-[13px] md:text-base text-center text-base-content">
          {isDownloading === "certificate" ? (
            <p>{("Your completion certificate is being generated. Please wait momentarily. If the download doesn't start shortly, click the button again")}</p>
          ) : (
            <p>{("We are currently experiencing an issue with certificate generation. Please try again later.")}</p>
          )}
        </div>
      </ModalUi>
      <ModalUi
        isOpen={isDeletePage}
        title={("delete-page")}
        handleClose={() => setIsDeletePage(false)}
      >
        <div className="h-[100%] p-[20px]">
          <p className="font-medium">{("Are you sure you want to delete this page?")}</p>
          <p className="pt-3">{("Note: Once you delete this page, you cannot undo.")}</p>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <button
            onClick={() => handleDetelePage()}
            type="button"
            className="op-btn op-btn-primary"
          >
            {("yes")}
          </button>
          <button
            onClick={() => setIsDeletePage(false)}
            type="button"
            className="op-btn op-btn-ghost"
          >
            {("no")}
          </button>
        </div>
      </ModalUi>
    </div>
  );
}

export default Header;
