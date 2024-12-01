import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScatterPlot from './ScatterPlot';
import { deleteExerciseById, getExerciseById, getExerciseNames, postExercise } from './network/exercise';
import { convertFromDatabaseFormat, formatTime, getExercisesByNameAndConvertToDataPoint } from './utils';
import ExerciseSelect from './ExerciseSelect';
import DropdownItem from './types/DropdownItem';
import DataPoint from './types/DataPoint';
import Toast from 'react-native-toast-message'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import ExerciseEntry from './types/ExerciseEntry';
import { useModal } from './ModalContext';

interface ExerciseLogScreenProps {
  navigation: any;
  route: any;
}

function ExerciseLogScreen({ navigation, route }: ExerciseLogScreenProps): React.JSX.Element {
  const [exercises, setExercises] = useState<DropdownItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>(undefined);
  const [data, setData] = useState<DataPoint[]>([]);
  const [modalExerciseEntry, setModalExerciseEntry] = useState<ExerciseEntry | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const { showModal } = useModal();

  const onChange = (_event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: 'date',
      is24Hour: true,
      display: 'default'
    });
  };

  useEffect(() => {
    getExerciseNames()
      .then(names => {
        const sortedNames = names.sort((a, b) => a.localeCompare(b));
        const items = sortedNames.map(name => ({
          label: convertFromDatabaseFormat(name),
          value: name,
        }));
        setExercises(items);
        if (route.params.name) {
          const item = {
            label: convertFromDatabaseFormat(route.params.name),
            value: route.params.name,
          };
          setSelectedItem(item);
          handleSelect(item);
        }
      })
      .catch(console.log); // TODO  convert to Toast
  }, []);

  const handleSelect = async (item: DropdownItem) => {
    const dataPoints = await getExercisesByNameAndConvertToDataPoint(item.value);
    setData(dataPoints);
  }

  const reloadData = async (name: string) => {
    setData(await getExercisesByNameAndConvertToDataPoint(name)); 
    setReps(""); 
    setWeight("");
    setDate(new Date());
  }

  const handleAddDataPoint = async (_e: any) => {
    try {
      if (selectedItem) {
        const parsedWeight = parseFloat(weight);
        const parsedReps = parseInt(reps);
        if (isNaN(parsedReps) || isNaN(parsedWeight)) {
          Toast.show({
            type: 'error',
            text1: 'Whoops!',
            text2: 'Reps or weights must be numbers.'
          });
        } else {
          const newExercise = {
            name: selectedItem.value,
            weight: parsedWeight,
            reps: parsedReps,
            createdAt: date.toISOString(),
          }
          const insertedEntry = await postExercise(newExercise);
          if (insertedEntry._id) {
            reloadData(insertedEntry.name);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Whoops!',
              text2: 'Entry could not be added, please try again.'
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleDataPointClick = (point: DataPoint) => {
    getExerciseById(point.label!).then(m => {
      showModal(datapointModalContentFactory(m));
    });
  }

  const handleDeleteExercise = (_e: any) => {
    if (modalExerciseEntry) {
      deleteExerciseById(modalExerciseEntry._id).then(() => {
        reloadData(modalExerciseEntry.name);
      });
    }
  }

  // TODO use global modal through useModal
  const datapointModalContentFactory = (entry: ExerciseEntry) => { 
    setModalExerciseEntry(entry);
    return <View>
      <Text>Weight: {entry.weight.toString()} lbs</Text>
      <Text>Reps: {entry.reps.toString()}</Text>
      <Text>Date: {formatTime(entry.createdAt)}</Text>
      <Button title="Delete" onPress={handleDeleteExercise} />
    </View>;
  }

  return (
    <SafeAreaView style={styles.container}>
    { data && selectedItem && (
        <ScatterPlot
          onDataPointClick={handleDataPointClick}
          data={data}
          title={selectedItem.label}
          zoomAndPanEnabled={false}
        />
      )}
      { selectedItem && (
        <KeyboardAvoidingView style={styles.inputContainer}>
          <TextInput
            placeholder="Weight"
            value={weight.toString()}
            onChangeText={(text) => setWeight(text)}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder="Reps"
            value={reps.toString()}
            onChangeText={(text) => setReps(text)}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={showDatePicker} style={styles.dateContainer}>
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>
          <Button title="Add" onPress={handleAddDataPoint} color="#4CAF50" />
        </KeyboardAvoidingView>
      )}
      <ExerciseSelect 
        selectedItem={selectedItem} 
        setSelectedItem={setSelectedItem} 
        handleSelect={handleSelect} 
        exercises={exercises} 
        setExercises={setExercises}
        setData={setData}
      />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    backgroundColor: '#F5F5F5',
  },
  selectMenu: {
    flexGrow: 1,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Dimensions.get("window").width,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  dateContainer: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ExerciseLogScreen;
