import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import HomeScreen from './HomeScreen';
import {View} from 'react-native';
import React from 'react';

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <View>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          {/*<Stack.Screen name="Details" component={DetailsScreen} />*/}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
