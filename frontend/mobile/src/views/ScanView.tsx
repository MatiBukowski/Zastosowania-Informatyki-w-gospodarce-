import { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useResolveTableByQrToken } from '@/hooks/useTables';
import { router } from 'expo-router/build/exports';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFill,
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default function ScanView() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const { table, loading, error } = useResolveTableByQrToken(qrToken || '');

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (qrToken) {
      if (table?.restaurant_id) {
        router.push(`/restaurants/${table.restaurant_id}/menu`);
      }
    }
  }, [qrToken]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const url = new URL(data);
      const token = url.searchParams.get('token');

      if (token) {
        setQrToken(token);
      } else {
        console.error("No token found in QR code data");
      }
    } catch (error) {
      console.error("Invalid URL format:", error);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={styles.camera}
      />
      {scanned && <Text style={styles.messageText}>Tap to scan again</Text>}
    </View>
  );
}