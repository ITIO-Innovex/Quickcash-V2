
import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Upload } from 'lucide-react';
import { SxProps, Theme } from '@mui/material';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  acceptedFormats?: string;
  sx?: SxProps<Theme>; 
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  acceptedFormats = '.jpg,.jpeg,.png,.pdf',
  sx,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <Box
      className="file-upload-container"
      sx={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#f9f9f9',
        '&:hover': {
          backgroundColor: '#f5f5f5',
          borderColor: '#483594',
        },
        ...sx
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleUploadClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <Box className="file-upload-content">
        <IconButton className="upload-icon" sx={{ color: '#483594' }}>
          <Upload size={24} />
        </IconButton>
        
        {selectedFile ? (
          <Typography className="file-name" sx={{ mt: 1 }}>
            {selectedFile.name}
          </Typography>
        ) : (
          <Typography className="upload-text" sx={{ mt: 1 }}>
            Drag & Drop or Browse
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FileUpload;
