import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import { Pressable, Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);

export default function SettingScreen() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (error) {
      console.log('Error signing out:', error)
    }
  }
  return (
    <SafeAreaView className='auth-safe-area'>
      <Pressable onPress={handleLogout} className='auth-button'>
        <Text className="auth-button-text">
          Log out
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}