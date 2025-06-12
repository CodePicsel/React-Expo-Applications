import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './navigation/AuthStack';
import MainTab from './navigation/MainTab';
import PhileDetailScreen from './screens/PhileDetailScreen';

const Root = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Root.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}>

        {/* AuthStack holds Login & Signup */}
        <Root.Screen name="Auth" component={AuthStack} />

        {/* MainTabs is the bottom-tab flow */}
        <Root.Screen name="MainTab" component={MainTab} />
        <Root.Screen name="PhileDetail" component={PhileDetailScreen} />
      </Root.Navigator>
    </NavigationContainer>
  );
}