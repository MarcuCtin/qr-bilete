import React, { useState } from "react";
import { Button, TextField, Box } from "@mui/material";
import axios from "axios";
import { QrReader } from "react-qr-reader";


function App() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleScan = async (data: string | null) => {
    if (data) {
      try {
        const response = await axios.post("http://localhost:4400/api/scan", { code: data });
        setScannedCode(data);
        setMessage(response.data.message);
      } catch (error: any) {
        setMessage(error.response?.data?.message || "Eroare la scanare.");
      }
    }
  };

  const allocateCode = async (name: string, surname: string) => {
    if (!scannedCode) return setMessage("Scanează un cod mai întâi.");
    try {
      const response = await axios.post("http://localhost:4400/api/allocate", {
        code: scannedCode,
        name,
        surname,
      });
      setMessage(response.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Eroare la alocare.");
    }
  };

  const validateCode = async () => {
    if (!scannedCode) return setMessage("Scanează un cod mai întâi.");
    try {
      const response = await axios.post("http://localhost:4400/api/validate", { code: scannedCode });
      setMessage(response.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Eroare la validare.");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <QrReader delay={300} onError={(err: any) => console.error(err)} onScan={handleScan} />
      <p>{message}</p>
      <TextField label="Nume" variant="outlined" />
      <TextField label="Prenume" variant="outlined" />
      <Button variant="contained" onClick={() => allocateCode("Nume", "Prenume")}>
        Alocare
      </Button>
      <Button variant="contained" color="secondary" onClick={validateCode}>
        Validare
      </Button>
    </Box>
  );
}

export default App;
