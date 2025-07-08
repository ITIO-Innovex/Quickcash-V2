import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { MapPin, Globe, Building2 } from 'lucide-react';
import CustomTextField from '@/components/CustomTextField';
import { TransferMethod, TransferFormData } from '@/api/transfer.api';

interface DynamicTransferFormProps {
  transferMethod: TransferMethod;
  formData: TransferFormData;
  onFormDataChange: (data: TransferFormData) => void;
  errors?: Record<string, string>;
  disabledFields?: string[];
}

const iconMap = {
  MapPin: MapPin,
  Globe: Globe,
  Building2: Building2,
};

const DynamicTransferForm: React.FC<DynamicTransferFormProps> = ({
  transferMethod,
  formData,
  onFormDataChange,
  errors = {},
  disabledFields = [],
}) => {
  const theme = useTheme();

  const handleFieldChange = (fieldName: string, value: any) => {
    onFormDataChange({
      ...formData,
      [fieldName]: value
    });
  };

  const IconComponent = iconMap[transferMethod.icon as keyof typeof iconMap];

  const renderField = (fieldName: string, fieldConfig: any) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    const isDisabled = disabledFields.includes(fieldName);

    switch (fieldConfig.type) {
      case 'text':
        return (
          <CustomTextField
            key={fieldName}
            fullWidth
            label={fieldConfig.label}
            placeholder={fieldConfig.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || fieldConfig.helperText}
            required={fieldConfig.required}
            disabled={isDisabled}
          />
        );

      case 'number':
        if (fieldName === 'amount' || fieldName === 'achAmount') {
          return (
            <CustomTextField
              key={fieldName}
              fullWidth
              label={fieldConfig.label}
              placeholder={fieldConfig.placeholder}
              type="number"
              value={value}
              error={!!error}
              helperText={error || fieldConfig.helperText}
              required={fieldConfig.required}
              inputProps={{
                min: fieldConfig.min || 0,
                max: fieldConfig.max || 999999.99,
                step: fieldConfig.step || 0.01
              }}
              disabled
            />
          );
        }
        return (
          <CustomTextField
            key={fieldName}
            fullWidth
            label={fieldConfig.label}
            placeholder={fieldConfig.placeholder}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || fieldConfig.helperText}
            required={fieldConfig.required}
            inputProps={{
              min: fieldConfig.min || 0,
              max: fieldConfig.max || 999999.99,
              step: fieldConfig.step || 0.01
            }}
            disabled={isDisabled}
          />
        );

      case 'date':
        return (
          <CustomTextField
            key={fieldName}
            fullWidth
            label={fieldConfig.label}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || fieldConfig.helperText}
            required={fieldConfig.required}
            disabled={isDisabled}
          />
        );

      case 'textarea':
        return (
          <CustomTextField
            key={fieldName}
            fullWidth
            label={fieldConfig.label}
            placeholder={fieldConfig.placeholder}
            multiline
            rows={fieldConfig.rows || 3}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || fieldConfig.helperText}
            required={fieldConfig.required}
            disabled={isDisabled}
          />
        );

      case 'select':
        if (fieldName === 'currency') {
          return (
            <CustomTextField
              key={fieldName}
              fullWidth
              label={fieldConfig.label}
              value={value}
              disabled
            />
          );
        }
        return (
          <FormControl key={fieldName} fullWidth error={!!error}>
            <InputLabel sx={{ color: theme.palette.text.primary }}>
              {fieldConfig.label}
            </InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              label={fieldConfig.label}
              disabled={isDisabled}
            >
              {fieldConfig.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {error}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const getGridSize = (fieldName: string) => {
    // Fields that should take full width
    const fullWidthFields = [
      'beneficiaryAddress',
      'bankAddress',
      'remittanceInfo',
      'transferMessage',
      'purpose'
    ];
    
    return fullWidthFields.includes(fieldName) ? 12 : 6;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {IconComponent && (
          <Box sx={{ mr: 1 }}>
            <IconComponent size={24} />
          </Box>
        )}
        <Box>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            {transferMethod.title} Details
          </Typography>
          <Typography variant="body2" className="form-subtitle">
            {transferMethod.description}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {Object.entries(transferMethod.formFields).map(([fieldName, fieldConfig]) => (
          <Grid item xs={12} md={getGridSize(fieldName)} key={fieldName}>
            {renderField(fieldName, fieldConfig)}
          </Grid>
        ))}
      </Grid>

      {/* Transfer Method Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Transfer Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Region
            </Typography>
            <Typography variant="body2">
              {transferMethod.region}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Currency
            </Typography>
            <Typography variant="body2">
              {transferMethod.currency}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Fee
            </Typography>
            <Typography variant="body2">
              ${transferMethod.fee.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Processing Time
            </Typography>
            <Typography variant="body2">
              {transferMethod.time}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DynamicTransferForm; 