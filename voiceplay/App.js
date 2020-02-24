import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Amplify, { Interactions } from 'aws-amplify';
import awsconfig from './aws-exports';
import voiceLibs from 'aws-amplify-react-native/dist/Interactions/ReactNativeModules'

Amplify.configure(awsconfig);


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <ChatBot
      botName={botName}
      welcomeMessage={welcomeMessage}
      onComplete={this.handleComplete}
      clearOnComplete={false}
      styles={StyleSheet.create({
          itemMe: {
              color: 'red'
          }
      })}
  />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
