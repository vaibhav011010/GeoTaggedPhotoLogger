import React, {useState} from 'react';
import {Platform, Alert, PermissionsAndroid} from 'react-native';
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  ButtonText,
  Icon,
  CameraIcon,
  MapPinIcon,
  UploadIcon,
  Spinner,
} from '@/components/ui';
import {launchCamera, Asset} from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import {uploadPhotoAndMetadata} from '../services/firebase';
import {
  pickFromGallery,
  requestCameraPermission,
  takePhoto,
} from '@/services/cameraService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  requestLocationPermission,
  getCurrentLocation,
} from '../services/locationService';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

type Location = {lat: number; lng: number};

const UPLOAD_LIMIT = 10;
const UPLOAD_KEY = 'dailyUploadCount';

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function CameraScreen() {
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelectPhoto = async () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const captured = await takePhoto();
          if (captured) {
            setPhoto(captured);
            try {
              const coords = await getCurrentLocation();
              setLocation(coords);
            } catch {}
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const picked = await pickFromGallery();
          if (picked) {
            setPhoto(picked);
            try {
              const coords = await getCurrentLocation();
              setLocation(coords);
            } catch {}
          }
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleUpload = async () => {
    if (!photo || !location) return;

    const todayKey = getTodayKey();
    try {
      const existing = await AsyncStorage.getItem(UPLOAD_KEY);
      let uploadData = existing ? JSON.parse(existing) : {};

      const todayCount = uploadData[todayKey] ?? 0;

      if (todayCount >= UPLOAD_LIMIT) {
        Alert.alert('Limit Reached', 'You can only upload 10 photos per day.');
        return;
      }

      setUploading(true);

      console.log('Uploading...');
      await uploadPhotoAndMetadata(photo, location);

      uploadData[todayKey] = todayCount + 1;
      await AsyncStorage.setItem(UPLOAD_KEY, JSON.stringify(uploadData));

      Alert.alert('Success', 'Photo uploaded!');
      setPhoto(null);
      setLocation(null);
    } catch (e: any) {
      console.error('Upload error:', e);
      Alert.alert('Upload error', e.message || 'Something went wrong');
    } finally {
      console.log('Upload complete - resetting spinner');
      setUploading(false);
    }
  };

  return (
    <Box className="flex-1 bg-backgroundLight items-center justify-start pt-10 px-4">
      <VStack className="gap-6 w-full max-w-[400px] items-center">
        <Text className="text-2xl font-bold">Capture & Upload</Text>

        {/* preview */}
        <Box className="w-full aspect-square bg-backgroundDark rounded-xl items-center justify-center overflow-hidden">
          {photo ? (
            <Image
              source={{uri: photo.uri}}
              alt="Photo preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <VStack className="items-center justify-center">
              <Icon as={CameraIcon} className="text-textMuted mb-2" />
              <Text className="text-textMuted">No photo selected</Text>
            </VStack>
          )}
        </Box>

        {/* Coordinates */}
        {location && (
          <Box className="bg-backgroundDark px-4 py-2 rounded-lg">
            <Text className="text-text text-sm">
              📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </Text>
          </Box>
        )}

        {/* Buttons */}
        <VStack className="w-full gap-4 mt-4">
          <Button
            className="w-full"
            variant="solid"
            action="primary"
            onPress={handleSelectPhoto}>
            <Box className="flex-row items-center justify-center">
              <Icon as={CameraIcon} className="mr-2" />
              <ButtonText>Select or Take Photo</ButtonText>
            </Box>
          </Button>

          <Button
            className="w-full"
            variant="solid"
            action="positive"
            isDisabled={!photo || !location || uploading}
            onPress={handleUpload}>
            <Box className="flex-row items-center justify-center">
              {uploading ? (
                <Spinner className="mr-2" />
              ) : (
                <Icon as={UploadIcon} className="mr-2" />
              )}
              <ButtonText>Upload to Firebase</ButtonText>
            </Box>
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
