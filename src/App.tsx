import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import HomeScreen from './HomeScreen';
import React, {createRef} from 'react';

export const navigationRef = createRef<any>();

export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        {/*<Stack.Screen name="Details" component={DetailsScreen} />*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
