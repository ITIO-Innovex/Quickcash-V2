import React from "react";
import ModalUi from "../primitives/ModalUi";


function RotateAlert(props) {
  
  return (
    <ModalUi
      isOpen={props.showRotateAlert}
      title={("Rotation-alert")}
      handleClose={() => props.setShowRotateAlert({ status: false, degree: 0 })}
    >
      <div className="p-[20px] h-full">
        <p>{("rotate-alert-mssg")}</p>
        <div className="h-[1px]  w-full my-[15px] bg-[#9f9f9f]"></div>
        <div className="flex gap-1">
          <button
            onClick={() => props.handleRemoveWidgets()}
            type="button"
            className="op-btn op-btn-primary"
          >
            {("yes")}
          </button>
          <button
            onClick={() =>
              props.setShowRotateAlert({ status: false, degree: 0 })
            }
            type="button"
            className="op-btn op-btn-ghost shadow-md"
          >
            {("no")}
          </button>
        </div>
      </div>
    </ModalUi>
  );
}

export default RotateAlert;
