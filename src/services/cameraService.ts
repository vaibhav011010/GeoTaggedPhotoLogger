// src/services/cameraService.ts
import {PermissionsAndroid, Platform} from 'react-native';
import {
  launchCamera,
  Asset,
  launchImageLibrary,
} from 'react-native-image-picker';

export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function takePhoto(): Promise<Asset | null> {
  return new Promise(resolve => {
    launchCamera({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel || response.errorCode) {
        resolve(null);
        return;
      }
      resolve(response.assets?.[0] || null);
    });
  });
}

export async function pickFromGallery(): Promise<Asset | null> {
  return new Promise(resolve => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel || response.errorCode) {
        resolve(null);
        return;
      }
      resolve(response.assets?.[0] || null);
    });
  });
}
