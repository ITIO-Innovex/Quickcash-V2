import React from "react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';


function PrevNext({ pageNumber, allPages, changePage }) {
  
  //for go to previous page
  function previousPage() {
    changePage(-1);
  }
  //for go to next page
  function nextPage() {
    changePage(1);
  }

  return (
    <div className="flex items-center">
      <button
        className="op-btn op-btn-neutral op-btn-xs md:op-btn-sm font-semibold text-xs"
        disabled={pageNumber <= 1}
        onClick={previousPage}
      >
        <span className="block">
        <ArrowBackIosIcon sx={{ fontSize: '20px' }} />
        </span>
      </button>
      <span className="text-xs text-base-content font-medium mx-2 2xl:text-[20px]">
        {pageNumber || 1} {("of")} {allPages?.totalPages || "--"}
      </span>
      <button
        className="op-btn op-btn-neutral op-btn-xs md:op-btn-sm font-semibold text-xs"
        disabled={pageNumber >= (allPages?.totalPages || 1)}
        onClick={nextPage}
      >
        <span className="block">
          <ArrowForwardIosIcon sx={{ fontSize: '20px' }}/>
        </span>
      </button>
    </div>
  );
}

export default PrevNext;
