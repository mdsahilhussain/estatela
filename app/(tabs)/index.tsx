import '@/global.css';
import { styled } from "nativewind";
import { Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className='auth-safe-area'>
      <View>
        <Text>index</Text>
      </View>
    </SafeAreaView>

  )
}