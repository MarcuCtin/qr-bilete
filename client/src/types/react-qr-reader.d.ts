declare module "react-qr-reader" {
    import * as React from "react";
  
    export interface QrReaderProps {
      delay?: number;
      onError?: (error: any) => void;
      onScan?: (data: string | null) => void;
      style?: React.CSSProperties;
      facingMode?: "user" | "environment";
    }
  
    const QrReader: React.FC<QrReaderProps>;
    export default QrReader;
  }
  