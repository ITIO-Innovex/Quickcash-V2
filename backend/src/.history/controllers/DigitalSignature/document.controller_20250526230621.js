const { v4: uuidv4 } = require("uuid");
const Document = require("../model/document.model");
const User = require("../model/user.model");
const File = require("../model/file.model");
const { default: mongoose } = require("mongoose");
const fs = require("fs");
const path = require("path");
const { P12Signer } = require("@signpdf/signer-p12");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { Placeholder } = require("../utils/Placeholder");
const { SignPdf } = require("@signpdf/signpdf");
const { getSecureUrl } = require("../utils/fileUtils");
const { sendMail } = require("../utils/sendMail");
const GenerateCertificate = require("../utils/GenerateCertificate");
const { pdflibAddPlaceholder } = require('@signpdf/placeholder-pdf-lib');

const eSignName = "OpenSign";
const eSigncontact = "hello@opensignlabs.com";

/**
 * Handle document after-save operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleDocumentAfterSave = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { signers, name, note, url, description } = req.body;

    const record = await Document.create({
      note,
      url,
      name,
      description,
      createdBy: req.user._id,
    });

    if (signers && signers.length > 0) {
      await updateDocumentACL(record, signers);
    } else if (req.user) {
      await updateSelfDocumentACL(record, req.user);
    }

    res.json({
      success: true,
      data: record,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Error in handleDocumentAfterSave:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update document ACL with signers
 * @param {Object} document - Document object
 * @param {Array} signers - Array of signer objects
 */
const updateDocumentACL = async (document, signers) => {
  const userIds = signers.map((signer) => signer.userId);

  // Update document with signers
  document.signers = signers;

  // Set ACL
  document.acl = {
    publicRead: false,
    publicWrite: false,
    readAccess: [document.createdBy, ...userIds],
    writeAccess: [document.createdBy, ...userIds],
  };

  await document.save();
};

/**
 * Update document ACL for self
 * @param {Object} document - Document object
 * @param {Object} user - User object
 */
const updateSelfDocumentACL = async (document, user) => {
  document.acl = {
    publicRead: false,
    publicWrite: false,
    readAccess: [user._id],
    writeAccess: [user._id],
  };

  await document.save();
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document ID format",
      });
    }

    const [record] = await Document.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdUser",
        },
      },
      {
        $project: {
          _id: 1,
          Name: "$name",
          Description: "$description",
          Note: "$note",
          URL: "$url",
          IsCompleted: "$isCompleted",
          CreatedBy: { $arrayElemAt: ["$createdUser", 0] },
          CertificateUrl: "$CertificateUrl"
        },
      },
    ]);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Document retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getDocumentById:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const savePdf = async (req, res) => {
  try {
    const { documentId, pdfFile } = req.body;
    const randomNumber = Math.floor(Math.random() * 5000);
    const pfxname = `keystore_${randomNumber}.pfx`;
    const userIP = req.headers['x-real-ip'] || '127.0.0.1';

    const documentRecord = await Document.findById(documentId);
    if (!documentRecord) {
      throw new Error("Document not found");
    }

    if (!pdfFile) {
      throw new Error("PDF file is required");
    }

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    let PdfBuffer = Buffer.from(pdfFile, "base64");
    let pfxFile = process.env.PFX_BASE64;
    let passphrase = process.env.PASS_PHRASE;

    const pfx = { name: pfxname, passphrase: passphrase };
    const P12Buffer = Buffer.from(pfxFile, "base64");
    fs.writeFileSync(pfxname, P12Buffer);

    const docName = documentRecord?.name
      ?.replace(/[^a-zA-Z0-9._-]/g, "_")
      ?.toLowerCase();
    const filename = docName?.length > 100 ? docName?.slice(0, 100) : docName;
    const name = `${filename}_${randomNumber}.pdf`;
    let signedFilePath = path.join(exportsDir, `signed_${name}`);

    const reason = req.user.name + " <" + req.user.email + ">";
    const pdfDoc = await PDFDocument.load(PdfBuffer);
    const form = pdfDoc.getForm();

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    firstPage.drawText(`OpenSign™: documentId: ${documentId}`, { x: 10, y: height - 20, size: 10, font, color: rgb(0, 0, 0) });

    // Updates the field appearances to ensure visual changes are reflected.
    form.updateFieldAppearances();
    // Flattens the form, converting all form fields into non-editable, static content
    form.flatten();
    const p12Cert = new P12Signer(P12Buffer, {
      passphrase: passphrase || null,
    });
    signedFilePath = path.join(exportsDir, `signed_${name}`);
    Placeholder({
      pdfDoc: pdfDoc,
      reason: `Digitally signed by ${eSignName} for ${reason}`,
      location: "n/a",
      name: eSignName,
      contactInfo: eSigncontact,
      signatureLength: 16000,
    });
    const pdfWithPlaceholderBytes = await pdfDoc.save();
    PdfBuffer = Buffer.from(pdfWithPlaceholderBytes);
    //`new signPDF` create new instance of pdfBuffer and p12Buffer
    const OBJ = new SignPdf();
    // `signedDocs` is used to signpdf digitally
    const signedDocs = await OBJ.sign(PdfBuffer, p12Cert);
    fs.writeFileSync(signedFilePath, signedDocs);
    pdfSize = signedDocs.length;
    console.log(`New Signed PDF created called: ${`/exports/signed_${name}`}`);

    const data = await uploadFile(
      `signed_${name}`,
      `/exports/signed_${name}`,
      pdfSize,
      req.user._id
    );

    if (data?.imageUrl) {
      documentRecord.isCompleted = true;
      documentRecord.url = data.imageUrl;
      documentRecord.signature = req.body.signature || '';
      documentRecord.AuditTrail = [{
        SignedUrl: data.imageUrl,
        Activity: 'Signed',
        ipAddress: userIP,
        SignedOn: new Date(),
        Signature: req.body.signature,
        UserDetails: req.user,
      }];

      const certificateURL = await saveCertificate(documentRecord, pfx, req.user);

      console.log('certificateURL', certificateURL)

      const secureUrl = await getSecureUrl(certificateURL);
      console.log('secureURL', secureUrl)
      documentRecord.CertificateUrl = secureUrl.url;

      await documentRecord.save();

      return res.json({ status: "success", data: data.imageUrl });
    } else {
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.error("Error in savePdf:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

async function uploadFile(pdfName, filepath, pdfSize, userId) {
  try {
    const record = await File.create({
      fileName: pdfName,
      fileUrl: filepath,
      mimeType: "application/pdf",
      fileSize: pdfSize,
      createdBy: userId,
    });

    const { url } = getSecureUrl(record.fileUrl);
    return { imageUrl: url };
  } catch (err) {
    console.log("Err ", err);
  }
}

const getDocumentList = async (_, res) => {
  try {
    const documents = await Document.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdUser",
        },
      },
      {
        $project: {
          _id: 1,
          Name: "$name",
          Description: "$description",
          Note: "$note",
          URL: "$url",
          IsCompleted: "$isCompleted",
          CreatedBy: { $arrayElemAt: ["$createdUser", 0] },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      success: true,
      data: documents,
      message: "Documents retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getDocumentList:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const forwardDoc = async (req, res) => {
  try {
    const { docId, recipients } = req.body;
    if (!docId) {
      return res.json({ status: 400, message: "docId is required" });
    }

    if (!recipients) {
      return res.json({ status: 400, message: "recipients is required" });
    }

    if (
      !Array.isArray(recipients) ||
      !recipients.length ||
      recipients.length > 10
    ) {
      return res.json({ status: 400, message: "invalid recipients" });
    }

    const documentRecord = await Document.findById(docId);
    if (!documentRecord) {
      return res.json({ status: 400, message: "document not found" });
    }

    await sendMail({
      document: documentRecord,
      to: recipients.join(","),
      subject: `${req.user.name || "User"} has signed the doc - ${documentRecord.name
        }`,
      ...(req.user.email && { cc: req.user.email }),
      attachments: [
        {
          filename: path.basename(documentRecord.url),
          path: documentRecord.url,
        },
        {
          filename: path.basename(documentRecord.CertificateUrl),
          path: documentRecord.CertificateUrl,
        },
      ],
    });
    return res.json({ status: "success" });
  } catch (error) {
    console.error("Error in savePdf:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getDocumentUserList = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    const documents = await Document.aggregate([
      {
        $match: {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(userId) },
            { "signers.userId": new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdUser",
        },
      },
      {
        $project: {
          _id: 1,
          Name: "$name",
          Description: "$description",
          Note: "$note",
          URL: "$url",
          IsCompleted: "$isCompleted",
          CreatedBy: { $arrayElemAt: ["$createdUser", 0] },
          createdAt: 1,
          updatedAt: 1,
          signers: 1
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      success: true,
      data: documents,
      message: "User documents retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getDocumentUserList:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

async function saveCertificate(doc, pfx, userDetails) {
  const certificate = await GenerateCertificate(doc, userDetails);
  const certificatePdf = await PDFDocument.load(certificate);
  const P12Buffer = fs.readFileSync(pfx.name);
  const p12 = new P12Signer(P12Buffer, { passphrase: pfx.passphrase || null });
  //  `pdflibAddPlaceholder` is used to add code of only digitial sign in certificate
  pdflibAddPlaceholder({
    pdfDoc: certificatePdf,
    reason: `Digitally signed by ${eSignName}.`,
    location: 'n/a',
    name: eSignName,
    contactInfo: eSigncontact,
    signatureLength: 16000,
  });
  const pdfWithPlaceholderBytes = await certificatePdf.save();
  const CertificateBuffer = Buffer.from(pdfWithPlaceholderBytes);
  //`new signPDF` create new instance of CertificateBuffer and p12Buffer
  const certificateOBJ = new SignPdf();
  // `signedCertificate` is used to sign certificate digitally
  const signedCertificate = await certificateOBJ.sign(CertificateBuffer, p12);
  const certificatePath = `./exports/signed_certificate_${String(doc._id)}.pdf`;

  //below is used to save signed certificate in exports folder
  fs.writeFileSync(certificatePath, signedCertificate);

  return `/exports/signed_certificate_${String(doc._id)}.pdf`;
}

// Export the controller functions
module.exports = {
  handleDocumentAfterSave,
  updateDocumentACL,
  updateSelfDocumentACL,
  getDocumentById,
  savePdf,
  getDocumentList,
  forwardDoc,
  getDocumentUserList,
};
