import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  flattenPdf,
  generatePdfName,
  generateTitleFromFilename,
  getBearerToken,
  getFileName,
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

const SuccessBox = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.success.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.success.light + '10',
  transition: 'all 0.3s ease',
  animation: 'fadeIn 0.5s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
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

const SignYourselfForm = () => {
  const inputFileRef = useRef(null);
  const toast = useAppToast(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Name: "",
    Note: "Note to myself",
    password: "",
    file: "",
  });
  const [emails, setEmails] = useState([]);
  const [fileupload, setFileUpload] = useState("");
  const [fileload, setfileload] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [isSubmit, setIsSubmit] = useState(false);

  const handleStrInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    setfileload(false);
    setpercentage(0);
    if (e) e.target.value = "";
  };

  const handleFileInput = async (e) => {
    setpercentage(0);
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
      setfileload(true);

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
          setfileload(false);
          const title = generateTitleFromFilename(files[0].name);
          setFormData((obj) => ({ ...obj, Name: title }));
          toast.success("File uploaded successfully.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fileupload) {
      toast.error("Please upload a file to proceed.");
      return;
    }

    if (formData?.Name?.length > maxTitleLength) {
      toast.error("Document title is too long.");
      return;
    }

    if (formData?.Note?.length > maxNoteLength) {
      toast.error("Note is too long.");
      return;
    }

    setIsSubmit(true);
    try {
      const payload = {
        name: formData?.Name,
        url: fileupload,
        note: formData?.Note,
        signers: emails,
      };

      const { data } = await axios.post(
        API_ROUTES.AFTER_SAVE_DOCUMENT,
        payload,
        { headers: { Authorization: getBearerToken() } }
      );

      if (data?.data?._id) {
        handleReset();
        toast.success("Document created successfully.");
        navigate(`/digital-signature/sign-yourself/${data?.data?._id}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmit(false);
    }
  };

  const handleReset = () => {
    setFormData({
      Name: "",
      Note: "Note to myself",
      password: "",
      file: "",
    });
    setEmails([]);
    removeFile();
    setFileUpload("");
  };

  const handleCancel = () => {
    navigate("/digital-signature");
  };

  return (
    <Fade in={true} timeout={500}>
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          mt: 2
        }}
      >
        <Title title="Sign Yourself" />
        {isSubmit ? (
          <Box height="300px" display="flex" alignItems="center" justifyContent="center">
            <Loader />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Zoom in={true} timeout={500}>
              <Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ 
                    mb: 4,
                    opacity: 0.8,
                    lineHeight: 1.6
                  }}
                >
                  Upload a document and sign it yourself securely
                </Typography>

                {fileload && (
                  <Box display="flex" alignItems="center" gap={2} my={2}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ 
                        width: { xs: "200px", md: "400px" },
                        height: 8,
                        borderRadius: 4,
                      }}
                    />
                    <Typography variant="caption">{percentage}%</Typography>
                  </Box>
                )}

                <Box mt={3}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2
                    }}
                  >
                    <CloudUploadIcon color="primary" />
                    Upload Document (PDF only) <span style={{ color: "red" }}>*</span>
                  </Typography>
                  
                  {fileupload.length > 0 ? (
                    <Zoom in={true}>
                      <SuccessBox>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                          <Typography variant="h6" color="success.main" fontWeight={600}>
                            Document Uploaded Successfully!
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2 }}>
                            <DescriptionIcon color="primary" />
                            <Typography variant="body1" noWrap>
                              {getFileName(fileupload)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            You can now proceed with signing the document
                          </Typography>
                        </Box>
                      </SuccessBox>
                    </Zoom>
                  ) : (
                    <UploadBox onClick={() => inputFileRef.current?.click()}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileInput}
                        ref={inputFileRef}
                        required
                        style={{ display: 'none' }}
                      />
                      <CloudUploadIcon sx={{ 
                        fontSize: 40, 
                        color: '#8657e5', 
                        mb: 2,
                        opacity: 0.9
                      }} />
                      <Typography variant="h6" gutterBottom sx={{ color: '#8657e5', fontWeight: 400 }}>
                        Drag & Drop or Click to Upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                        Maximum file size: {maxFileSize}MB
                      </Typography>
                    </UploadBox>
                  )}
                </Box>

                <Box mt={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="Name"
                    label="Document Title"
                    value={formData.Name}
                    onChange={handleStrInput}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontSize: '0.9rem'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem'
                      }
                    }}
                  />
                </Box>

                <Box mt={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="Note"
                    label="Note"
                    value={formData.Note}
                    onChange={handleStrInput}
                    required
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontSize: '0.9rem'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem'
                      }
                    }}
                  />
                </Box>

              

                <Box display="flex" gap={2} mt={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmit || !fileupload}
                    size="medium"
                    sx={{
                      borderRadius: 1,
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      backgroundColor: '#8657e5',
                      '&:hover': {
                        backgroundColor: '#6f47c4'
                      },
                      '&:disabled': {
                        backgroundColor: '#b39ddb'
                      }
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
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      borderColor: '#8657e5',
                      color: '#8657e5',
                      '&:hover': {
                        borderColor: '#6f47c4',
                        backgroundColor: 'rgba(134, 87, 229, 0.04)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Zoom>
          </form>
        )}
      </Paper>
    </Fade>
  );
};

export default SignYourselfForm;
