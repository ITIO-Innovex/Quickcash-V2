const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');

/**
 * Flattens a PDF document from base64 string
 * @param {string} base64String - Base64 encoded PDF
 * @returns {Promise<Buffer>} - Flattened PDF buffer
 */
async function flattenPdf(base64String) {
  try {
    const pdfBytes = Buffer.from(base64String, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const flattenedPdfBytes = await pdfDoc.save();
    return flattenedPdfBytes;
  } catch (error) {
    throw new Error('Error flattening PDF: ' + error.message);
  }
}

/**
 * Generates a secure URL for the file
 * @param {string} url - Original file URL
 * @returns {Object} - Object containing secure URL
 */
function getSecureUrl(url) {
  // Add your URL security logic here
  // This is a placeholder implementation
  // const secureUrl = 'http://localhost:5000' + url;
  const secureUrl = 'https://quickcash.oyefin.com/api/v1' + url;
  return { url: secureUrl };
}

module.exports = {
  flattenPdf,
  getSecureUrl
}; 