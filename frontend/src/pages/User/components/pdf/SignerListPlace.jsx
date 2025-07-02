import React from "react";
import RecipientList from "./RecipientList";
import { Tooltip } from "react-tooltip";
import AddIcon from '@mui/icons-material/Add';


function SignerListPlace(props) {
  
  return (
    <div>
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        <span className="relative">
          {props.title ? props.title : "Recipients"}
          <span className="absolute text-xs z-[30] mt-1 ml-0.5">
            {props?.title === "Roles" && (
              <>
                <a data-tooltip-id="my-tooltip">
                  <sup>
                    <i className="fa-light fa-question rounded-full border-[1px] border-base-content text-[11px] py-[1px] px-[3px]"></i>
                  </sup>
                </a>
                <Tooltip id="my-tooltip" className="z-[100]">
                  <div className="max-w-[450px] 2xl:max-w-[500px] p-[1px]">
                    <p className="font-bold pb-[1px]">{("role-help.p1")}</p>
                    <p>{("role-help.p2")} </p>
                    <p className="font-bold">{("role-help.p3")}</p>
                    <p>{("role-help.p4")}</p>
                    <p className="font-bold">{("role-help.p5")}</p>
                    <p>{("role-help.p6")}</p>
                  </div>
                </Tooltip>
              </>
            )}
          </span>
        </span>
      </div>
      <div className="overflow-auto hide-scrollbar max-h-[180px]">
        <RecipientList {...props} />
      </div>
      <div className="mx-1">
        {props.handleAddSigner ? (
          <div
            role="button"
            data-tut="reactourAddbtn"
            disabled={props?.isMailSend ? true : false}
            className="op-btn op-btn-accent op-btn-outline w-full mt-[14px]"
            onClick={() => props.handleAddSigner()}
          >
            <i className="fa-light fa-plus"></i> {("add-role")}
          </div>
        ) : (
          <div
            role="button"
            data-tut="addRecipient"
            className="op-btn op-btn-accent op-btn-outline w-full mt-[14px]"
            disabled={props?.isMailSend ? true : false}
            onClick={() => props.setIsAddSigner(true)}
          >
            <AddIcon/>{("Add recipients")}
          </div>
        )}
      </div>
    </div>
  );
}

export default SignerListPlace;
