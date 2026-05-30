import PropertyCard from '@/components/PropertyCard';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@clerk/expo';
import { useFocusEffect, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function FavoriteScreen() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSavedProperties = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await authSupabase
        .from('saved_properties')
        .select('id, property_id, properties(*)')
        .eq('user_clerk_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSaved((data as unknown as SavedProperty[]) ?? []);
    } catch (error) {
      console.log("Error fetching saved properties:", error);
    } finally {
      setLoading(false);
    }
  }, [userId])

  useFocusEffect(
    useCallback(() => {
      fetchSavedProperties();
    }, [fetchSavedProperties])
  )

  return (
    <SafeAreaView className='screen-safe-area' accessibilityLabel='Favorite Screen'>
      <View className='mb-4'>
        <Text className="text-2xl font-bold text-gray-900">Saved</Text>
        {!loading && (
          <Text className="text-sm text-gray-400 mt-1">
            {saved.length} {saved.length === 1 ? "property" : "properties"} {" "}
             saved
          </Text>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a0a0a" />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={() =>
                setSaved((prev) => prev.filter((s) => s.id !== item.id))
              }
              showSave
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                {/* <Ionicons name="heart-outline" size={36} color="#EF4444" /> */}
              </View>
              <Text className="text-gray-700 text-lg font-bold mb-1">
                No saved properties
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Tap the heart icon on any property to save it here
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/search")}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
              >
                <Text className="text-card font-semibold">
                  Browse Properties
                </Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}