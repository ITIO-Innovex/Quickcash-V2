import React from "react";
import { getWidgetType, isMobile } from "../../constant/Utils.jsx";


function WidgetList(props) {

  return props.updateWidgets.map((item, ind) => {
    return (
      <div className="2xl:p-1 mb-[5px]" key={ind}>
        <div
          data-tut="isSignatureWidget"
          className="select-none mx-[2px] md:mx-0 cursor-all-scroll"
          onClick={() => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => !isMobile && item.ref(element)}
          onMouseMove={(e) => !isMobile && props?.handleDivClick(e)}
          onMouseDown={() => !isMobile && props?.handleMouseLeave()}
          onTouchStart={(e) => !isMobile && props?.handleDivClick(e)}
        >
          <div style={{ textTransform: 'capitalize' }}>{item.ref && getWidgetType(item, (`${item.type}`))}</div>
        </div>
      </div>
    );
  });
}

export default WidgetList;
