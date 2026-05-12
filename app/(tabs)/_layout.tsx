import { tabs } from '@/constants/data'
import { colors, components } from '@/constants/theme'
import { useAuth } from '@clerk/expo'
import { Redirect, Tabs } from 'expo-router'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


const tabBar = components.tabBar

function TabIcon({ focused, icon, title }: TabIconProps) {
    return (
        <View className='tabs-icon'>
            <View className='tabs-pill'>
                <Image source={icon} className='tabs-glyph' />
                {focused && (<Text className="tabs-title">{title}</Text>)}
            </View>
        </View>
    )
}

export default function TabLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const insets = useSafeAreaInsets();

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                position: 'absolute',
                bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                height: tabBar.height,
                marginHorizontal: tabBar.horizontalInset,
                borderRadius: tabBar.radius,
                backgroundColor: colors.foreground,
                borderTopWidth: 0,
                elevation: 0,
            },
            tabBarItemStyle: {
                paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
            },
            tabBarIconStyle: {
                width: tabBar.iconFrame,
                height: tabBar.iconFrame,
                alignItems: 'center'
            }
        }}>
            {
                tabs.map((tab, index) => (
                    <Tabs.Screen
                        key={index}
                        name={tab.name}
                        options={{
                            title: tab.title,
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon={tab.icon} title={tab.title} />
                            )
                        }}
                    />
                ))
            }
        </Tabs>
    )
}
