import FilterModal from '@/components/FilterModel';
import PropertyCard from '@/components/PropertyCard';
import { icons } from '@/constants/icons';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';
import { useLocalSearchParams } from 'expo-router';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SearchScreen() {
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const [data, setData] = useState<Property[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilter(true);
    }
  }, [openFilters]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();


  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null
  ].filter(Boolean).length;

  async function searchFilter() {
    setLoading(true)

    try {
      let query = supabase.from('properties').select('*');

      if (search) {
        query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (bedrooms) {
        query = query.eq('bedrooms', bedrooms)
      }

      if (minPrice) {
        query = query.gte('price', minPrice)
      }

      if (maxPrice) {
        query = query.lte('price', maxPrice)
      }

      const { data } = await query.order('created_at', { ascending: false })

      setData(data ?? [])
    } catch (error) {
      console.log('Error message', error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    searchFilter()
  }, [search, type, bedrooms, minPrice, maxPrice])

  return (
    <SafeAreaView accessibilityLabel="Search Screen" className='screen-safe-area'>
      <Text accessibilityRole="header" className='screen-title'>Find Property</Text>
      <View className='filter-searchbar'>
        <View className="filter-search-inputfield">
          <Image source={icons.input_search} alt="search icon" className="home-search-icon" />
          <TextInput className="filter-search-placeholder" placeholder="Search by title or city..."
            placeholderTextColor="#9CA3AF" value={search} onChangeText={setSearch} autoCapitalize='none' />
          {
            search.length > 0 && (
              <Pressable onPress={() => setSearch('')} >
                <Image source={icons.close_foreground} alt="filter icon" className="home-search-icon" />
              </Pressable>
            )
          }
        </View>
        <Pressable className='filter-search-pill relative' onPress={() => setShowFilter(true)} >
          <Image source={icons.filter} alt="filter icon" className="w-full h-full" />
          {activeFilterCount > 0 && (
            <View className="filter-notification-barged">
              <Text className="filter-notification-barged-text">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {
        activeFilterCount > 0 && (
          <View className='filter-active-count-list'>
            {type && (
              <View className='filter-active-count'>
                <Text numberOfLines={1} className='filter-active-count-text'>{type}</Text>
                <Pressable onPress={() => setType(null)}>
                  <Image source={icons.close_accent} className='filter-active-count-icon' />
                </Pressable>
              </View>
            )}
            {bedrooms !== null && (
              <View className='filter-active-count'>
                <Text numberOfLines={1} className='filter-active-count-text'>{bedrooms === 4
                  ? "4+ beds"
                  : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}</Text>
                <Pressable onPress={() => setBedrooms(null)}>
                  <Image source={icons.close_accent} className='filter-active-count-icon' />
                </Pressable>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View className='filter-active-count'>
                <Text numberOfLines={1} className='filter-active-count-text'>{minPrice && maxPrice
                  ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                  : minPrice
                    ? `From ${formatPrice(minPrice)}`
                    : `Up to ${formatPrice(maxPrice!)}`}</Text>
                <Pressable onPress={() => {
                  setMinPrice(null);
                  setMaxPrice(null);
                }}>
                  <Image source={icons.close_accent} className='filter-active-count-icon' />
                </Pressable>
              </View>
            )}
          </View>
        )
      }

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className='filter-model-item-title mt-2'>{loading ? 'Searching....' : `${data.length} properties found`}</Text>
        }
        ListEmptyComponent={
          !loading ? (<View>
            <Text className="filter-model-item-title mb-1! text-center mt-6">
              No properties found.
            </Text>
            <Text className="info-text text-center">
              Try a different search or adjust filters.
            </Text>
          </View>) : (<ActivityIndicator size='large' color="#2563EB" />)
        }
      />

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
      />

    </SafeAreaView>
  )
}