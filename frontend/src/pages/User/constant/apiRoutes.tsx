// const BASE_URL = 'http://localhost:5000';
const BASE_URL = 'https://quickcash.oyefin.com';

const getURL = (url: string): string => {
  return BASE_URL + '/api/v1/digital-signature' + url;
};

export const API_ROUTES = {
  SAVE_FILE: getURL('/files/save'),
  AFTER_SAVE_DOCUMENT: getURL('/documents/after-save'),
  GET_DOCUMENT: (id: string) => getURL(`/documents/${id}`),
  GET_USER_DETAILS: BASE_URL + '/api/v1/user/get-user-details',
  SAVE_PDF: getURL('/documents/save-pdf'),
  FORWARD_DOC: getURL('/documents/forward-doc'),
  REGISTER: getURL('/auth/register'),
  SIGNATURE: getURL('/signatures'),
  GET_SIGNERS: getURL('/contacts/list'),
  ADD_CONTACTS: getURL('/contacts/add'),
  GET_CONTACT: (contactId: string) => getURL(`/contacts/details/${contactId}`),
  UPDATE_DOCUMENT: (id: string) => getURL(`/documents/update-document/${id}`),
  SEND_MAIL: getURL('/documents/send-mail'),
  DECLINE_DOCUMENT: getURL('/documents/decline-document'),
  UPDATE_DOCUMENT_VIEWED: getURL('/documents/view-document'),
  GET_REPORT_LISTING: getURL('/documents/get-report'),
  UPDATE_USER_ROLES: getURL('/documents/update-signer-role'),
  PDF_BASE64: BASE_URL + '/pdf-base64',
  PDF_BUFFER: BASE_URL + '/pdf-buffer'
};
