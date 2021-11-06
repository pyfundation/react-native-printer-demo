import {Picker} from '@react-native-picker/picker';
import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
  IUSBPrinter,
  IBLEPrinter,
  INetPrinter,
} from 'react-native-thermal-receipt-printer';
import Loading from '../Loading';

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

export interface SelectedPrinter
  extends Partial<IUSBPrinter & IBLEPrinter & INetPrinter> {
  printerType?: keyof typeof printerList;
}

export const PORT: string = '9100';

export enum DevicesEnum {
  usb = 'usb',
  net = 'net',
  blu = 'blu',
}

const deviceWidth = Dimensions.get('window').width;
// const deviceHeight = Dimensions.get('window').height;

export default function HomeScreen() {
  const [selectedValue, setSelectedValue] = React.useState<
    keyof typeof printerList
  >(DevicesEnum.net);
  const [devices, setDevices] = React.useState([]);
  const [connected, setConnected] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
    {},
  );

  React.useEffect(() => {
    const getListDevices = async () => {
      const Printer = printerList[selectedValue];
      // get list device for net printers is support scanning in local ip but not recommended
      if (selectedValue === DevicesEnum.net) {
        await Printer.init();
      }
      try {
        setLoading(true);
        await Printer.init();
        const results = await Printer.getDeviceList();
        console.log({results});
        setDevices(
          results?.map((item: any) => ({...item, printerType: selectedValue})),
        );
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    getListDevices();
  }, [selectedValue]);

  const handlePort = (port?: string): string => {
    return ((Platform.OS === 'ios' ? port : parseInt(port || '9100')) ||
      '9100') as string;
  };

  const handleConnectSelectedPrinter = () => {
    console.log({selectedPrinter});
    if (!selectedPrinter) return;
    setLoading(true);
    const connect = async () => {
      try {
        switch (selectedPrinter.printerType) {
          case 'ble':
            await BLEPrinter.connectPrinter(
              selectedPrinter?.inner_mac_address || '',
            );
            break;
          case 'net':
            try {
              if (connected) {
                await NetPrinter.closeConn();
                setConnected(!connected);
              }
              const status = await NetPrinter.connectPrinter(
                selectedPrinter?.host || '',
                handlePort(selectedPrinter?.port),
              );
              setLoading(false);
              console.log('connect -> status', status);
              Alert.alert(
                'Connect successfully!',
                `Connected to ${status.device_name} !`,
              );
              setConnected(true);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'usb':
            await USBPrinter.connectPrinter(
              selectedPrinter?.vendor_id || '',
              selectedPrinter?.product_id || '',
            );
            break;
          default:
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    requestAnimationFrame(async () => {
      await connect();
    });
  };

  const handlePrint = async () => {
    console.log('printerList', printerList[selectedValue]);
    try {
      const Printer = printerList[selectedValue];
      await Printer.printText('<C>sample text</C>\n');
    } catch (err) {
      console.warn(err);
    }
  };

  const handleChangePrinterType = async (type: keyof typeof printerList) => {
    setSelectedValue(prev => {
      printerList[prev].closeConn();
      return type;
    });
    setSelectedPrinter({});
  };

  const _renderNet = () => (
    <>
      <TextInput />
    </>
  );

  const _renderOther = () => (
    <Picker selectedValue={selectedPrinter} onValueChange={setSelectedPrinter}>
      {devices !== undefined &&
        devices?.length > 0 &&
        devices?.map((item: any, index) => (
          <Picker.Item
            label={item.device_name}
            value={item}
            key={`printer-item-${index}`}
          />
        ))}
    </Picker>
  );

  return (
    <View style={styles.container}>
      {/* Printers option */}
      <View style={styles.section}>
        <Text>Select printer type: </Text>
        <Picker
          selectedValue={selectedValue}
          mode="dropdown"
          onValueChange={handleChangePrinterType}>
          {Object.keys(printerList).map((item, index) => (
            <Picker.Item
              label={item.toUpperCase()}
              value={item}
              key={`printer-type-item-${index}`}
            />
          ))}
        </Picker>
      </View>
      {/* Printers List */}
      <View style={styles.section}>
        <Text>Select printer: </Text>
        {selectedValue === 'net' ? _renderNet() : _renderOther()}
        {/* Buttons  */}
        <View
          style={{
            marginTop: 10,
          }}>
          <TouchableOpacity
            style={styles.button}
            // disabled={!selectedPrinter?.device_name}
            onPress={handleConnectSelectedPrinter}>
            <Text style={styles.text}>Connect</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: 10,
          }}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            // disabled={!selectedPrinter?.device_name}
            onPress={handlePrint}>
            <Text style={styles.text}>Print sample</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Loading loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {},
  rowDirection: {
    flexDirection: 'row',
  },
  button: {
    height: 40,
    width: deviceWidth / 1.5,
    alignSelf: 'center',
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontSize: 15,
  },
});
