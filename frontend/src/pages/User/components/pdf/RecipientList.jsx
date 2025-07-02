import React, { useRef, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  color,
  darkenColor,
  getFirstLetter,
  isMobile,
  nameColor,
} from '../../constant/Utils.jsx';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import dragIcon from '../../../../assets/drag.png';
import Tooltip from '@mui/material/Tooltip';
// const cursor =
//   "cursor-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAASElEQVR4nGNgwAMkJSUbpKSkOvCpIaT5PxSTbogUQjMYMwxeIIXmVFIxA8UGDDyQGg0DnIDi6JKUlCxHMqCeZAOghjSAMD5FAKfeaURdUFxCAAAAAElFTkSuQmCC'),_pointer]";
const RecipientList = (props) => {
  const [animationParent] = useAutoAnimate();
  const [isHover, setIsHover] = useState();
  const [isEdit, setIsEdit] = useState(false);
  //function for onhover signer name change background color
  const inputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverIndex, setPopoverIndex] = useState(null);
  // Add state to track selected roles by recipient Id
  const [selectedRoles, setSelectedRoles] = useState(() => {
    if (props?.signersdata?.length) {
      return props.signersdata.filter((item) => item.UserRole !== 'contracts_Guest').reduce(
        (acc, item) => ({
          ...acc,
          [item.Id]: item.UserRole
        }),
        {}
      )
    }

    return {};
  });

  const isWidgetExist = (Id) => {
    return props.signerPos.some((x) => x.Id === Id && x.placeHolder);
  };

  //handle drag start
  const handleDragStart = (e, id) => {
    // `e.dataTransfer.setData('text/plain')`is used to set the data to be transferred during a drag operation.
    // The first argument specifies the type of data being set, and the second argument is the actual data you want to transfer.
    e.dataTransfer.setData('text/plain', id);
  };

  //handleDragOver prevents the default behavior of the dragover event, which is necessary for the drop event to be triggered.
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  //handle draggable element drop and also used in mobile view on up and down key to chnage sequence of recipient's list
  const handleChangeSequence = (e, ind, isUp, isDown, obj) => {
    e.preventDefault();
    let draggedItemId;
    let index = ind;

    //if isUp true then set item's id and index in mobile view
    if (isUp) {
      draggedItemId = index;
      index = index - 1;
    }
    //if isDown true then set item's id and index in mobile view
    else if (isDown) {
      draggedItemId = index;
      index = index + 1;
    } //else set id on drag element in desktop viiew
    else {
      //`e.dataTransfer.getData('text/plain')` is used to get data that you have saved.
      draggedItemId = e.dataTransfer.getData('text/plain');
    }

    //convert string to number
    const intDragId = parseInt(draggedItemId);
    //get that item to change position
    const draggedItem = props.signersdata.filter((_, ind) => ind === intDragId);
    const remainingItems = props.signersdata.filter(
      (_, ind) => ind !== intDragId
    );
    //splice method is used to replace or add new value in array at specific index
    remainingItems.splice(index, 0, ...draggedItem);
    //set current draggable recipient details,objectId,index,contract_className ... after replace recipient list
    props?.setSignersData(remainingItems);
    props?.setIsSelectId(index);
    props?.setUniqueId(remainingItems[index]?.Id);
    props?.setRoleName(remainingItems[index]?.Role);
    props?.setBlockColor(obj.blockColor);
    //change order of placeholder's list using sorting method
    //`remainingItems` is correct order of signers after change order
    const changeOrderSignerList = props?.signerPos.sort((a, b) => {
      //`indexA` and `indexB` is to get element position using index in correct order array
      const indexA = remainingItems.findIndex((item) => item.Id === a.Id);
      const indexB = remainingItems.findIndex((item) => item.Id === b.Id);
      //and then compare `indexA - indexB` value
      //if positive it means indexB element comes before indexA then need to sorting
      //if negative it means indexA element is on correct position do not need to sorting
      return indexA - indexB;
    });
    props?.setSignerPos(changeOrderSignerList);
  };

  // Handler for selecting a role
  const handleRoleSelect = (role, id, documentId) => {
    setSelectedRoles((prev) => ({ ...prev, [id]: role }));
    if (props.handleRoleSelect) props.handleRoleSelect(role, id, documentId);
    setPopoverIndex(null);
  };

  return (
    <>
      {props.signersdata.length > 0 &&
        props.signersdata.map((obj, ind) => {
          return (
            <div
              ref={animationParent}
              key={ind}
              draggable={props.sendInOrder && !isMobile ? true : false}
              onDragStart={(e) =>
                props.sendInOrder && !isMobile && handleDragStart(e, ind)
              }
              onDragOver={(e) =>
                props.sendInOrder && !isMobile && handleDragOver(e)
              }
              onDrop={(e) =>
                props.sendInOrder &&
                !isMobile &&
                handleChangeSequence(e, ind, null, null, obj)
              }
              data-tut="recipientArea"
              onMouseEnter={() => setIsHover(ind)}
              onMouseLeave={() => setIsHover(null)}
              className={`${props.sendInOrder
                ? props.isMailSend
                  ? 'pointer-events-none bg-opacity-80'
                  : `text-[12px] font-bold`
                : props.isMailSend && 'pointer-events-none bg-opacity-80'
                } flex flex-row rounded-xl px-2 py-[10px] mt-1 mx-1 items-center last:mb-0.5`}
              style={{
                background:
                  (!isMobile && isHover === ind) || props.uniqueId === obj.Id
                    ? obj?.blockColor
                      ? obj?.blockColor
                      : color[ind % color.length]
                    : 'transparent',
              }}
              onClick={(e) => {
                e.preventDefault();
                props.setIsSelectId(ind);
                props.setUniqueId(obj.Id);
                props.setRoleName(obj.Role);
                props.setBlockColor(obj?.blockColor);
                if (props.handleModal) {
                  props.handleModal();
                }
              }}
            >
              <div className="flex flex-row items-center w-full">
                <div
                  className="flex w-[30px] h-[30px] rounded-full items-center justify-center mr-2"
                  style={{
                    background: obj?.blockColor
                      ? darkenColor(obj?.blockColor, 0.4)
                      : nameColor[ind % nameColor.length],
                  }}
                >
                  <span className="text-white uppercase font-bold text-center text-[12px]">
                    {isWidgetExist(obj.Id) ? (
                      <i className="fa-light fa-check"></i>
                    ) : (
                      <>
                        {obj.Name
                          ? getFirstLetter(obj.Name)
                          : getFirstLetter(obj.Role)}
                      </>
                    )}
                  </span>
                </div>
                <div className={`${obj.Name ? 'flex-col' : 'flex-row'} flex`}>
                  {obj.Name ? (
                    <span
                      className={`${(!isMobile && isHover === ind) ||
                        props.isSelectListId === ind
                        ? 'text-[#424242]'
                        : 'text-base-content'
                        } text-[12px] font-bold w-[100px] whitespace-nowrap overflow-hidden text-ellipsis`}
                    >
                      {obj.Name}
                    </span>
                  ) : (
                    <span
                      className={`${(!isMobile && isHover === ind) ||
                        props.isSelectListId === ind
                        ? 'text-[#424242]'
                        : 'text-base-content'
                        } text-[12px] font-bold w-[100px] whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer`}
                      onClick={() => {
                        setIsEdit({ [obj.Id]: true });
                        props.setRoleName(obj.Role);
                      }}
                    >
                      {isEdit?.[obj.Id] && props.handleRoleChange ? (
                        <input
                          ref={inputRef}
                          className="bg-transparent p-[3px]"
                          value={obj.Role}
                          onChange={(e) => props.handleRoleChange(e, obj.Id)}
                          onBlur={() => {
                            setIsEdit({});
                            props.handleOnBlur(obj.Role, obj.Id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              inputRef.current.blur();
                            }
                          }}
                        />
                      ) : (
                        <span className="text-[13px] 2xl:text-[17px]">
                          {obj.Role}
                        </span>
                      )}
                    </span>
                  )}
                  {obj.Name && (
                    <span
                      className={` ${(!isMobile && isHover === ind) ||
                        props.isSelectListId === ind
                        ? 'text-[#424242]'
                        : 'text-base-content'
                        } text-[10px] font-medium w-[100px] whitespace-nowrap overflow-hidden text-ellipsis`}
                    >
                      {obj?.Role || obj?.Email}
                    </span>
                  )}
                  {/* Show UserRole below email/name if present */}
                  {obj.UserRole && (
                    <span className="block text-left text-[11px] font-semibold mt-1 capitalize">
                      {obj.UserRole}
                    </span>
                  )}
                  {/* Show selected role below email/name if present (legacy, can be removed if not needed) */}
                  {selectedRoles[obj.Id] && !obj.UserRole && (
                    <span className="block text-left text-[11px] font-semibold mt-1 capitalize">
                      {selectedRoles[obj.Id]}
                    </span>
                  )}
                </div>
              </div>
              {isMobile && props.sendInOrder && (
                <div className="flex flex-row items-center gap-[5px] mr-2">
                  <div
                    onClick={(e) => {
                      if (ind !== 0) {
                        e.stopPropagation();
                        handleChangeSequence(e, ind, 'up', null, obj);
                      }
                    }}
                    className={ind === 0 ? 'text-[gray]' : 'text-black'}
                  >
                    ▲
                  </div>
                  <div
                    onClick={(e) => {
                      if (ind !== props.signersdata.length - 1) {
                        e.stopPropagation();
                        handleChangeSequence(e, ind, null, 'down', obj);
                      }
                    }}
                    className={
                      ind === props.signersdata.length - 1
                        ? 'text-[gray]'
                        : 'text-black'
                    }
                  >
                    ▼
                  </div>
                </div>
              )}
              {/* Role icon and popover */}
              <div>
                <Tooltip title="Change Role" arrow>
                  <PersonIcon
                    className="cursor-pointer mr-2"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setPopoverIndex(ind);
                    }}
                  />
                </Tooltip>
                <Popover
                  open={popoverIndex === ind}
                  anchorEl={anchorEl}
                  onClose={() => setPopoverIndex(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  PaperProps={{
                    style: { padding: 8 },
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <Button
                      size="small"
                      onClick={() => handleRoleSelect('approver', obj.Id, obj._id)}
                    >
                      Approver
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleRoleSelect('signer', obj.Id, obj._id)}
                    >
                      Signer
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleRoleSelect('viewer', obj.Id, obj._id)}
                    >
                      Viewer
                    </Button>
                  </div>
                </Popover>
              </div>
              {/* drag image */}
              {props.sendInOrder && !isMobile && (
                <Tooltip title="Drag to change the order" arrow>
                  <img
                    src={dragIcon}
                    alt="Drag"
                    className="w-6 h-6 mr-2 cursor-move select-none"
                    draggable={false}
                    style={{ userSelect: 'none' }}
                  />
                </Tooltip>
              )}
              {/* delete button */}
              {props.handleDeleteUser && (
                <Tooltip title="Delete Signer" arrow>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      props.handleDeleteUser(obj.Id);
                    }}
                    className={`$${(!isMobile && isHover === ind) ||
                      props.isSelectListId === ind
                      ? 'text-[#424242]'
                      : 'text-base-content'
                      } cursor-pointer`}
                  >
                    <DeleteOutlineIcon />
                  </div>
                </Tooltip>
              )}
              <hr />
            </div>
          );
        })}
    </>
  );
};

export default RecipientList;
