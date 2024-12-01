import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import WorkoutEntry from './types/WorkoutEntry';
import { getWorkouts } from './network/workout';

interface StartWorkoutScreenProps {
  navigation: any;
}

const StartWorkoutScreen = ({ navigation }: StartWorkoutScreenProps) => {
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    getWorkouts().then(ws => setWorkoutEntries(ws));
  }, []);

  const handleStartWorkout = (entry: WorkoutEntry) => {
    navigation.navigate('Workout', { workout: entry })
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {workoutEntries.map(entry => (
        <TouchableOpacity onPress={() => handleStartWorkout(entry)} key={entry._id} style={styles.entryContainer}>
          <Text style={styles.entryText}>{entry.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  entryContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  entryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#008000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StartWorkoutScreen;
