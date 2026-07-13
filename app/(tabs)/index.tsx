import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import "@/global.css";
import { useHomeProperties } from "@/hooks/useProperties";
import { AppErrorBoundary } from "@/providers/error-boundary";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function HomeScreen() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <AppErrorBoundary
      boundaryName="home"
      resetKeys={[resetKey]}
      onReset={() => setResetKey((key) => key + 1)}
      fallbackTitle="Home could not load"
      fallbackMessage="We could not render the latest property lists. Try again to reload this screen."
    >
      <HomeScreenContent key={resetKey} />
    </AppErrorBoundary>
  );
}

function HomeScreenContent() {
  const { user } = useUser();
  const router = useRouter();

  const {
    data,
    isError,
    isLoading,
    refetch,
  } = useHomeProperties();

  const featured = data?.featured ?? [];
  const recommended = data?.recommended ?? [];

  function onUnsave() {}

  return (
    <SafeAreaView className="screen-safe-area" accessibilityLabel="Home Screen">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="list-header-container">
            {/* Header -------- */}
            <View className="home-header">
              <Image
                source={images.default_avatar_male}
                alt="admin avatar image"
                className="home-header-avatar"
              />
              <Text className="home-header-title" numberOfLines={1}>
                {user?.fullName || "Joni Dev"}
              </Text>
            </View>

            {/* Search Bar -------- */}
            <Pressable
              onPress={() => router.push("/(tabs)/search")}
              className="home-search-box"
            >
              <View className="home-search-inputfield">
                <Image
                  source={icons.input_search}
                  alt="search icon"
                  className="home-search-icon"
                />
                <Text className="home-search-placeholder" numberOfLines={1}>
                  {" "}
                  Search properties, cities...
                </Text>
              </View>
              <View className="home-search-pill">
                <Image
                  source={icons.filter}
                  alt="filter icon"
                  className="w-full h-full"
                />
              </View>
            </Pressable>

            {/* Featured Section -------- */}
            <View className="mb-2">
              <Text
                className="text-foreground text-lg font-bold mb-4"
                accessibilityRole="header"
              >
                Featured
              </Text>

              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#0a0a0a"
                  className="py-10"
                />
              ) : isError && !data? (
                <View className="py-8 items-start">
                  <Text className="info-text mb-3">
                    Could not load featured properties.
                  </Text>
                  <Pressable onPress={() => refetch()} className="auth-button">
                    <Text className="auth-button-text">Try Again</Text>
                  </Pressable>
                </View>
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>
            <Text
              className="text-foreground text-lg font-bold mb-4"
              accessibilityRole="header"
            >
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PropertyCard property={item} onUnsave={onUnsave} showSave={false} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            isError ? (
              <View className="items-center py-10">
                <Text className="home-empty-state">
                  Could not load recommended properties.
                </Text>
                <Pressable onPress={() => refetch()} className="auth-button">
                  <Text className="auth-button-text">Try Again</Text>
                </Pressable>
              </View>
            ) : (
              <Text className="home-empty-state">No properties found.</Text>
            )
          ) : null
        }
      />
    </SafeAreaView>
  );
}
