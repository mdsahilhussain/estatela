import { Link } from 'expo-router'
import { Text, View } from 'react-native'

const SingIn = () => {
    return (
        <View>
            <Text>sing-in</Text>
            <Link href={'/(auth)/sing-in'} >Create an account</Link>
        </View>
    )
}

export default SingIn