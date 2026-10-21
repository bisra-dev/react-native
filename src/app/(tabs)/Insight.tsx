import { View, Text } from 'react-native'

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const Insight = () => {
  return (
    <SafeAreaView>
      <Text>Insight</Text>
    </SafeAreaView>
  )
}

export default Insight