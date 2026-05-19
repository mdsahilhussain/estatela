import FilterModal from '@/components/FilterModel';
import { icons } from '@/constants/icons';
import { useFilterStore } from '@/store/filterStore';
import { styled } from 'nativewind';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Search() {

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

  const [showFilter, setShowFilter] = useState<boolean>(false)

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null
  ].filter(Boolean).length;

  return (
    <SafeAreaView accessibilityLabel="Search Screen" className='auth-safe-area'>
      <Text accessibilityRole="header" className='filter-title'>Find Property</Text>
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
          <View>
            {type && (
              <View className=''>
                <Text></Text>
                <Pressable onPress={() => setType(null)}>
                  <Image source={icons.close_accent} className='home-search-icon' />
                </Pressable>
              </View>
            )}
          </View>
        )
      }
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
      />

    </SafeAreaView>
  )
}