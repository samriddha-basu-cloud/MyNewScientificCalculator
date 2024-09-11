// App.tsx
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView, StyleSheet } from 'react-native';
import Calculator from './src/components/Calculator';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Calculator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});

export default App;