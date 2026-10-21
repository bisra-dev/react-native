import { Text } from 'react-native'

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const Subscription = () => {
  return (
    <SafeAreaView>
      <Text>Subscription here</Text>
    </SafeAreaView>
  )
}

export default Subscription