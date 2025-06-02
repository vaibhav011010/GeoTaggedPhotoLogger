// App.tsx
import '@react-native-firebase/app';
import React from 'react';
import './global.css';

import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import AppNavigator from './src/AppNavigator';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const App = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    <SafeAreaProvider>
      <GluestackUIProvider>
        <AppNavigator />
      </GluestackUIProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
