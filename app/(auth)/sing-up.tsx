import { Link } from 'expo-router'
import { Text, View } from 'react-native'

const SingUp = () => {
    return (
        <View>
            <Text>sing-in</Text>
            <Link href={'/(auth)/sing-in'} >Do you have already an account</Link>
        </View>
    )
}

export default SingUp