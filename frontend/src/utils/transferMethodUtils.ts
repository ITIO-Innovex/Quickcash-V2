// Utility functions for automatic transfer method selection

// European countries that support SEPA transfers
export const SEPA_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  'CH', // Switzerland (SEPA participant)
  'NO', // Norway (SEPA participant)
  'LI', // Liechtenstein (SEPA participant)
  'IS', // Iceland (SEPA participant)
  'MC', // Monaco (SEPA participant)
  'SM', // San Marino (SEPA participant)
  'VA', // Vatican City (SEPA participant)
  'AD', // Andorra (SEPA participant)
];

// Countries that support ACH transfers (primarily US)
export const ACH_COUNTRIES = [
  'US', // United States
];

// Transfer method selection logic
export interface TransferMethodConfig {
  methodId: 'sepa' | 'swift' | 'ach';
  title: string;
  description: string;
  fee: number;
  time: string;
  region: string;
  currency: string;
}

export const TRANSFER_METHODS: Record<string, TransferMethodConfig> = {
  sepa: {
    methodId: 'sepa',
    title: 'SEPA Transfer',
    description: 'Single Euro Payments Area',
    fee: 3.50,
    time: '1-2 business days',
    region: 'Europe (Eurozone)',
    currency: 'EUR'
  },
  swift: {
    methodId: 'swift',
    title: 'SWIFT Wire',
    description: 'International wire transfer',
    fee: 15.00,
    time: '1-5 business days',
    region: 'Global',
    currency: 'Any currency'
  },
  ach: {
    methodId: 'ach',
    title: 'ACH Transfer',
    description: 'Automated Clearing House',
    fee: 2.00,
    time: '1-3 business days',
    region: 'United States',
    currency: 'USD'
  }
};

/**
 * Automatically determine the best transfer method based on destination country and currency
 * @param destinationCountry - ISO 2-letter country code
 * @param destinationCurrency - Currency code
 * @returns TransferMethodConfig for the recommended method
 */
export const getRecommendedTransferMethod = (
  destinationCountry: string,
  destinationCurrency: string
): TransferMethodConfig => {
  const countryCode = destinationCountry.toUpperCase();
  
  // For EUR currency, always recommend SEPA
  if (destinationCurrency === 'EUR') {
    return TRANSFER_METHODS.sepa;
  }
  
  // For USD currency, always recommend ACH
  if (destinationCurrency === 'USD') {
    return TRANSFER_METHODS.ach;
  }
  
  // Default to SWIFT for all other currencies
  return TRANSFER_METHODS.swift;
};

/**
 * Get all available transfer methods for a destination
 * @param destinationCountry - ISO 2-letter country code
 * @param destinationCurrency - Currency code
 * @returns Array of available transfer methods
 */
export const getAvailableTransferMethods = (
  destinationCountry: string,
  destinationCurrency: string
): TransferMethodConfig[] => {
  const countryCode = destinationCountry.toUpperCase();
  const methods: TransferMethodConfig[] = [];
  
  // For EUR currency, show only SEPA if country supports it
  if (destinationCurrency === 'EUR') {
    if (SEPA_COUNTRIES.includes(countryCode)) {
      methods.push(TRANSFER_METHODS.sepa);
    } else {
      // If country doesn't support SEPA but currency is EUR, still show SEPA
      methods.push(TRANSFER_METHODS.sepa);
    }
  }
  // For USD currency, show only ACH if country supports it
  else if (destinationCurrency === 'USD') {
    if (ACH_COUNTRIES.includes(countryCode)) {
      methods.push(TRANSFER_METHODS.ach);
    } else {
      // If country doesn't support ACH but currency is USD, still show ACH
      methods.push(TRANSFER_METHODS.ach);
    }
  }
  // For all other currencies, show SWIFT as universal option
  else {
    methods.push(TRANSFER_METHODS.swift);
  }
  
  return methods;
};

/**
 * Check if a country supports a specific transfer method
 * @param countryCode - ISO 2-letter country code
 * @param methodId - Transfer method ID
 * @returns boolean indicating support
 */
export const isTransferMethodSupported = (
  countryCode: string,
  methodId: string
): boolean => {
  const code = countryCode.toUpperCase();
  
  switch (methodId) {
    case 'sepa':
      return SEPA_COUNTRIES.includes(code);
    case 'ach':
      return ACH_COUNTRIES.includes(code);
    case 'swift':
      return true; // SWIFT is universal
    default:
      return false;
  }
};

/**
 * Get transfer method details by ID
 * @param methodId - Transfer method ID
 * @returns TransferMethodConfig or null if not found
 */
export const getTransferMethodById = (methodId: string): TransferMethodConfig | null => {
  return TRANSFER_METHODS[methodId] || null;
};

/**
 * Calculate estimated arrival date based on transfer method
 * @param methodId - Transfer method ID
 * @returns Date string
 */
export const getEstimatedArrivalDate = (methodId: string): string => {
  const today = new Date();
  let daysToAdd = 3; // default
  
  switch (methodId) {
    case 'sepa':
      daysToAdd = 2;
      break;
    case 'swift':
      daysToAdd = 5;
      break;
    case 'ach':
      daysToAdd = 3;
      break;
    default:
      daysToAdd = 3;
  }
  
  const arrival = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return arrival.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}; 