import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  flattenPdf,
  generatePdfName,
  generateTitleFromFilename,
  getBearerToken,
} from "../constant/Utils";
import axios from "axios";
import {
  maxFileSize,
  maxNoteLength,
  maxTitleLength,
} from "../constant/const";
import { API_ROUTES } from "../constant/apiRoutes";
import { useAppToast } from '@/utils/toast'; 
import Title from '../../../components/common/Title';
import Loader from '../../../components/common/loader';
import AddContactModal from './AddContactModal';
import { Multiselect } from 'multiselect-react-dropdown';

import {
  Box,
  Button,
  Typography,
  TextField,
  LinearProgress,
  Paper,
  IconButton,
  Fade,
  Zoom,
  styled,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';

// Styled components
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '10',
    borderColor: theme.palette.primary.dark,
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const RequestSignatureForm = () => {
  const inputFileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    Name: "",
    Note: "Please review and sign this document",
    file: "",
    sendInOrder: true,
  });
  const [fileupload, setFileUpload] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  // const [selectedSigners, setSelectedSigners] = useState([]);
  const [emails, setEmails] = useState([
    { name: 'test1@example.com', id: 1 },
    { name: 'test2@example.com', id: 2 }
  ]);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [errors, setErrors] = useState({
    file: '',
    Name: '',
    Note: '',
  });

  const handleStrInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, sendInOrder: e.target.checked });
  };

  function getFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsArrayBuffer(file);
    });
  }

  const removeFile = (e) => {
    if (e) e.target.value = "";
  };

  const handleFileInput = async (e) => {
    try {
      const files = e.target.files;
      setFormData((prev) => ({ ...prev, file: files[0] }));
      if (!files[0]) {
        toast.error("Please select a valid PDF file.");
        return;
      }
      const mb = Math.round(files[0].size / Math.pow(1024, 2));
      if (mb > maxFileSize) {
        toast.error(`File too large. Max allowed size is ${maxFileSize} MB.`);
        setFileUpload("");
        removeFile(e);
        return;
      }
      if (files[0].type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        return;
      }
      const name = generatePdfName(16);
      const pdfName = `${name?.split(".")[0]}.pdf`;
      try {
        const res = await getFileAsArrayBuffer(files[0]);
        const flatPdf = await flattenPdf(res);
        const url = API_ROUTES.SAVE_FILE;
        const body = {
          fileBase64: [...flatPdf],
          fileName: pdfName,
        };
        const { data: fileRes } = await axios.post(url, body, {
          headers: { Authorization: getBearerToken() },
        });
        if (fileRes.url) {
          setFileUpload(fileRes.url);
          setUploadedFileName(files[0].name);
          setUploadSuccess(true);
          const title = generateTitleFromFilename(files[0].name);
          setFormData((obj) => ({ ...obj, Name: title }));
          // toast.success("File uploaded successfully! 🎉");
        } else {
          toast.error("Upload failed. Try again.");
          removeFile(e);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Error uploading file.");
        removeFile(e);
      }
    } catch (error) {
      toast.error(error.message || "Unexpected error");
    }
  };

  const handleSubmitAddContact = async () => {
    if (!contactForm.name || !contactForm.email) return;
    const newContact = {
      name: contactForm.email,
      id: emails.length + 1
    };
    setEmails([...emails, newContact]);
    setAddContactOpen(false);
    setContactForm({ name: '', email: '', phone: '' });

    try {
      const payload = {
        Name: contactForm.name, Email: contactForm.email, Phone: contactForm.phone
      };

      await axios.post(API_ROUTES.ADD_CONTACTS, payload, {
        headers: { Authorization: getBearerToken() },
      });

      fetchSigners();

    } catch (error) {
      console.error("Failed to fetch signers:", error);
      toast.error("Could not load signers.");
    }
  };

  const validate = () => {
    let valid = true;
    let newErrors = { file: '', Name: '', Note: '' };
    if (!fileupload) {
      newErrors.file = 'Please upload a PDF file.';
      valid = false;
    }
    if (!formData.Name || formData.Name.trim() === '') {
      newErrors.Name = 'Document title is required.';
      valid = false;
    } else if (formData.Name.length > maxTitleLength) {
      newErrors.Name = `Document title is too long (max ${maxTitleLength} characters).`;
      valid = false;
    }
    if (!formData.Note || formData.Note.trim() === '') {
      newErrors.Note = 'Note is required.';
      valid = false;
    } else if (formData.Note.length > maxNoteLength) {
      newErrors.Note = `Note is too long (max ${maxNoteLength} characters).`;
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validate()) return;
    setIsSubmit(true);
    try {
      const payload = {
        isChecked: true,
        isTourEnabled: true,
        TimeToCompleteDays: 10,
        SendinOrder: formData.sendInOrder,
        IsTourEnabled: true,
        AllowModifications: false,
        // Signers: selectedSigners.map((item) => ({ objectId: item.id })),
        Signers: [],
        url: fileupload,
        name: formData?.Name,
        note: formData?.Note,
      }

      const { data } = await axios.post(
        API_ROUTES.AFTER_SAVE_DOCUMENT,
        payload,
        { headers: { Authorization: getBearerToken() } }
      );

      if (data?.data?._id) {
        // toast.success("Document created successfully.");
        navigate(`/digital-signature/placeholder-sign/${data?.data?._id}`);
      }
      // Submit logic here (update as needed for your backend)
      toast.success("Document ready for signing.");
      // navigate or reset as needed
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmit(false);
    }
  };

  const handleCancel = () => {
    navigate("/digital-signature");
  };

  // const handleOpenAddContact = () => setAddContactOpen(true);
  const handleCloseAddContact = () => setAddContactOpen(false);
  const handleResetAddContact = () => setContactForm({ name: '', email: '', phone: '' });

  const fetchSigners = async () => {
    try {
      const { data } = await axios.get(API_ROUTES.GET_SIGNERS, {
        headers: { Authorization: getBearerToken() },
      });
      // Assuming API returns an array of { email, id } or similar
      const formattedEmails = data.map((signer, index) => ({
        email: signer.Email,
        name: signer.Name,
        id: signer._id || index + 1, // Use index if id isn't available
      }));
      setEmails(formattedEmails);
    } catch (error) {
      console.error("Failed to fetch signers:", error);
      toast.error("Could not load signers.");
    }
  };

  useEffect(() => {
    fetchSigners();
  }, []);

  // Auto-populate form when coming from template generation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const templateUrl = searchParams.get('templateUrl');
    const documentTitle = searchParams.get('documentTitle');
    const documentNote = searchParams.get('documentNote');
    const fromTemplate = searchParams.get('fromTemplate');

    if (fromTemplate === 'true' && templateUrl && documentTitle) {
      // Auto-populate the form with template data
      setFormData(prev => ({
        ...prev,
        Name: documentTitle,
        Note: documentNote || "Please review and sign this document",
        file: "template-generated" // Set a dummy file value to enable the button
      }));
      
      // Set the uploaded file URL
      setFileUpload(templateUrl);
      setUploadedFileName(documentTitle);
      setUploadSuccess(true);
      
      // Show success message
      toast.success("Template loaded successfully! 🎉");
      
      // Clear the URL parameters to avoid re-population on refresh
      navigate('/digital-signature/request-signature', { replace: true });
    }
  }, [location.search, navigate]);
const toast = useAppToast(); 
  return (
    <Fade in={true} timeout={500}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          mt: 2
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Request signatures
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Use this form to request signatures from others and yourself together.
        </Typography>
        {isSubmit ? (
          <Box height="300px" display="flex" alignItems="center" justifyContent="center">
            <Loader />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon sx={{ color: 'green', fontSize: 28 }} />
              Upload Document (PDF only)
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </Typography>
            <Box
              sx={{
                border: '2px dashed #16a34a',
                borderRadius: 3,
                textAlign: 'center',
                py: 3,
                mb: 1,
                cursor: 'pointer',
                background: uploadSuccess ? '#f0fdf4' : '#fff',
                transition: 'all 0.3s',
                '&:hover': { 
                  background: uploadSuccess ? '#f0fdf4' : '#f6fef9',
                  borderColor: uploadSuccess ? '#16a34a' : '#a78bfa'
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
              onClick={() => !uploadSuccess && inputFileRef.current && inputFileRef.current.click()}
            >
              {uploadSuccess ? (
                <>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }} onClick={(e) => {
                    e.stopPropagation();
                    setUploadSuccess(false);
                    setFileUpload("");
                    setUploadedFileName("");
                    if (inputFileRef.current) inputFileRef.current.value = "";
                  }}>
                    <CloseIcon sx={{ color: '#16a34a' }} />
                  </Box>
                  <DescriptionIcon sx={{ color: '#16a34a', fontSize: 48, mb: 1 }} />
                  <Typography sx={{ color: '#16a34a', fontWeight: 600, fontSize: '1.2rem', mb: 0.5 }}>
                    File Uploaded Successfully!
                  </Typography>
                  <Typography sx={{ color: '#222', fontSize: '1rem', mb: 1 }}>
                    {uploadedFileName}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadSuccess(false);
                      setFileUpload("");
                      setUploadedFileName("");
                      if (inputFileRef.current) inputFileRef.current.value = "";
                    }}
                    sx={{
                      borderColor: '#16a34a',
                      color: '#16a34a',
                      '&:hover': {
                        borderColor: '#15803d',
                        backgroundColor: 'rgba(22, 163, 74, 0.04)'
                      }
                    }}
                  >
                    Change File
                  </Button>
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ color: '#a78bfa', fontSize: 48, mb: 1 }} />
                  <Typography sx={{ color: '#a78bfa', fontWeight: 600, fontSize: '1.2rem', mb: 0.5 }}>
                    Drag & Drop or Click to Upload
                  </Typography>
                  <Typography sx={{ color: '#222', fontSize: '1rem' }}>
                    Maximum file size: 10MB
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    ref={inputFileRef}
                    required
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </Box>
            {errors.file && (
              <Typography sx={{ color: 'red', fontSize: '0.85rem', mb: 2, mt: -1 }}>{errors.file}</Typography>
            )}
            <TextField
              fullWidth
              size="small"
              name="Name"
              placeholder="Document Title *"
              value={formData.Name}
              onChange={handleStrInput}
              required
              sx={{ borderRadius: 1, mb: 0.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              error={!!errors.Name}
              helperText={errors.Name}
            />

            {/* Signers field */}
            {/* <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Signers<span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ flex: 1 }}>
                  <Multiselect
                    options={emails}
                    selectedValues={selectedSigners}
                    onSelect={(selectedList) => setSelectedSigners(selectedList)}
                    onRemove={(selectedList) => setSelectedSigners(selectedList)}
                    displayValue="email"
                    placeholder="Select signers..."
                    style={{
                      chips: {
                        background: '#a78bfa',
                        color: 'white',
                        marginRight: '4px',
                        padding: '4px 8px',
                        width: '100%',
                        maxWidth: '220px',
                        whiteSpace: 'nowrap',
                      },
                      searchBox: {
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px 8px 8px 4px',
                      },
                      optionContainer: {
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }
                    }}
                  />
                </Box>
                <IconButton
                  onClick={handleOpenAddContact}
                  sx={{ borderRadius: 1, ml: 1, border: '1px solid #eee', width: 40, height: 40 }}
                >
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#8657e5' }}>+</span>
                </IconButton>
              </Box>
            </Box> */}
            <TextField
              fullWidth
              size="small"
              name="Note"
              placeholder="Note *"
              value={formData.Note}
              onChange={handleStrInput}
              required
              multiline
              minRows={2}
              sx={{ borderRadius: 1, mb: 0.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              error={!!errors.Note}
              helperText={errors.Note}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendInOrder}
                  onChange={handleCheckboxChange}
                  name="sendInOrder"
                  sx={{
                    color: '#a78bfa',
                    '&.Mui-checked': {
                      color: '#7c3aed',
                    },
                  }}
                />
              }
              label="Send documents in order"
              sx={{ mb: 3 }}
            />
            <Box display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmit || !fileupload}
                size="medium"
                sx={{
                  borderRadius: 1,
                  fontWeight: 600,
                  backgroundColor: '#a78bfa',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#7c3aed' },
                  '&:disabled': { backgroundColor: '#e9d5ff' },
                }}
              >
                Continue
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                size="medium"
                sx={{
                  borderRadius: 1,
                  fontWeight: 600,
                  borderColor: '#a78bfa',
                  color: '#a78bfa',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(167, 139, 250, 0.04)'
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        )}
        <AddContactModal
          open={addContactOpen}
          onClose={handleCloseAddContact}
          onSubmit={handleSubmitAddContact}
          onReset={handleResetAddContact}
          form={contactForm}
          setForm={setContactForm}
        />
      </Paper>
    </Fade>
  );
};

export default RequestSignatureForm; 