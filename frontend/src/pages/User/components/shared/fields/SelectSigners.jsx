import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { getBearerToken, handleUnlinkSigner } from "../../../constant/Utils";
import { API_ROUTES } from "@/pages/User/constant/apiRoutes";
import AddIcon from '@mui/icons-material/Add';

const SelectSigners = (props) => {
  const {
    signerPos,
    setSignerPos,
    signersData,
    setSignersData,
    uniqueId,
    isRemove,
    handleAddUser
  } = props;
  const [userList, setUserList] = useState([]);
  const [selected, setSelected] = useState();
  const [userData, setUserData] = useState({});
  const [isError, setIsError] = useState(false);
  const [role, setRole] = useState("Signer"); // Default to 'Signer'

  useEffect(() => {
    //condition to check already assign signer exist if yes then show signer's email on dropdown input box
    if (userList.length > 0 && props.isExistSigner) {
      const alreadyAssign = userList.find(
        (item) => item._id === props.isExistSigner.signerObjId
      );
      if (alreadyAssign) {
        setSelected({
          label: `${alreadyAssign.Name}<${alreadyAssign.Email}>`,
          value: alreadyAssign._id
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList]);
  // `handleOptions` is used to set just save from quick form to selected option in dropdown
  const handleOptions = (item) => {
    //checking if user select no signer option from dropdown
    if (item) {
      //checking selected signer is already assign to the document or not
      const alreadyAssign = signersData.some(
        (item2) => item2._id === item.value
      );
      if (alreadyAssign) {
        alert(("already-exist-signer"));
        setSelected("");
      } else {
        setSelected(item);
        const userData = userList.find((x) => x._id === item.value);
        if (userData) {
          setUserData(userData);
        }
      }
    } else {
      setSelected(item);
    }
  };
  const handleAdd = () => {
    if (userData && userData._id) {
      handleAddUser({ ...userData, UserRole: role });
      if (props.closePopup) {
        props.closePopup();
      }
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 1000);
    }
  };
  //function to use remove signer from assigned widgets in create template flow
  const handleRemove = () => {
    handleUnlinkSigner(
      signerPos,
      setSignerPos,
      signersData,
      setSignersData,
      uniqueId
    );
    if (props.closePopup) {
      props.closePopup();
    }
  };
  const loadOptions = async (inputValue) => {
    try {
      const { data } = await axios.get(API_ROUTES.GET_SIGNERS, {
        headers: { Authorization: getBearerToken() },
      });
      setUserList(data);
      return await data.map((item) => ({
        label: `${item.Name}<${item.Email}>`,
        value: item._id
      }));
    } catch (error) {
      console.log("err", error);
    }
  };
  return (
    <div className="h-full px-[20px] py-[10px] text-base-content">
      <div className="w-full mx-auto p-[8px]">
        <div className="mb-0">
          <label className="text-[14px] font-bold">
            {("Choose from contacts")}
          </label>
          <div className="flex gap-2 ">
            <div className="flex-1">
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={selected}
                loadingMessage={() => ("loading")}
                noOptionsMessage={() => ("contact-not-found")}
                loadOptions={loadOptions}
                onChange={handleOptions}
                unstyled
                onFocus={() => loadOptions()}
                classNames={{
                  control: () =>
                    "op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]",
                  valueContainer: () =>
                    "flex flex-row gap-x-[2px] gap-y-[2px] md:gap-y-0 w-full my-[2px]",
                  multiValue: () =>
                    "op-badge op-badge-primary h-full text-[11px]",
                  multiValueLabel: () => "mb-[2px]",
                  menu: () =>
                    "mt-1 shadow-md rounded-lg bg-base-200 text-base-content absolute z-9999",
                  menuList: () => "shadow-md rounded-lg  ",
                  option: () =>
                    "bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2 ",
                  noOptionsMessage: () => "p-2 bg-base-200 rounded-lg m-1 p-2"
                }}
                menuPortalTarget={document.getElementById("selectSignerModal")}
              />
            </div>
            {!props.isContact && (
              <button
                onClick={() => props.setIsContact(true)}
                className="op-btn op-btn-accent  op-btn-outline op-btn-sm  "
              >
                <AddIcon/>
              </button>
            )}
          </div>
        </div>
        {/* New dropdown for role selection */}
        <div className="mt-4">
          <label className="text-[14px] font-bold mb-1 block">Role</label>
          <select
            className="op-input op-input-bordered op-input-sm w-full text-[11px]"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="Approver">Approver</option>
            <option value="Signer">Signer</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <p
          className={`${isError ? "text-[red]" : "text-transparent"} text-[11px] ml-[6px] my-[2px]`}
        >
          {("Select Signner")}
        </p>
        <div className="flex gap-2">
          <button className="op-btn op-btn-primary" onClick={() => handleAdd()}>
            {("submit")}
          </button>
          {props.isExistSigner && isRemove && (
            <button
              className="op-btn op-btn-accent op-btn-outline"
              onClick={() => handleRemove()}
            >
              {("no-signer")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectSigners;