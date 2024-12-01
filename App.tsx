import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExerciseLogScreen from './ExerciseLogScreen';
import HomeScreen from './HomeScreen';
import ExerciseListScreen from './ExerciseListScreen';
import ExerciseScreen from './ExerciseScreen';
import DietScreen from './DietScreen';
import { ModalProvider } from './ModalContext';
import GlobalModal from './GlobalModal';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  Home: undefined;
  ExerciseLog: undefined;
  ExerciseList: undefined;
  Exercise: { title: string };
  Diet: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <ModalProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "Home"
            }}
          />
          <Stack.Screen
            name="ExerciseLog"
            component={ExerciseLogScreen}
            options={{
              title: "Log"
            }}
          />
          <Stack.Screen
            name="ExerciseList"
            component={ExerciseListScreen}
            options={{
              title: "List"
            }}
          />
          <Stack.Screen
            name="Diet"
            component={DietScreen}
            options={{
              title: "Diet"
            }}
          />
          <Stack.Screen
            name="Exercise"
            component={ExerciseScreen}
            options={{
              title: "Exercise",
            }}
          />
        </Stack.Navigator>
        <GlobalModal />
      </NavigationContainer>
      <Toast />
    </ModalProvider>
  );
};

export default App;
