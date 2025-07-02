const { v4: uuidv4 } = require("uuid");
const Document = require("../../models/DigitalSignature/document.model");
const File = require("../../models/DigitalSignature/file.model");
const { User } = require("../../models/user.model");
const { ContactBook, CONTACT_ROLES } = require("../../models/contactBooks.model");
const { default: mongoose } = require("mongoose");
const fs = require("fs");
const path = require("path");
const { P12Signer } = require("@signpdf/signer-p12");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { Placeholder } = require("../../utils/Placeholder");
const { SignPdf } = require("@signpdf/signpdf");
const { getSecureUrl } = require("../../utils/fileUtils");
const { sendMail, sendGeneralMail } = require("../../utils/sendMail");
const GenerateCertificate = require("../../utils/GenerateCertificate");
const { pdflibAddPlaceholder } = require("@signpdf/placeholder-pdf-lib");
const { getOnlySignersFromDocument } = require("../../utils/digitalSignatureUtils");
const jwt = require('jsonwebtoken');


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
    const { Signers, name, note, url, description, SendinOrder, source } = req.body;

    const record = await Document.create({
      note,
      url,
      name,
      description,
      SendinOrder,
      createdBy: req.user._id,
    });

    if (Signers && Signers.length > 0) {
      await updateDocumentACL(record, Signers);
    } else if (req.user) {
      await updateSelfDocumentACL(record, req.user);
    }

    if (source) {
      const tokenPayload = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        type: 'user',
        defaultcurr: req.user.defaultCurrency,
        source: "DS",
        documentId: record._id,
      }

      try {
        const token = jwt.sign({
          expiresIn: '24h',
          exp: Math.floor(Date.now() / 1000) + (43200),
          data: tokenPayload
        }, process.env.ACCESS_TOKEN_SECRET);

        return res.json({
          success: true,
          data: {
            publicUrl: `http://localhost:5173/login?token=${token}`
          },
          message: "Document created successfully",
        });
      } catch (error) {
        console.log("Error while generating Access Token", error);
      }
    }


    return res.json({
      success: true,
      data: record,
      message: "Document created successfully",
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
  document.Signers = signers;

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
  // const contactBook = await ContactBook.findOne({ Email: user.email });

  // if (contactBook) {
  //   document.Signers = [
  //     {
  //       objectId: contactBook._id,
  //     },
  //   ];
  // } else {
  // }
  const newContactBook = await ContactBook.create({
    Name: user.name,
    Email: user.email,
    Phone: user.phone,
    CreatedBy: user._id,
    IsDeleted: false,
    UserId: user._id,
    UserRole: CONTACT_ROLES.Approver,
  });

  document.Signers = [
    {
      objectId: newContactBook._id,
    },
  ];

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

    const record = await getDocumentDetailsById(id);

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
    const { documentId, pdfFile, userId } = req.body;

    const randomNumber = Math.floor(Math.random() * 5000);
    const pfxname = `keystore_${randomNumber}.pfx`;
    const userIP = req.headers["x-real-ip"] || "127.0.0.1";

    const documentRecord = await getDocumentDetailsById(documentId);
    if (!documentRecord) {
      throw new Error("Document not found");
    }

    if (userId) {
      const contractUser = documentRecord.Signers.find(
        (x) => String(x.objectId) === userId
      );
      const contractUserDetails = await ContactBook.findById(
        contractUser.objectId
      );
      req.user = contractUserDetails;
    }

    if (!pdfFile) {
      throw new Error("PDF file is required");
    }

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, "../../../exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    let PdfBuffer = Buffer.from(pdfFile, "base64");
    let pfxFile = process.env.PFX_BASE64;
    let passphrase = process.env.PASS_PHRASE;

    const pfx = { name: pfxname, passphrase: passphrase };
    const P12Buffer = Buffer.from(pfxFile, "base64");
    fs.writeFileSync(pfxname, P12Buffer);

    const obj = {
      UserDetails: req.user,
      SignedUrl: "",
      Activity: "Signed",
      ipAddress: userIP,
    };
    let updateAuditTrail;
    if (documentRecord.AuditTrail && documentRecord.AuditTrail.length > 0) {
      updateAuditTrail = [...documentRecord.AuditTrail, obj];
    } else {
      updateAuditTrail = [obj];
    }

    const auditTrail = updateAuditTrail.filter((x) => x.Activity === "Signed");
    let isCompleted = false;
    if (documentRecord.Signers && getOnlySignersFromDocument(documentRecord).length > 0) {
      if (auditTrail.length === getOnlySignersFromDocument(documentRecord).length) {
        isCompleted = true;
      }
    } else {
      isCompleted = true;
    }

    const docName = documentRecord?.Name?.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )?.toLowerCase();
    const filename = docName?.length > 100 ? docName?.slice(0, 100) : docName;
    const name = `${filename}_${randomNumber}.pdf`;
    let signedFilePath = path.join(exportsDir, `signed_${name}`);

    if (isCompleted) {
      const signersName = getOnlySignersFromDocument(documentRecord)?.map(
        (x) => x.Name + " <" + x.Email + ">"
      );
      const reason =
        signersName && signersName.length > 0
          ? signersName?.join(", ")
          : req.user.name + " <" + req.user.email + ">";
      const pdfDoc = await PDFDocument.load(PdfBuffer);
      const form = pdfDoc.getForm();

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      firstPage.drawText(`QuickCash™: documentId: ${documentId}`, {
        x: 10,
        y: height - 20,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

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
    } else {
      //`saveUrl` is used to save signed pdf in exports folder
      fs.writeFileSync(signedFilePath, PdfBuffer);
      pdfSize = PdfBuffer.length;
      console.log(`New Signed PDF created called: ${signedFilePath}`);
    }

    console.log(`New Signed PDF created called: ${`/exports/signed_${name}`}`);

    const data = await uploadFile(
      `signed_${name}`,
      `/exports/signed_${name}`,
      pdfSize,
      req.user._id
    );

    if (data?.imageUrl) {
      const documentRecordToUpdate = {
        isCompleted: isCompleted,
        SignedUrl: data.imageUrl,
        signature: req.body.signature || "",
      };

      const obj = {
        SignedUrl: data.imageUrl,
        Activity: "Signed",
        ipAddress: userIP,
        SignedOn: new Date(),
        Signature: req.body.signature,
        UserDetails: req.user,
        UserPtr: req.user,
      };

      let updateAuditTrail2;
      if (documentRecord.AuditTrail && documentRecord.AuditTrail.length > 0) {
        const AuditTrail = JSON.parse(
          JSON.stringify(documentRecord.AuditTrail)
        );
        const existingIndex = AuditTrail.findIndex(
          (entry) =>
            entry.UserPtr.objectId === userId && entry.Activity !== "Created"
        );

        existingIndex !== -1
          ? (AuditTrail[existingIndex] = {
            ...AuditTrail[existingIndex],
            ...obj,
          })
          : AuditTrail.push(obj);

        updateAuditTrail2 = AuditTrail;
      } else {
        updateAuditTrail2 = [obj];
      }

      console.log("updateAuditTrail2", updateAuditTrail2);
      documentRecordToUpdate.AuditTrail = updateAuditTrail2;

      documentRecord.SignedUrl = data.imageUrl;
      sendNotifyMail(documentRecord, req.user);
      await Document.updateOne({ _id: documentId }, documentRecordToUpdate);

      const documentRecord2 = await getDocumentDetailsById(documentId);
      if (documentRecord2?.IsCompleted) {
        const certificateURL = await saveCertificate(
          documentRecord2,
          pfx,
          req.user
        );
        const secureUrl = await getSecureUrl(certificateURL);

        await Document.updateOne(
          { _id: documentId },
          { CertificateUrl: secureUrl.url }
        );

        documentRecord2.CertificateUrl = secureUrl.url;
        sendCompletedMail({ doc: documentRecord2 });
      }

      return res.json({ status: "success", data: data.imageUrl });
    } else {
      throw new Error("Something went wrong");
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
            { "signers.userId": new mongoose.Types.ObjectId(userId) },
          ],
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
          createdAt: 1,
          updatedAt: 1,
          signers: 1,
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
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
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
    location: "n/a",
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

const updateDocument = async (req, res) => {
  try {
    const result = await Document.updateOne(
      { _id: req.params.docId },
      req.body
    );
    res.json({
      success: true,
      data: {
        result,
        updatedAt: new Date(),
      },
      message: "User documents retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getDocumentUserList:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const sendGeneralDocumentMail = async (req, res) => {
  try {
    const { from, html, recipient, replyto, subject } = req.body;

    const response = await sendGeneralMail({
      to: recipient,
      html,
      replyTo: replyto,
      subject,
      from,
    });
    res.json({
      success: true,
      data: response,
      result: { status: "success" },
      message: "Mail send succsessfully",
    });
  } catch (error) {
    console.error("Error in getDocumentUserList:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getDocumentDetailsById = async (id) => {
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
        CertificateUrl: "$CertificateUrl",
        Signers: "$Signers",
        SignatureType: "$SignatureType",
        Placeholders: "$Placeholders",
        SentToOthers: "$SentToOthers",
        ExpiryDate: "ExpiryDate",
        SignedUrl: "$SignedUrl",
        SendMail: "$SendMail",
        AuditTrail: "$AuditTrail",
        IsDeclined: "$IsDeclined",
        DeclineReason: "$DeclineReason",
        DeclineBy: "$DeclineBy",
        Viewers: "$Viewers",
        SendinOrder: "$SendinOrder",
      },
    },
  ]);

  if (record?.Signers?.length) {
    const signerIds = record?.Signers?.map((item) => item.objectId) || [];
    const orderedSigners = [];
    for (const id of signerIds) {
      const signer = await ContactBook.findById(id).lean();
      if (signer) orderedSigners.push(signer);
    }
    record.Signers = orderedSigners;
  }

  if (record?.CreatedBy) {
    record.ExtUserPtr = Object.entries(
      JSON.parse(JSON.stringify(record.CreatedBy))
    ).reduce((acc, [key, value]) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      acc[capitalizedKey] = value;
      return acc;
    }, {});
  }
  if (record?.DeclineBy) {
    record.DeclineBy = await User.findById(record.DeclineBy);
  }

  if (record?.AuditTrail?.length) {
    record.AuditTrail = record.AuditTrail.map((entry) => {
      const { UserDetails } = entry;
      return {
        ...entry,
        UserPtr: {
          ...UserDetails,
          objectId: UserDetails.objectId,
        },
      };
    });
  }

  if (record?._id) {
    record.objectId = record._id;
  }

  return record;
};

const getReport = async (req, res) => {
  try {
    const { statusFilter, searchQuery } = req.query;
    let { userid, skip = 0, limit = 20 } = req.body;

    if (userid && !mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    if (!userid) {
      userid = req.user._id;
    }

    const matchObj = {
      $and: [{ createdBy: new mongoose.Types.ObjectId(userid) }],
    };

    if (statusFilter) {
      switch (statusFilter) {
        case "completed":
          matchObj.$and.push({ isCompleted: true });
          break;

        case "inProgress":
          matchObj.$and.push({ isCompleted: false }, { SentToOthers: true });
          break;

        case "draft":
          matchObj.$and.push({ isCompleted: false }, { SentToOthers: false });
          break;

        default:
          break;
      }
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const regex = new RegExp(searchQuery, "i");
      matchObj.$and.push({ $or: [{ name: regex }, { note: regex }] });
    }

    const documents = await Document.aggregate([
      {
        $match: matchObj,
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
          CertificateUrl: "$CertificateUrl",
          Signers: "$Signers",
          SignatureType: "$SignatureType",
          Placeholders: "$Placeholders",
          SentToOthers: "$SentToOthers",
          ExpiryDate: "$ExpiryDate",
          SignedUrl: "$SignedUrl",
          SendMail: "$SendMail",
          AuditTrail: "$AuditTrail",
          ACL: "$acl",
          IsDeclined: "$IsDeclined",
          DeclineReason: "$DeclineReason",
          DeclineBy: "$DeclineBy",
          Viewers: "$Viewers",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: parseInt(skip),
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    // Get total count for pagination (with the same filter)
    const totalCount = await Document.countDocuments(matchObj);

    // Process signers for each document
    for (let doc of documents) {
      if (doc?.Signers?.length) {
        const signerRecords = await ContactBook.find({
          _id: { $in: doc.Signers.map((item) => item.objectId) },
        });
        doc.Signers = signerRecords;
      }

      if (doc?.CreatedBy) {
        doc.ExtUserPtr = Object.entries(
          JSON.parse(JSON.stringify(doc.CreatedBy))
        ).reduce((acc, [key, value]) => {
          const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
          acc[capitalizedKey] = value;
          return acc;
        }, {});
      }

      if (doc?._id) {
        doc.objectId = doc._id;
      }

      if (doc?.DeclineBy) {
        doc.DeclineBy = await User.findById(doc.DeclineBy);
      }
    }

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total: totalCount,
          skip: parseInt(skip),
          limit: parseInt(limit),
          hasMore: totalCount > parseInt(skip) + parseInt(limit),
        },
      },
      message: "User documents report retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getReport:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const declineDocument = async (req, res) => {
  try {
    const { documentId, userId, reason = "" } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Missing parameter docId.",
      });
    }

    // First, fetch the document to check for IsEnableOTP
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found.",
      });
    }

    const result = await Document.updateOne(
      { _id: documentId },
      {
        $set: {
          IsDeclined: true,
          DeclineReason: reason,
          DeclineBy: userId,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Document declined",
      data: {},
    });
  } catch (error) {
    console.error("Error while declining document:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document ID format",
      });
    }

    // Find and delete the document
    const deletedDocument = await Document.findByIdAndDelete(id);

    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    res.json({
      success: true,
      message: "Document deleted successfully",
      data: deletedDocument,
    });
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const handleDocumentWebhook = async (req, res) => {
  try {
    const { documentId, userId } = req.body;

    if (!documentId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: documentId and userId",
      });
    }

    const documentRecord = await getDocumentDetailsById(documentId);

    if (!documentRecord) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    const signersCopy = JSON.parse(
      JSON.stringify(documentRecord.Signers || [])
    );
    const signerDetailsByUserId = signersCopy?.find(
      (item) => item?._id?.toString() === userId?.toString()
    );

    if (!signerDetailsByUserId) {
      return res.status(404).json({
        success: false,
        error: "Signer not found for this document",
      });
    }

    let viewersCopy = JSON.parse(JSON.stringify(documentRecord.Viewers || []));
    const existingViewerIndex = viewersCopy.findIndex(
      (item) =>
        item.signerId?.toString() === signerDetailsByUserId._id?.toString()
    );

    if (existingViewerIndex === -1) {
      viewersCopy.push({
        signerId: signerDetailsByUserId._id,
        viewedAt: new Date(),
      });
    } else {
      viewersCopy[existingViewerIndex] = {
        signerId: signerDetailsByUserId._id,
        viewedAt: new Date(),
      };
    }

    await Document.updateOne(
      { _id: documentId },
      { $set: { Viewers: viewersCopy } }
    );

    return res.json({
      success: true,
      message: "Document view recorded successfully",
    });
  } catch (error) {
    console.error("Error in handleDocumentWebhook:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

async function sendNotifyMail(doc, signUser) {
  try {
    const TenantAppName = "Quick Cash";
    const logo =
      "<img src='https://itio.in/images/829775694_ITIO%20LOGO%20_general%20ICON-01-min.PNG' height='50' style='padding:20px'/>";
    const opurl = ` <a href=https://quickcash.oyefin.com/ target=_blank>here</a>`;
    const auditTrailCount =
      doc?.AuditTrail?.filter((x) => x.Activity === "Signed")?.length || 0;
    const signersCount = doc?.Placeholders?.length;
    const remaingsign = signersCount - auditTrailCount;
    console.log("HLWO MUCH REMAINIGN", remaingsign);
    if (remaingsign > 1) {
      const pdfName = doc.Name;
      const creatorName = doc.ExtUserPtr.Name;
      const creatorEmail = doc.ExtUserPtr.Email;
      const signerName = signUser.Name;
      const signerEmail = signUser.Email;
      const viewDocUrl = `http://localhost:8080/recipientSignPdf/${doc.objectId}`;
      const subject = `Document "${pdfName}" has been signed by ${signerName}`;
      const body =
        "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white'>" +
        `<div>${logo}</div><div style='padding:2px;font-family:system-ui;background-color:#47a3ad'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Document signed by ${signerName}</p>` +
        `</div><div style='padding:20px;font-family:system-ui;font-size:14px'><p>Dear ${creatorName},</p><p>${pdfName} has been signed by ${signerName} "${signerEmail}" successfully</p>` +
        `<p><a href=${viewDocUrl} target=_blank>View Document</a></p></div></div><div><p>This is an automated email from ${TenantAppName}. For any queries regarding this email, ` +
        `please contact the sender ${creatorEmail} directly. If you think this email is inappropriate or spam, you may file a complaint with ${TenantAppName}${opurl}.</p></div></div></body></html>`;

      const response = await sendGeneralMail({
        to: creatorEmail,
        html: body,
        subject,
        from: TenantAppName,
        attachments: [
          {
            filename: path.basename(doc.SignedUrl),
            path: doc.SignedUrl,
          },
        ],
      });

      console.log("sendNotifyMail:SuccessResponse", response);
    }
  } catch (err) {
    console.log("sendNotifyMail:ErrorResponse", err);
  }
}

async function sendCompletedMail(obj) {
  const url = obj.doc?.SignedUrl;
  const doc = obj.doc;
  const sender = obj.doc.ExtUserPtr;
  const pdfName = doc.Name;
  const TenantAppName = "Quick Cash";
  const logo =
    "<img src='https://itio.in/images/829775694_ITIO%20LOGO%20_general%20ICON-01-min.PNG' height='50' style='padding:20px'/>";
  const opurl = ` <a href=https://quickcash.oyefin.com/ target=_blank>here</a>`;
  let signersMail;
  if (doc?.Signers?.length > 0) {
    const isOwnerExistsinSigners = doc?.Signers?.find(
      (x) => x.Email === sender.Email
    );
    signersMail = isOwnerExistsinSigners
      ? doc?.Signers?.map((x) => x?.Email)?.join(",")
      : [...doc?.Signers?.map((x) => x?.Email), sender.Email]?.join(",");
  } else {
    signersMail = sender.Email;
  }
  const recipient = signersMail;
  let subject = `Document "${pdfName}" has been signed by all parties`;
  let body =
    "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white'>" +
    `<div>${logo}</div><div style='padding:2px;font-family:system-ui;background-color:#47a3ad'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Document signed successfully</p></div><div>` +
    `<p style='padding:20px;font-family:system-ui;font-size:14px'>All parties have successfully signed the document <b>"${pdfName}"</b>. Kindly download the document from the attachment.</p>` +
    `</div></div><div><p>This is an automated email from ${TenantAppName}. For any queries regarding this email, please contact the sender ${sender.Email} directly.` +
    `If you think this email is inappropriate or spam, you may file a complaint with ${TenantAppName}${opurl}.</p></div></div></body></html>`;

  try {
    const response = await sendGeneralMail({
      to: recipient,
      html: body,
      subject,
      replyto: doc?.ExtUserPtr?.Email || "",
      from: TenantAppName,
      attachments: [
        {
          filename: path.basename(obj.doc.SignedUrl),
          path: obj.doc.SignedUrl,
        },
        {
          filename: path.basename(obj.doc.CertificateUrl),
          path: obj.doc.CertificateUrl,
        },
      ],
    });

    console.log("sendCompletedMail:SuccessResponse:", response);
  } catch (err) {
    console.log("sendCompletedMail:Error:", err);
  }
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
  updateDocument,
  sendGeneralDocumentMail,
  getReport,
  declineDocument,
  deleteDocument,
  handleDocumentWebhook,
};
