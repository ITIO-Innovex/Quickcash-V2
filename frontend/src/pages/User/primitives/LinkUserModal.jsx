import React, { useEffect, useState } from "react";
import SelectSigners from "../components/shared/fields/SelectSigners";
import AddContact from "./AddContact";
import ModalUi from "./ModalUi";

const LinkUserModal = (props) => {
  const [isContact, setIsContact] = useState(false);
  const [isExistSigner, setIsExistSIgner] = useState(false);

  useEffect(() => {
    console.log('props', props)
    if (props.uniqueId) {
      const isExistSigner = props.signerPos.find(
        (x) => x.Id === props.uniqueId && x.signerObjId
      );
      setIsExistSIgner(isExistSigner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.signerPos]);
  return (
    <ModalUi
      title={isExistSigner ? ("Add Recipients") : ("add/choose-signer")}
      isOpen={true}
      handleClose={props.closePopup}
    >
      <SelectSigners
        {...props}
        closePopup={props.closePopup}
        isContact={isContact}
        setIsContact={setIsContact}
        isExistSigner={isExistSigner}
      />
      {isContact && (
        <>
          <div className="op-divider text-base-content mx-[25%] my-1">
            {("or")}
          </div>
          <AddContact
            details={props.handleAddUser}
            closePopup={props.closePopup}
          />
        </>
      )}
    </ModalUi>
  );
};

export default LinkUserModal;
