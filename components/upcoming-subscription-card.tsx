import { formatCurrency } from '@/lib/util'
import React from 'react'
import { Image, Text, View } from 'react-native'

const UpcomingSubscriptionCard = ({ name, price, currency, daysLeft, icon }: UpcomingSubscription) => {
    return (
        <View className='upcoming-card'>
            <View className='upcoming-row'>
                <View className='upcoming-icon-container'>
                    <Image source={icon} className='w-full h-full' />
                </View>
                <View>
                    <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
                    <Text className='upcoming-meta' numberOfLines={1}>{daysLeft === 1 ? "last day" : `${daysLeft} days left`}</Text>
                </View>
            </View>
            <Text className='upcoming-name' numberOfLines={1}>{name}</Text>
        </View>
    )
}

export default UpcomingSubscriptionCard