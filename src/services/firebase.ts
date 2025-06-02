import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {Platform} from 'react-native';
import {Location} from './locationService';
import {Asset} from 'react-native-image-picker';
import RNFS from 'react-native-fs'; // 👈 Needed for content:// handling

export async function uploadPhotoAndMetadata(photo: Asset, location: Location) {
  if (!photo.uri) throw new Error('Photo URI is missing');

  let path = photo.uri;

  if (Platform.OS === 'android' && path.startsWith('content://')) {
    const destPath = `${RNFS.TemporaryDirectoryPath}/${
      photo.fileName ?? `temp_${Date.now()}.jpg`
    }`;
    await RNFS.copyFile(path, destPath);
    path = destPath;
  }

  if (path.startsWith('file://')) {
    path = path.replace('file://', '');
  }

  // path
  const fileName = `photos/${Date.now()}_${photo.fileName ?? 'image'}.jpg`;
  const ref = storage().ref(fileName);

  console.log('[upload] Starting uploadPhotoAndMetadata');
  console.log('[upload] Path:', path);

  // uploading to Firebase
  await ref.putFile(path);
  console.log('[upload] File uploaded to Firebase Storage');

  // gwt download url
  const downloadURL = await ref.getDownloadURL();
  console.log('[upload] Got download URL:', downloadURL);

  // storing metadata in firestore
  await firestore().collection('photos').add({
    imageUrl: downloadURL,
    location,
    timestamp: Date.now(),
  });
  console.log('[upload] Metadata written to Firestore');
}
