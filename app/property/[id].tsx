import { icons } from '@/constants/icons';
import { useSavedProperty } from '@/hooks/useSavedProperty';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@clerk/expo';
import clsx from 'clsx';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const SafeAreaView = styled(RNSafeAreaView);

export default function PropertyDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { userId } = useAuth();
    const rounter = useRouter();
    const isAdmin = useUserStore();
    const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "")

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [expend, setExpend] = useState<boolean>(false);
    const [imageViewerVisible, setImageViewerVisible] = useState<boolean>(false);

    const authSupabase = useSupabase();

    const fetchProperty = async () => {
        const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        setProperty(data ?? null)
        setLoading(false)
    }

    useEffect(() => {
        fetchProperty()
    }, [id])

    function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    }

    const isLongDesc = (property?.description?.length ?? 0) > 150;
    const displayDesc =
        expend || !isLongDesc
            ? property?.description
            : property?.description?.slice(0, 150) + "...";

    if (loading) {
        return (
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size='large' color="#2563EB" />
            </View>
        )
    }

    if (!property) {
        return (
            <View className='flex-1 items-center justify-center'>
                <Text className=''> Property not found</Text>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-background'>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <View className={clsx(property?.is_sold && 'opacity-40')}>
                        <FlatList
                            data={property?.images}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => setImageViewerVisible(true)}>
                                    <Image source={{ uri: item }} style={{ width, height: 400 }} resizeMode='cover' />
                                </Pressable>
                            )}

                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                        />
                    </View>

                    {/* Image carousel indicator */}
                    <View className='image-carousel-indicator'>
                        <Text className='image-carousel-indicator-text'>
                            {activeIndex + 1} / {property?.images.length}
                        </Text>
                    </View>

                    {/* Dot indicator  */}
                    {property?.images.length > 1 && (
                        <View className='image-carousel-dot-indicator'>
                            {property?.images.map((_, index) => (
                                <View
                                    key={index}
                                    className={clsx('image-carousel-dot', activeIndex === index && 'image-carousel-dot-active')}
                                />
                            ))}
                        </View>
                    )}

                    {/* back and save buttons */}
                    <SafeAreaView className='property-header-controls'>
                        <View className='property-header'>
                            <Pressable className='property-header-btn' onPress={() => rounter.back()}>
                                <Image source={icons.back_arrow} alt="back icon" className='w-full h-full' />
                            </Pressable>
                            <Pressable className='property-header-btn' onPress={toggleSave} disabled={saveLoading}>
                                <Image source={isSaved ? icons.full_heart : icons.heart} alt="back icon" className='w-full h-full' />
                            </Pressable>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Content  */}
                <View className={clsx('property-content', property?.is_sold && 'opacity-40')}>
                    {/* Badges  */}
                    <View className='property-badges'>
                        <View className='property-badge'>
                            <Text className='property-badge-text' numberOfLines={1} >{property?.type}</Text>
                        </View>
                        {property?.is_sold && (
                            <View className='property-badge border-destructive/50! bg-destructive/10!'>
                                <Text className='property-badge-text text-destructive!'>Sold</Text>
                            </View>
                        )}
                        {property?.is_featured && (
                            <View className='property-badge border-accent/50! bg-accent/10!'>
                                <Text className='property-badge-text text-accent!'>Featured</Text>
                            </View>
                        )}
                    </View>

                    {/* Title and Price */}
                    <View className='property-header-info'>
                        <Text className='property-title'>{property?.title}</Text>
                        <Text className='property-price'>{formatPrice(property?.price)}</Text>
                    </View>

                    {/* Specs Row  */}
                    <View className='property-specs-row'>
                        <View className='property-spec'>
                            <Image source={icons.bed} alt="bed icon" className='property-spec-icon' />
                            <Text className='property-spec-text'>{property?.bedrooms} {property?.bedrooms > 1 ? "Beds" : "Bed"}</Text>
                        </View>
                        <View className='property-spec'>
                            <Image source={icons.water} alt="bath icon" className='property-spec-icon' />
                            <Text className='property-spec-text'>{property?.bathrooms} {property?.bathrooms > 1 ? "Baths" : "Bath"}</Text>
                        </View>
                        <View className='property-spec'>
                            <Image source={icons.size} alt="location icon" className='property-spec-icon' />
                            <Text className='property-spec-text' numberOfLines={1}>{property?.area_sqft} ft²</Text>
                        </View>
                    </View>

                    {/* Description  */}
                    <View className='property-description'>
                        <Text className='property-description-title'>Description</Text>
                        <Text className={clsx('property-description-text')}>{displayDesc}</Text>
                        {isLongDesc && (
                            <Pressable onPress={() => setExpend(!expend)}>
                                <Text className='property-description-toggle'>{expend ? "Show less" : "Show more"}</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}