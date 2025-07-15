import React from 'react';
import { Box, Typography } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Box className="privacy-wrapper">
      <Typography variant="h4" className="privacy-heading">
        🔐 Privacy Policy
      </Typography>

      <Typography className="privacy-section">
        <strong>Effective Date:</strong> July 15, 2025
      </Typography>

      <Typography className="privacy-paragraph">
        QuickCash (“we”, “us”, “our”) respects your privacy. This Privacy Policy explains how we handle your personal and financial data when you use our platform for crypto exchanges, fiat transfers, invoicing, and taxation services.
      </Typography>

      <Typography variant="h6" className="privacy-subheading">🧾 What We Collect</Typography>
      <ul className="privacy-list">
        <li>Personal Info: Name, phone, email, address, KYC documents</li>
        <li>Financial Info: Bank details, wallet addresses, transaction history</li>
        <li>Device & Usage Data: IP address, browser, interaction logs</li>
        <li>Uploaded Files: ID proof, selfies, QR codes, invoices</li>
      </ul>

      <Typography variant="h6" className="privacy-subheading">🎯 Why We Collect It</Typography>
      <ul className="privacy-list">
        <li>To verify your identity (KYC/AML compliance)</li>
        <li>To process payments, crypto swaps, or fiat transfers</li>
        <li>To generate and manage invoices and tax reports</li>
        <li>To improve our product experience</li>
        <li>To stay compliant with Indian regulations and international standards</li>
      </ul>

      <Typography variant="h6" className="privacy-subheading">🔄 Data Sharing</Typography>
      <ul className="privacy-list">
        <li>Regulatory authorities (as required by law)</li>
        <li>Trusted service providers (cloud, payment, verification)</li>
        <li>Banks and crypto exchanges (to process transactions)</li>
        <li><strong>We never sell your data.</strong></li>
      </ul>

      <Typography variant="h6" className="privacy-subheading">🛡️ Data Security</Typography>
      <Typography className="privacy-paragraph">
        We use encryption, secure servers, and access controls to keep your data safe. Your data is retained only as long as necessary.
      </Typography>

      <Typography variant="h6" className="privacy-subheading">🎛️ Your Rights</Typography>
      <ul className="privacy-list">
        <li>View / edit your data</li>
        <li>Request deletion (where legally possible)</li>
        <li>Opt out of marketing (if any in future)</li>
      </ul>

      <Typography variant="h6" className="privacy-subheading">🚫 Under 18?</Typography>
      <Typography className="privacy-paragraph">
        Our services are for users 18+ only. We do not knowingly collect data from minors.
      </Typography>

      <Typography variant="h6" className="privacy-subheading">📬 Contact Us</Typography>
      <Typography className="privacy-paragraph">
        Email: <a href="mailto:support@quickcash.oyefin.com">support@quickcash.oyefin.com</a><br />
        Website: <a href="https://quickcash.oyefin.com" target="_blank" rel="noreferrer">quickcash.oyefin.com</a>
      </Typography>

      <Typography className="privacy-note">
        📌 Note: This is a simplified policy for general awareness. Please refer to our full Privacy Policy for detailed legal terms (coming soon).
      </Typography>
    </Box>
  );
};

export default PrivacyPolicy;
