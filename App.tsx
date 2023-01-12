import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import React from 'react';
import {StatusBar} from 'react-native';
import {ThemeProvider} from 'styled-components';
import {Loading} from './src/components/Loading';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';


import {Routes} from './src/routes';

import {AuthProvider, useAuth} from './src/hooks/auth';

export default function App() {

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const {userStorageLoading} = useAuth();
  
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <ThemeProvider theme={theme}>
        <StatusBar 
            barStyle="light-content"
            backgroundColor="transparent"
            translucent={true}
        />

        {
          (!fontsLoaded || userStorageLoading) ?
            <Loading/>
          :
            <AuthProvider>
              <Routes />
            </AuthProvider>
        }
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

