const fs = require('fs');
const fontkit = require('@pdf-lib/fontkit');
const { PDFDocument, rgb } = require('pdf-lib');
const { formatDateTime } = require('./dateFormat');
const path = require('path')

async function GenerateCertificate(docDetails, userDetails) {
  const timezone = userDetails?.timezone || 'Asia/Kolkata';
  const Is12Hr = docDetails?.ExtUserPtr?.Is12HourTime || false;
  const DateFormat = docDetails?.ExtUserPtr?.DateFormat || 'MM/DD/YYYY';
  const pdfDoc = await PDFDocument.create();
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = fs.readFileSync(path.join(__dirname, './pdfResources/times.ttf')); //
  pdfDoc.registerFontkit(fontkit);
  const timesRomanFont = await pdfDoc.embedFont(fontBytes, { subset: true });
  const pngUrl = fs.readFileSync(path.join(__dirname, './pdfResources/logo.png')).buffer;
  const pngImage = await pdfDoc.embedPng(pngUrl);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const startX = 15;
  const startY = 15;
  const borderColor = rgb(0, 0, 0); // Black border
  const titleColor = rgb(1, 0.27, 0); // #ff4401 converted to RGB
  const titleUnderline = rgb(1, 0.27, 0);
  const headerBgColor = rgb(1, 0.27, 0); // Orange header
  const companyTextColor = rgb(1, 1, 1); // White text
  const watermarkColor = rgb(0.95, 0.95, 0.95); // Very light gray for watermark
  const accentColor = rgb(1, 0.27, 0); // Orange accent
  const title = 25;
  const subtitle = 16;
  const text = 13;
  const signertext = 13;
  const timeText = 11;
  const textKeyColor = rgb(0.12, 0.12, 0.12);
  const textValueColor = rgb(0.3, 0.3, 0.3);
  const completedAt = docDetails?.completedAt ? new Date(docDetails?.completedAt) : new Date();
  // const completedAtperTimezone = formatDateTime(completedAt, DateFormat, timezone, Is12Hr);
  // const completedUTCtime = completedAtperTimezone;
  const signersCount = docDetails?.Signers?.length || 1;
  const generateAt = docDetails?.completedAt ? new Date(docDetails?.completedAt) : new Date();
  // const generatedAtperTimezone = formatDateTime(generateAt, DateFormat, timezone, Is12Hr);
  // const generatedUTCTime = generatedAtperTimezone;
  const generatedOn = 'Generated On ' + generateAt;
  const textWidth = timesRomanFont.widthOfTextAtSize(generatedOn, 12);
  const margin = 30;
  const maxX = width - margin - textWidth; // Ensures text stays inside the border with 30px margin
  const OriginIp = docDetails?.OriginIp || '';
  const company = docDetails?.ExtUserPtr?.Company || '';
  const createdAt = docDetails?.DocSentAt?.iso || docDetails.createdAt;
  // const createdAtperTimezone = formatDateTime(createdAt, DateFormat, timezone, Is12Hr);
  const IsEnableOTP = docDetails?.IsEnableOTP || false;
  const ownerName = userDetails?.name || 'n/a';
  const ownerEmail = userDetails?.email || 'n/a';
  const half = width / 2;
  // Draw a border
  page.drawRectangle({
    x: startX,
    y: startY,
    width: width - 2 * startX,
    height: height - 2 * startY,
    borderColor: borderColor,
    borderWidth: 2, // Increased border width for more prominence
  });

  // Add watermark
  page.drawText('CERTIFIED', {
    x: width / 2 - 100,
    y: height / 2,
    size: 60,
    font: timesRomanFont,
    color: watermarkColor,
    rotate: { type: 'degrees', angle: -45 }
  });

  // Add colored header section
  page.drawRectangle({
    x: startX,
    y: height - 60,
    width: width - 2 * startX,
    height: 50,
    color: headerBgColor,
  });

  // Add decorative corner elements
  const cornerSize = 20;
  // Top-left corner
  page.drawRectangle({
    x: startX,
    y: height - startY - cornerSize,
    width: cornerSize,
    height: cornerSize,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });
  // Top-right corner
  page.drawRectangle({
    x: width - startX - cornerSize,
    y: height - startY - cornerSize,
    width: cornerSize,
    height: cornerSize,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });
  // Bottom-left corner
  page.drawRectangle({
    x: startX,
    y: startY,
    width: cornerSize,
    height: cornerSize,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });
  // Bottom-right corner
  page.drawRectangle({
    x: width - startX - cornerSize,
    y: startY,
    width: cornerSize,
    height: cornerSize,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  // Add company name with enhanced styling
  page.drawText('ITIO Innovex Pvt Ltd', {
    x: 30,
    y: height - 40,
    size: 18,
    font: timesRomanFont,
    color: companyTextColor,
  });

  // Add decorative border with double lines
  page.drawRectangle({
    x: startX + 5,
    y: startY + 5,
    width: width - 2 * (startX + 5),
    height: height - 2 * (startY + 5),
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  page.drawRectangle({
    x: startX + 10,
    y: startY + 10,
    width: width - 2 * (startX + 10),
    height: height - 2 * (startY + 10),
    borderColor: rgb(1, 0.27, 0),
    borderWidth: 0.5,
  });

  // Add a decorative line under the title
  page.drawLine({
    start: { x: width / 2 - 100, y: 745 },
    end: { x: width / 2 + 100, y: 745 },
    color: rgb(1, 0.27, 0),
    thickness: 2,
  });

  page.drawText(generatedOn, {
    x: Math.max(startX, maxX), // Adjusts dynamically 320
    y: 810,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText('Certificate of Completion', {
    x: 160,
    y: 755,
    size: title,
    font: timesRomanFont,
    color: titleColor,
  });

  const underlineY = 745;
  page.drawLine({
    start: { x: 30, y: underlineY },
    end: { x: width - 30, y: underlineY },
    color: titleUnderline,
    thickness: 1,
  });

  page.drawText('Summary', {
    x: 30,
    y: 727,
    size: subtitle,
    font: timesRomanFont,
    color: titleColor,
  });

  page.drawText('Document Id :', {
    x: 30,
    y: 710,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(String(docDetails._id), {
    x: 110,
    y: 710,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawText('Document Name :', {
    x: 30,
    y: 690,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(docDetails?.Name, {
    x: 130,
    y: 690,
    size: docDetails?.Name?.length >= 78 ? 12 : text,
    font: timesRomanFont,
    color: textValueColor,
  });

  // page.drawText('Organization :', {
  //   x: 30,
  //   y: 670,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textKeyColor,
  // });

  page.drawText(company, {
    x: 110,
    y: 670,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  // page.drawText('Created on :', {
  //   x: 30,
  //   y: 650,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textKeyColor,
  // });

  page.drawText(`${createdAt}`, {
    x: 97,
    y: 650,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('Completed on :', {
    x: 30,
    y: 630,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${completedAt}`, {
    x: 115,
    y: 630,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('Signers :', {
    x: 30,
    y: 610,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${signersCount}`, {
    x: 80,
    y: 610,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  // page.drawText('Document originator', {
  //   x: 30,
  //   y: 590,
  //   size: 17,
  //   font: timesRomanFont,
  //   color: titleColor,
  // });
  // page.drawText('Name :', {
  //   x: 60,
  //   y: 573,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textKeyColor,
  // });
  // page.drawText(ownerName, {
  //   x: 105,
  //   y: 573,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textValueColor,
  // });
  // page.drawText('Email :', {
  //   x: 60,
  //   y: 553,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textKeyColor,
  // });
  // page.drawText(ownerEmail, {
  //   x: 105,
  //   y: 553,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textValueColor,
  // });
  // page.drawText('IP address :', {
  //   x: 60,
  //   y: 533,
  //   size: text,
  //   font: timesRomanFont,
  //   color: textKeyColor,
  // });
  page.drawText(`${OriginIp}`, {
    x: 125,
    y: 533,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawLine({
    start: { x: 30, y: 527 },
    end: { x: width - 30, y: 527 },
    color: rgb(0.12, 0.12, 0.12),
    thickness: 0.5,
  });
  let yPosition1 = 512;
  let yPosition2 = 498;
  let yPosition3 = 478;
  let yPosition4 = 458;
  let yPosition5 = 438;
  let yPosition6 = 418;
  let yPosition7 = 398;
  let yPosition8 = 363;

  docDetails?.AuditTrail.slice(0, 3).forEach(async (x, i) => {
    const embedPng = x.Signature ? await pdfDoc.embedPng(x.Signature) : '';
    page.drawText(`Signer ${i + 1}`, {
      x: 30,
      y: yPosition1,
      size: subtitle,
      font: timesRomanFont,
      color: titleColor,
    });
    page.drawText('Name :', {
      x: 30,
      y: yPosition2,
      size: signertext,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.UserDetails?.Name, {
      x: 75,
      y: yPosition2,
      size: signertext,
      font: timesRomanFont,
      color: textValueColor,
    });

    if (IsEnableOTP) {
      page.drawText('Security level :', {
        x: half + 120,
        y: yPosition2,
        size: timeText,
        font: timesRomanFont,
        color: textKeyColor,
      });
      page.drawText('Email, OTP Auth', {
        x: half + 190,
        y: yPosition2,
        size: timeText,
        font: timesRomanFont,
        color: textValueColor,
      });
    }

    page.drawText('Email :', {
      x: 30,
      y: yPosition3,
      size: signertext,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.UserDetails?.Email, {
      x: 75,
      y: yPosition3,
      size: signertext,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Viewed on :', {
      x: 30,
      y: yPosition4,
      size: signertext,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(`${String(x.SignedOn)}`, {
      x: 97,
      y: yPosition4,
      size: signertext,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Signed on :', {
      x: 30,
      y: yPosition5,
      size: signertext,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(`${String(x.SignedOn)}`, {
      x: 95,
      y: yPosition5,
      size: signertext,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('IP address :', {
      x: 30,
      y: yPosition6,
      size: signertext,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.ipAddress, {
      x: 95,
      y: yPosition6,
      size: signertext,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Signature :', {
      x: 30,
      y: yPosition7,
      size: signertext,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawRectangle({
      x: 98,
      y: yPosition7 - 30,
      width: 104,
      height: 44,
      borderColor: rgb(0.22, 0.18, 0.47),
      borderWidth: 1,
    });
    if (embedPng) {
      page.drawImage(embedPng, {
        x: 100,
        y: yPosition7 - 27,
        width: 100,
        height: 40,
      });
    }
    page.drawLine({
      start: { x: 30, y: yPosition8 },
      end: { x: width - 30, y: yPosition8 },
      color: rgb(0.12, 0.12, 0.12),
      thickness: 0.5,
    });

    yPosition1 = yPosition8 - 20;
    yPosition2 = yPosition1 - 20;
    yPosition3 = yPosition2 - 20;
    yPosition4 = yPosition3 - 20;
    yPosition5 = yPosition4 - 20;
    yPosition6 = yPosition5 - 20;
    yPosition7 = yPosition6 - 20;
    yPosition8 = yPosition8 - 174;
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = GenerateCertificate;