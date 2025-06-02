import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import type {RouteProp} from '@react-navigation/native';

import CameraScreen from './screens/CameraScreen';
import MapScreen from './screens/MapScreen';
import GalleryScreen from './screens/GalleryScreen';

import {
  Camera,
  Map as MapIcon,
  Image as GalleryIcon,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <GluestackUIProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Camera"
          screenOptions={({
            route,
          }: {
            route: RouteProp<Record<string, object | undefined>, string>;
          }) => ({
            headerShown: true,
            tabBarStyle: {backgroundColor: '#1f2937'},
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarIcon: ({
              color,
              size,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => {
              switch (route.name) {
                case 'Camera':
                  return <Camera color={color} size={size ?? 24} />;
                case 'Map':
                  return <MapIcon color={color} size={size ?? 24} />;
                case 'Gallery':
                  return <GalleryIcon color={color} size={size ?? 24} />;
                default:
                  return null;
              }
            },
          })}>
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{tabBarLabel: 'Camera'}}
          />
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{tabBarLabel: 'Map'}}
          />
          <Tab.Screen
            name="Gallery"
            component={GalleryScreen}
            options={{tabBarLabel: 'Gallery'}}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GluestackUIProvider>
  );
};

export default AppNavigator;
