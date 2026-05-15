import { icons } from '@/constants/icons'
import { formatPrice } from '@/lib/utils'
import { Image, Text, View } from 'react-native'

export default function PropertyCard({ property,
    onUnsave,
    showSave = false, }: {
        property: Property,
        onUnsave: () => void
        showSave: boolean
    }) {
    return (
        <View className='property-card'>
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
                            <Image className='info-icon' source={icons.water} alt='bed water' />
                            <Text className='info-text'>{property.area_sqft} ft²</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}