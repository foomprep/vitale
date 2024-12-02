import { useEffect, useRef, useState } from "react";
import { Camera, useCameraDevices, useCodeScanner } from "react-native-vision-camera";
import { getFoodItemByUpc } from "./network/nutrition";
import { StyleSheet, View, Text } from "react-native";
import { useModal } from "./ModalContext";
import MacroCalculator from "./MacroCalculator";
import { transformToProductResponse } from "./transform";

interface BarcodeScannerProps {
  cameraActive: boolean;
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  setLogActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const BarcodeScanner = ({ cameraActive, setCameraActive, setLogActive }: BarcodeScannerProps) => {
  const camera = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const { showModal } = useModal();

  const devices = useCameraDevices();
  const device = Object.values(devices).find(d => d.position === 'back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async (codes) => {
      setCameraActive(false);
      const upc = codes[0].value;
      if (upc) {
        const item = await getFoodItemByUpc(upc);
        const productResponse = transformToProductResponse(item);
        console.log(productResponse);
        showModal(<MacroCalculator setLogActive={setLogActive} productResponse={productResponse} />)
      }
    }
  });

  useEffect(() => {
    const checkPermission = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    };

    checkPermission();
  }, []);

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.textContainer]}>
        <Text style={styles.text}>No camera permission</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.textContainer]}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <Camera
      ref={camera}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={cameraActive}
      photo={true}
      codeScanner={codeScanner}
    />
  );
}

export default BarcodeScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 30,
    minWidth: 80,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
});
