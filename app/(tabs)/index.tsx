import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import "@/global.css";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/expo";
import { useFocusEffect, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>();

  // Fetch featured and recommended properties in parallel --------
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const [
        { data: featuredData, error: featuredError },
        { data: recommendedData, error: recommendedError },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("*")
          .eq("is_featured", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("properties")
          .select("*")
          .eq("is_featured", false)
          .order("created_at", { ascending: false }),
      ]);

      if (featuredError) throw featuredError;
      if (recommendedError) throw recommendedError;

      setFeatured(featuredData ?? []);
      setRecommended(recommendedData ?? []);
    } catch (error) {
      console.log("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

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
              <Image source={images.default_avatar_male} alt="admin avatar image" className="home-header-avatar" />
              <Text className="home-header-title" numberOfLines={1}>{user?.fullName || 'Joni Dev'}</Text>
            </View>

            {/* Search Bar -------- */}
            <Pressable onPress={() => router.push("/(tabs)/search")} className="home-search-box">
              <View className="home-search-inputfield">
                <Image source={icons.input_search} alt="search icon" className="home-search-icon" />
                <Text className="home-search-placeholder" numberOfLines={1}> Search properties, cities...</Text>
              </View>
              <View className='home-search-pill'>
                <Image source={icons.filter} alt="filter icon" className="w-full h-full" />
              </View>
            </Pressable>

            {/* Featured Section -------- */}
            <View className="mb-2">
              <Text className="text-foreground text-lg font-bold mb-4" accessibilityRole="header">
                Featured
              </Text>

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#0a0a0a"
                  className="py-10"
                />
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
            <Text className="text-foreground text-lg font-bold mb-4" accessibilityRole="header">
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PropertyCard property={item} onUnsave={onUnsave} showSave={false} />
        )}
        ListEmptyComponent={
          !loading ? <Text className="home-empty-state">No properties found.</Text> : null
        }
      />
    </SafeAreaView>
  );
}
