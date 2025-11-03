
export interface SecurityFeature {
    name: string;
    status: 'verified' | 'suspicious' | 'not_found' | 'not_applicable';
}

export interface DocumentDetails {
    document_type: string;
    issuing_country: string;
    full_name?: string;
    document_number?: string;
    date_of_birth?: string;
    expiration_date?: string;
}

export interface VerificationResultData {
    overall_status: 'verified' | 'suspicious' | 'fraudulent' | 'unable_to_verify';
    confidence_score: number;
    details: DocumentDetails;
    security_features: SecurityFeature[];
    summary: string;
}


export interface ProgressState {
    percent: number;
    text: string;
}
