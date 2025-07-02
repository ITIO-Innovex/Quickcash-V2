const { CONTACT_ROLES } = require("../models/contactBooks.model");


/**

 * @param {Object} document
 * @returns {Array<Object>}
 */
const getOnlySignersFromDocument = (document) => {
    if (!document?.Signers?.length) return [];

    return document.Signers.filter((item) => [CONTACT_ROLES.Approver, CONTACT_ROLES.Signer].includes(item.UserRole));
}



module.exports = {
    getOnlySignersFromDocument
}