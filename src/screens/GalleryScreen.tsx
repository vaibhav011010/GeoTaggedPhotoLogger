import React, {useEffect, useState} from 'react';
import {
  Linking,
  TouchableOpacity,
  FlatList,
  Image as RNImage,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Box, Text, Spinner} from '@/components/ui';

type PhotoData = {
  id: string;
  imageUrl: string;
  location: {lat: number; lng: number};
  timestamp: number;
};

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
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
            timestamp: d.timestamp || Date.now(),
          };
        });

        setPhotos(data);
      } catch (err) {
        console.error('Error fetching photos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(err =>
      console.error('Failed to open Google Maps:', err),
    );
  };

  const renderItem = ({item}: {item: PhotoData}) => (
    <TouchableOpacity
      onPress={() => openInGoogleMaps(item.location.lat, item.location.lng)}>
      <Box className="flex-row items-center bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <RNImage
          source={{uri: item.imageUrl}}
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            marginRight: 16,
          }}
          resizeMode="cover"
        />
        <Box className="flex-1 space-y-1">
          <Text className="text-base font-semibold text-textDark">
            📍 {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
          </Text>
          <Text className="text-sm text-textMuted">
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          <Text className="text-xs text-blue-500">
            Tap to open in Google Maps
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-backgroundLight">
        <Spinner />
        <Text className="mt-2 text-textMuted">Loading gallery...</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-backgroundLight px-4 pt-4">
      <FlatList
        data={photos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}
