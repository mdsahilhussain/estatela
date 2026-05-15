import { icons } from '@/constants/icons'
import { formatPrice } from '@/lib/utils'
import React from 'react'
import { Image, Text, View } from 'react-native'

export default function FeaturedCard({ property }: { property: Property }) {
    return (
        <View className='feature-container'>
            <Image className='feature-container-image' source={{ uri: property?.images?.[0] }} alt={`${property?.title?.toLowerCase()}`} />
            <Text className='barged' numberOfLines={1}>
                {property.type}
            </Text>
            {property?.is_sold && <Text className='barged-sold' numberOfLines={1}>Sold</Text>}
            <View className='feature-card'>
                <View>
                    <Text className='feature-card-title' numberOfLines={1}>{property.title}</Text>
                    <View className='feature-card-info'>
                        <Image className='info-icon' source={icons.location} alt='location icon' />
                        <Text className='info-text' numberOfLines={1}>{property.address},{property.city}</Text>
                    </View>
                </View>
                <View className='feature-card-row'>
                    <Text className='feature-price'>{formatPrice(property.price)}</Text>
                    <View className='feature-card-meta'>
                        <View className='feature-card-info'>
                            <Image className='info-icon' source={icons.bed} alt='bed icon' />
                            <Text className='info-text'>{property.bedrooms}</Text>
                        </View>
                        <View className='feature-card-info'>
                            <Image className='info-icon' source={icons.water} alt='bed water' />
                            <Text className='info-text'>{property.bathrooms}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}