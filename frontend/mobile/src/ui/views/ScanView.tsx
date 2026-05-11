import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useResolveTableByToken } from '@/hooks/useTables';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/ui/theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(width, height) * 0.7;
const CORNER_SIZE = 30;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanAreaContainer: {
    position: 'absolute',
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTopLeft: {
    top: -CORNER_THICKNESS,
    left: -CORNER_THICKNESS,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
  },
  cornerTopRight: {
    top: -CORNER_THICKNESS,
    right: -CORNER_THICKNESS,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
  },
  cornerBottomLeft: {
    bottom: -CORNER_THICKNESS,
    left: -CORNER_THICKNESS,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
  },
  cornerBottomRight: {
    bottom: -CORNER_THICKNESS,
    right: -CORNER_THICKNESS,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
  },
  statusContainer: {
    position: 'absolute',
    top: (height - SCAN_AREA_SIZE) / 2 + SCAN_AREA_SIZE + 60,
    left: (width - SCAN_AREA_SIZE) / 2,
    width: SCAN_AREA_SIZE,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusDefault: {
    color: '#333333',
  },
  statusLoading: {
    color: '#1976D2',
  },
  statusError: {
    color: '#D32F2F',
  },
  statusSubtext: {
    fontSize: 12,
    marginTop: 4,
    color: '#666666',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    padding: 8,
  },
});

const ScanOverlay = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayDark} />
      <TouchableOpacity
        style={[
          styles.backButton,
          {
            top: insets.top + 10,
            right: insets.right + 10,
          },
        ]}
        onPress={() => router.back()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
      </TouchableOpacity>
      <View
        style={[
          styles.scanAreaContainer,
          {
            top: (height - SCAN_AREA_SIZE) / 2,
            left: (width - SCAN_AREA_SIZE) / 2,
          },
        ]}
      >
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
      </View>
    </View>
  );
};

type ScanStatus = 'default' | 'loading' | 'error';

interface StatusDisplayProps {
  status: ScanStatus;
  error?: string;
}

const StatusDisplay = ({ status, error }: StatusDisplayProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          title: 'Processing QR Code...',
          subtitle: 'Please wait',
          textStyle: styles.statusLoading,
        };
      case 'error':
        return {
          title: 'Error',
          subtitle: error || 'Failed to scan QR code. Please try again.',
          textStyle: styles.statusError,
        };
      default:
        return {
          title: 'Scan QR Code',
          subtitle: 'Position code within the corners',
          textStyle: styles.statusDefault,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.statusContainer}>
      <Text style={[styles.statusText, config.textStyle]}>{config.title}</Text>
      <Text style={styles.statusSubtext}>{config.subtitle}</Text>
    </View>
  );
};

export default function ScanView() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('default');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { table, loading, error } = useResolveTableByToken(qrToken || '');
  const hasNavigatedRef = useRef(false);

  const resetScan = useCallback(() => {
    setScanned(false);
    setQrToken(null);
    setScanStatus('default');
    setErrorMessage('');
    hasNavigatedRef.current = false;
  }, []);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // When coming back from the menu (or refocusing this view), clear previous scan state
      // so the camera callback is re-enabled and we don't stick in "loading".
      resetScan();
      return () => {};
    }, [resetScan])
  );

  useEffect(() => {
    if (qrToken || loading) {
      setScanStatus('loading');
    }
  }, [qrToken, loading]);

  useEffect(() => {
    if (table?.restaurant_id && qrToken && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.push(`/restaurants/${table.restaurant_id}/menu`);
    }
  }, [table, qrToken]);

  useEffect(() => {
    if (error) {
      setScanStatus('error');
      setErrorMessage(error);
      // Reset error after 3 seconds
      const timer = setTimeout(() => {
        resetScan();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, resetScan]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setScanStatus('loading');
    try {
      const url = new URL(data);
      const token = url.searchParams.get('token');

      if (token) {
        setQrToken(token);
      } else {
        setScanStatus('error');
        setErrorMessage('No token found in QR code');
        setTimeout(() => {
          resetScan();
        }, 2000);
      }
    } catch (error) {
      setScanStatus('error');
      setErrorMessage('Invalid QR code format');
      setTimeout(() => {
        resetScan();
      }, 2000);
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
      <ScanOverlay />
      <StatusDisplay status={scanStatus} error={errorMessage} />
      {scanned && (
        <TouchableOpacity onPress={resetScan} activeOpacity={0.8}>
          <Text style={styles.messageText}>Tap to scan again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}