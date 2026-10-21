import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(auth)/SignUp" className="mt-4 rounded bg-primary text-white p-4">Create Account</Link>
    </View>
  )
}

export default SignIn