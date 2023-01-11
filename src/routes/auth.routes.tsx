import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {SignIn} from '../screens/SignIn';

const {Screen,Navigator} = createNativeStackNavigator();
export const AuthRoutes: React.FC = () => {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen
        name="SignIn"
        component={SignIn}
      />
    </Navigator>

  );
}

