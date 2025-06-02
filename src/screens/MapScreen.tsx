import React, {useEffect, useState, useCallback} from 'react';
import MapView, {Marker, Callout, PROVIDER_GOOGLE} from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import {Box, Text, Image, Spinner} from '@/components/ui';
import {StyleSheet, PermissionsAndroid, Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

type PhotoData = {
  id: string;
  imageUrl: string;
  location: {lat: number; lng: number};
};

export default function MapScreen() {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs location access to show your position on the map',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const fetchPhotos = async () => {
        try {
          await requestLocationPermission();
          const snapshot = await firestore().collection('photos').get();
          const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              imageUrl: d.imageUrl,
              location: {
                lat: parseFloat(d.location?.lat),
                lng: parseFloat(d.location?.lng),
              },
            };
          });

          const validPhotos = data.filter(
            p => p.location && !isNaN(p.location.lat) && !isNaN(p.location.lng),
          );

          setPhotos(validPhotos);
        } catch (err) {
          console.error('Error fetching photos:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchPhotos();
    }, []),
  );

  useEffect(() => {
    setMapKey(prevKey => prevKey + 1);
  }, [photos]);

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-backgroundLight">
        <Spinner />
        <Text className="mt-2 text-textMuted">Loading photos...</Text>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box className="flex-1 justify-center items-center bg-backgroundLight">
        <Text className="text-textMuted">
          No photos found to show on the map.
        </Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-backgroundLight">
      <MapView
        key={mapKey}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: photos[0].location.lat,
          longitude: photos[0].location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}>
        {/* marker test */}
        {/* <Marker coordinate={{latitude: 21.1726, longitude: 72.7844}}>
          <Callout>
            <Text>Static Marker Test</Text>
          </Callout>
        </Marker> */}

        {/* Dynamic Markers */}
        {photos.map(photo => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.location.lat,
              longitude: photo.location.lng,
            }}>
            <Callout tooltip>
              <Box
                className="bg-white p-3 rounded-lg max-w-[200px]"
                style={{elevation: 3}}>
                <Image
                  source={{uri: photo.imageUrl}}
                  style={{
                    width: 150,
                    height: 100,
                    borderRadius: 6,
                    marginBottom: 4,
                  }}
                  resizeMode="cover"
                />
                <Text className="text-center">
                  📍 {photo.location.lat.toFixed(4)},{' '}
                  {photo.location.lng.toFixed(4)}
                </Text>
              </Box>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </Box>
  );
}
