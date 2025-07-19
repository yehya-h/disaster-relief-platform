import React from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';

export default function SignIn({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Sign in screen</Text>
      <Button title="Sign up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
