const fs = require("fs");
const { execSync } = require("child_process");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fontkit = require('@pdf-lib/fontkit'); //load fontkit
const path = require("path");
const getSymbolFromCurrency = require('currency-symbol-map');

// Masking helpers
function maskMobile(mobile) {
  const mobileStr = String(mobile);
  return mobileStr.replace(/\d(?=\d{4})/g, '*');
}

function maskEmail(email) {
  const emailStr = String(email);
  const [local, domain] = emailStr.split('@');
  if (!local || !domain) return emailStr;
  return `${local[0]}*****@${domain}`;
}
function formatDobToDDMMYYYY(dobString) {
  const date = new Date(dobString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getUTCFullYear();

  return `${day}${month}${year}`; // ddmmyyyy
}
function getSalutation(user) {
  const gender = (user.gender || '').toLowerCase();

  switch (gender) {
    case 'male':
      return 'Mr.';
    case 'female':
      return 'Ms.'; // or 'Mrs.' based on your application's tone
    case 'other':
    case 'non-binary':
    case 'prefer_not_to_say':
      return 'Mx.';
    default:
      return ''; // fallback if gender is missing
  }
}

async function generatePasswordProtectedSatementPDF({ user, dob, accounts, outputPath }) {
  if (dob && !isNaN(new Date(dob).getTime())) {
    dob = formatDobToDDMMYYYY(dob);
    console.log("Formatted DOB:", dob);
  }else{
    dob = "00000000"; // Default to 00000000 if dob is invalid
  }

  const fontPath = path.resolve(__dirname, "../../public/fonts/DejaVuSans.ttf");
  const fontBytes = fs.readFileSync(path.join(fontPath));
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit); //Required for custom .ttf font
  const unicodeFont = await pdfDoc.embedFont(fontBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let page = pdfDoc.addPage();
  let y = page.getHeight() - 50;
  const marginLeft = 50;

  const background = rgb(251 / 255, 240 / 255, 179 / 255);
  const textColor = rgb(0, 0, 0);
  const headerColor = rgb(103 / 255, 58 / 255, 183 / 255); // #673ab7
  const whiteColor = rgb(1, 1, 1);
  const borderColor = rgb(0.6, 0.6, 0.6);

  // Draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: background,
  });

  const headerHeight = 50;

  // Draw header background
  page.drawRectangle({
    x: 0,
    y: page.getHeight() - headerHeight,
    width: page.getWidth(),
    height: headerHeight,
    color: headerColor,
  });

  // Logo
  const logoPath = path.resolve(__dirname, "../../public/logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.15);
    page.drawImage(logoImage, {
      x: marginLeft,
      y: page.getHeight() - headerHeight + (headerHeight - logoDims.height) / 2,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  // Header Title
  const headerTitle = "Monthly Account Statement";
  const textWidth = boldFont.widthOfTextAtSize(headerTitle, 18);
  page.drawText(headerTitle, {
    x: (page.getWidth() - textWidth) / 2,
    y: page.getHeight() - 33,
    size: 18,
    font: boldFont,
    color: whiteColor,
  });
  y -= 20;

  // User Info
  const salutation = getSalutation(user);
  page.drawText(`${salutation} ${user.name}`, { x: marginLeft, y, size: 12, color: textColor, font: boldFont });
  y -= 15;
// Handle address lines
    if (user?.address) {
      const addressLines = user.address
        .replace(/\r/g, "")       // remove carriage returns
        .replace(/,+/g, ",")      // collapse multiple commas
        .split("\n");

      for (const line of addressLines) {
        if (line.trim()) {
          page.drawText(line.trim(), {
            x: marginLeft,
            y,
            size: 12,
            font,
            color: textColor
          });
          y -= 15;
        }
      }
    }
  if (user?.city?.trim()) {
    page.drawText(user.city.trim(), { x: marginLeft, y, size: 12, font, color: textColor });
    y -= 15;
  }
  if (user?.state?.trim()) {
    page.drawText(user.state.trim(), { x: marginLeft, y, size: 12, font, color: textColor });
    y -= 15;
  }
  if (user?.country?.trim()) {
    page.drawText(user.country.trim(), { x: marginLeft, y, size: 12, font, color: textColor });
    y -= 15;
  }
  if (user?.mobile && String(user.mobile).trim()) {
    page.drawText(`Mobile: ${maskMobile(user.mobile)}`, { x: marginLeft, y, size: 12, font, color: textColor });
    y -= 15;
  }
  if (user?.email?.trim()) {
    page.drawText(`E-mail: ${maskEmail(user.email)}`, { x: marginLeft, y, size: 12, font, color: textColor });
    y -= 20;
  }
  y -= 20;// Add some space before the account summary
  // Account Summary Table

  const tableX = marginLeft;
  const tableY = y;
  const rowHeight = 20;
  const colWidths = [40, 140, 180, 150];
  const headers = ["Sno", "Account Name", "Account Number", "Available Balance"];

  // Draw table headers
  let currentX = tableX;
  for (let i = 0; i < headers.length; i++) {
    page.drawRectangle({
      x: currentX,
      y: tableY,
      width: colWidths[i],
      height: rowHeight,
      color: headerColor,
    });
    page.drawText(headers[i], {
      x: currentX + 5,
      y: tableY + 5,
      size: 10,
      font: boldFont,
      color: whiteColor,
    });
    currentX += colWidths[i];
  }

  // Draw table rows
  let rowY = tableY - rowHeight;
  for (const row of accounts) {
    currentX = tableX;
    let k=1;
    const amountCurrency = getSymbolFromCurrency(row.currency);
    const values = [k, row.name, row.iban, `${amountCurrency} ${row.amount}`];
    for (let i = 0; i < values.length; i++) {
      // Draw border
      page.drawRectangle({
        x: currentX,
        y: rowY,
        width: colWidths[i],
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: borderColor,
        color: background,
      });
      page.drawText(values[i].toString(), {
        x: currentX + 5,
        y: rowY + 5,
        size: 10,
        font:unicodeFont,
        color: textColor,
      });
      currentX += colWidths[i];
    }
    rowY -= rowHeight;
    k++;
  }
  y = rowY - 20;

  // Transactions Tables Per Account
  for (let acc of accounts) {
    // Account Title
    page.drawText(`Account Name: ${acc.name}`, { x: marginLeft, y, size: 12, font: boldFont, color: textColor });
    y -=20;
    page.drawText(`Account Number: ${acc.iban}`, { x: marginLeft, y, size: 12, font, color: textColor });
    y -= 40;

    // Table Header with border and background
    const transHeaders = ["Date", "Type", "Amount"," Balance", "Status"];
    const transColWidths = [90, 100, 120, 120, 80];
    const transHeaderY = y;
    let xPos = marginLeft;

    for (let i = 0; i < transHeaders.length; i++) {
      page.drawRectangle({
        x: xPos,
        y: transHeaderY,
        width: transColWidths[i],
        height: rowHeight,
        color: headerColor,
      });
      page.drawText(transHeaders[i], {
        x: xPos + 5,
        y: transHeaderY + 5,
        size: 10,
        font: boldFont,
        color: whiteColor,
      });
      xPos += transColWidths[i];
    }

    y = transHeaderY - rowHeight;

    if (!acc.transactions || acc.transactions.length === 0) {
      page.drawText("No transactions this month.", { x: marginLeft + 10, y, size: 10, font, color: textColor });
      y -= 20;
    } else {
      for (let txn of acc.transactions) {
        const dateStr = txn.createdAt.toISOString().split("T")[0];

        let status;
        if (
          txn.status === "succeeded" ||
          txn.status === "Success" ||
          txn.status === "completed" ||
          txn.status === "successful"
        ) {
          status = "Success";
        } else {
          status = txn.status.charAt(0).toUpperCase() + txn.status.slice(1).toLowerCase();
        }
        const isDebit = txn?.extraType === "debit" || txn?.trans_type === "Send Money";
        const txnAmount = `${isDebit ? '↓ ' : '↑ '}${isDebit
                ? getSymbolFromCurrency(txn?.from_currency)   // Is debit currency will be from_currency
                : txn?.trans_type == "Exchange"               // Is exchange and not debit, currency will be from_currency
                  ? getSymbolFromCurrency(txn?.from_currency)
                : txn?.trans_type == "Add Money"            // Is not exchange not debit Is add money, currency will be to_currency
                  ? getSymbolFromCurrency(txn?.to_currency)
                  : getSymbolFromCurrency(txn?.from_currency)
                }${parseFloat(txn?.amount || 0).toFixed(2)}`;
        const txnBalance= `${isDebit
                ? getSymbolFromCurrency(txn?.from_currency)
                : txn?.trans_type === "Exchange"
                  ? getSymbolFromCurrency(txn?.to_currency)
                  : getSymbolFromCurrency(txn?.from_currency)
                }${parseFloat(txn?.postBalance ?? 0).toFixed(2)}`

        // Set arrow and color based on extraType
        let amountColor = textColor;
        if (txn.extraType === "credit") {
          amountColor = rgb(0, 128 / 255, 0); // green
        } else if (txn.extraType === "debit") {
          amountColor = rgb(220 / 255, 20 / 255, 60 / 255); // red
        } else if(txn?.trans_type === "Send Money"){
          amountColor = rgb(220 / 255, 20 / 255, 60 / 255); // red
        }

        const values = [
          dateStr,
          txn.trans_type,
          txnAmount,
          txnBalance,
          status
        ];

        xPos = marginLeft;
        for (let i = 0; i < values.length; i++) {
          page.drawRectangle({
            x: xPos,
            y: y,
            width: transColWidths[i],
            height: rowHeight,
            color: background,
            borderWidth: 0.5,
            borderColor: borderColor,
          });

          page.drawText(values[i], {
            x: xPos + 5,
            y: y + 5,
            size: 10,
            font:unicodeFont,
            color: i === 2 ? amountColor : textColor, // Color the amount only
          });

          xPos += transColWidths[i];
        }

        y -= rowHeight;
      }
    }

    y -= 20;
  }

  // Save plain PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  // Encrypt with qpdf
  const encryptedPath = outputPath.replace(".pdf", "_protected.pdf");
  try {
    execSync(`qpdf --encrypt "${dob}" "${dob}" 256 -- "${outputPath}" "${encryptedPath}"`);
    fs.unlinkSync(outputPath);
    console.log("✅ Password-protected PDF generated:", encryptedPath);
  } catch (err) {
    console.error("❌ Failed to encrypt PDF with qpdf:", err.message);
  }
}

module.exports = generatePasswordProtectedSatementPDF;
