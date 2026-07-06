import { icons } from "@/constants/icons";
import { AppErrorBoundary } from "@/providers/error-boundary";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';

const SafeAreaView = styled(RNSafeAreaView);

export default function MapScreen() {
  const { latitude, longitude } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
  }>();
  const [resetKey, setResetKey] = useState(0);

  return (
    <AppErrorBoundary
      boundaryName="property_map"
      resetKeys={[latitude, longitude, resetKey]}
      onReset={() => setResetKey((key) => key + 1)}
      fallbackTitle="Map could not load"
      fallbackMessage="We could not render this location view. Try again, or go back to the property details."
    >
      <MapScreenContent key={`${latitude}-${longitude}-${resetKey}`} />
    </AppErrorBoundary>
  );
}

function MapScreenContent() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();
  const router = useRouter();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.001
  }%2C${lat - 0.001}%2C${lng + 0.001}%2C${
    lat + 0.001
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <View className="map-screen-container">
        <Pressable
          onPress={() => router.back()}
          className="property-header-btn"
        >
          <Image
            source={icons.back_arrow}
            alt="back icon"
            className="w-full h-full"
          />
        </Pressable>

        <View className="flex-1 mx-3">
          <Text className="property-location-title" numberOfLines={1}>
            {title}
          </Text>
          <Text className="property-location-text " numberOfLines={1}>
            {address}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
          }
          className="flex-row items-center gap-1 bg-accent/5 px-3 py-2 rounded-full border border-accent"
        >
          <Ionicons name="navigate-outline" size={14} color="#2563EB" />
          <Text className="text-accent text-xs font-semibold">Google Maps</Text>
        </Pressable>
      </View>

      {/* Full Screen Map */}
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: mapUrl }}
          style={{ flex: 1 }}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>
    </SafeAreaView>
  );
}
