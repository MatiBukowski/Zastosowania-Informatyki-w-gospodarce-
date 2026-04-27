import { QRCodeCanvas } from 'qrcode.react';
import { ITableQRProps } from '../context/interfaces';
import { Box, Typography, Button, Paper } from '@mui/material';

export const TableQR = ({ token, table_number }: ITableQRProps) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const scanUrl = `${baseUrl}/api/scan?token=${token}`;

  const downloadPNG = () => {
    const canvas = document.getElementById(`qr-${token}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `table_${table_number}_qr.png`;
      downloadLink.click();
    }
  };

  return (
    <Paper elevation={3} sx={qrStyles.paper}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Table #{table_number}
      </Typography>

      <Box sx={qrStyles.qrWrapper}>
        <QRCodeCanvas id={`qr-${token}`} value={scanUrl} size={180} level={"H"} includeMargin={false} />
        <Typography variant="caption" sx={qrStyles.urlLabel}>
          {scanUrl}
        </Typography>
      </Box>

      <Button variant="outlined" fullWidth onClick={downloadPNG} sx={{ mt: 2 }}>
        Save PNG
      </Button>
    </Paper>
  );
};


const qrStyles = {
  paper: {
    p: 3,
    textAlign: 'center',
    borderRadius: 2,
    bgcolor: 'background.paper',
    maxWidth: 250,
    margin: 'auto'
  },
  qrWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    bgcolor: 'white',
    p: 1,
    borderRadius: 1,
    border: '1px solid #eee'
  },
  urlLabel: {
    mt: 2,
    fontSize: '0.65rem',
    wordBreak: 'break-all',
    color: 'text.disabled',
    fontFamily: 'monospace',
    lineHeight: 1.2,
    px: 1
  }
};