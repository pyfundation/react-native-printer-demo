import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  NetPrinterEventEmitter,
  RN_THERMAL_RECEIPT_PRINTER_EVENTS,
} from 'react-native-thermal-receipt-printer';
import {SelectedPrinter, PORT, DevicesEnum} from './HomeScreen';
import Loading from '../Loading';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import { navigate } from "./App";

interface DeviceType {
  host: string;
  port: number;
}

export default function FindPrinter() {
  const navigation = useNavigation();
  const [devices, setDevices] = React.useState<DeviceType[]>([]);
  const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
    {
      // device_name: 'My Net Printer',
      // host: '192.168.0.200', // your host
      // port: PORT, // your port
      // printerType: DevicesEnum.net,
    },
  );
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    setLoading(true);
    NetPrinterEventEmitter.addListener(
      RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
      (printers: DeviceType[]) => {
        if (printers) {
          console.log({printers});
          setLoading(false);
          setDevices({
            ...printers,
          });
        }
      },
    );
    NetPrinterEventEmitter.addListener(
      RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_ERROR,
      error => {
        setLoading(false);
        console.log({error});
      },
    );
    return () => {
      NetPrinterEventEmitter.removeAllListeners(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
      );
      NetPrinterEventEmitter.removeAllListeners(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_ERROR,
      );
    };
  }, []);

  if (loading) {
    return <Loading loading={true} />;
  }

  const onSelectedPrinter = (printers: any) => {
    setSelectedPrinter({
      device_name: 'My Net Printer',
      host: printers.host, // your host
      port: PORT, // your port
      printerType: DevicesEnum.net,
    });
    navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Picker selectedValue={selectedPrinter} onValueChange={onSelectedPrinter}>
        {devices !== undefined &&
          devices?.length > 0 &&
          devices?.map((item: any, index) => (
            <Picker.Item
              label={item.host}
              value={item}
              key={`printer-item-${index}`}
            />
          ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
