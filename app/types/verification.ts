export interface Discrepancy {
    id: string;
    field: string; // e.g., "Net Weight"
    blValue: string;
    invoiceValue?: string;
    packingListValue?: string;
    status: 'MATCH' | 'MISMATCH' | 'MISSING';
    severity: 'LOW' | 'HIGH' | 'CRITICAL'; // CRITICAL = Customs Fine Risk
}

export interface VerificationReport {
    containerId: string;
    blNumber: string;
    overallStatus: 'APPROVED' | 'REJECTED' | 'WARNING';
    score: number; // 0-100
    discrepancies: Discrepancy[];
    scanDate: string;
}
