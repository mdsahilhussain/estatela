import { icons } from '@/constants/icons';
import { useSavedProperty } from '@/hooks/useSavedProperty';
import { formatPrice } from '@/lib/utils';
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from 'react-native';

export default function PropertyCard({ property,
    onUnsave,
    showSave = false, }: {
        property: Property,
        onUnsave?: () => void
        showSave?: boolean
    }) {
    const router = useRouter()
    const { isSaved, saveLoading, toggleSave } = useSavedProperty(
        property.id,
        onUnsave
    );

    return (
        <Pressable className='property-card' onPress={() => router.push(`/property/${property.id}`)}>
            <Image source={{ uri: property?.images[0] }} className='property-card-image' />
            <View className='grow'>
                <Text className='property-title' numberOfLines={1}>{property.title}</Text>
                <View className='feature-card-info'>
                    <Image className='info-icon' source={icons.location} alt='location icon' />
                    <Text className='info-text' numberOfLines={1}>{property.city}</Text>
                </View>
                <View className='feature-card-row'>
                    <Text className='feature-price'>{formatPrice(property.price)}</Text>
                    <View className='feature-card-meta'>
                        <View className='feature-card-info'>
                            <Image className='info-icon' source={icons.bed} alt='bed icon' />
                            <Text className='info-text'>{`${property.bedrooms} ${property.bathrooms < 2 ? "Bed" : "Beds"}`}</Text>
                        </View>
                        <View className='feature-card-info'>
                            <Image className='info-icon' source={icons.size} alt='bed water' />
                            <Text className='info-text'>{property.area_sqft} ft²</Text>
                        </View>
                    </View>
                </View>
            </View>

            {showSave && (
                <Pressable
                    onPress={toggleSave}
                    disabled={saveLoading}
                    className="w-10 items-center pt-3"
                >
                    <Image source={isSaved ? icons.heart : icons.full_heart} className='w-full h-full' />
                </Pressable>
            )}
        </Pressable>
    )
}