export interface DocumentDetails {
    _id: string;
    createdAt: string;
    updatedAt: string;
    Name: string;
    Note: string;
    URL: string;
    IsCompleted: boolean;
    CreatedBy: UserDetails;
    Signers: Signer[];
    SignatureType: SignatureType[];
    Placeholders: Placeholder[];
    SentToOthers: boolean;
    ExpiryDate: {
      iso: string;
      __type: string;
    };
    SignedUrl: string;
    SendMail: boolean;
    AuditTrail: AuditTrailEntry[];
    DeclineReason: string;
    Viewers: Viewer[];
    ExtUserPtr: UserDetails;
    objectId: string;
  }
  
  export interface UserDetails {
    _id: string;
    name?: string;
    Name?: string;
    email?: string;
    Email?: string;
    password?: string;
    Password?: string;
    mobile?: number;
    Mobile?: number;
    address?: string;
    Address?: string;
    gender?: string | null;
    Gender?: string | null;
    city?: string;
    City?: string;
    state?: string;
    State?: string;
    country?: string;
    Country?: string;
    defaultCurrency?: string;
    DefaultCurrency?: string;
    status?: boolean;
    Status?: boolean;
    suspend?: boolean;
    Suspend?: boolean;
    kycstatus?: boolean;
    Kycstatus?: boolean;
    postalcode?: string;
    Postalcode?: string;
    ownerTitle?: string;
    OwnerTitle?: string;
    ownertaxid?: string;
    Ownertaxid?: string;
    owneridofindividual?: string;
    Owneridofindividual?: string;
    ownerbrd?: string;
    Ownerbrd?: string;
    ownerProfile?: string;
    OwnerProfile?: string;
    vaultAccountId?: string;
    VaultAccountId?: string;
    resetToken?: string;
    ResetToken?: string;
    referalCode?: string;
    ReferalCode?: string;
    createdAt?: string;
    CreatedAt?: string;
    updatedAt?: string;
    UpdatedAt?: string;
    __v?: number;
    digitalSignature?: string;
    DigitalSignature?: string;
    digitalSignaturePrivateKey?: string;
    DigitalSignaturePrivateKey?: string;
  }
  
  export interface Signer {
    _id: string;
    UserRole: string;
    TourStatus: string[];
    Name: string;
    Phone: string;
    Email: string;
    CreatedBy: string;
    IsDeleted: boolean;
    UserId: string;
    createdAt: string;
    updatedAt: string;
    objectId: string;
    __v: number;
  }
  
  export interface SignatureType {
    name: string;
    enabled: boolean;
  }
  
  export interface Placeholder {
    Id: number;
    blockColor: string;
    signerPtr: {
      __type: string;
      className: string;
      objectId: string;
    };
    signerObjId: string;
    placeHolder: {
      pageNumber: number;
      pos: Position[];
    }[];
  }
  
  export interface Position {
    xPosition: number;
    yPosition: number;
    isStamp: boolean;
    key: number;
    scale: number;
    zIndex: number;
    type: string;
    options: {
      name: string;
      status: string;
    };
    Width: number;
    Height: number;
  }
  
  export interface AuditTrailEntry {
    SignedUrl: string;
    Activity: string;
    ipAddress: string;
    SignedOn: string;
    Signature: string;
    UserDetails: Signer;
    UserPtr: Signer;
    _id: string;
  }
  
  export interface Viewer {
    signerId: string;
    viewedAt: string;
    _id: string;
  }
  