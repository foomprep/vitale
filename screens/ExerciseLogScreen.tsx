import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet
} from 'react-native';
import ScatterPlot from '../ScatterPlot';
import { getExerciseById, getExerciseNames, postExercise } from '../network/exercise';
import { convertFromDatabaseFormat, getExercisesByNameAndConvertToDataPoint, showToastError } from '../utils';
import DropdownItem from '../types/DropdownItem';
import DataPoint from '../types/DataPoint';
import Toast from 'react-native-toast-message'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useModal } from '../modals/ModalContext';
import { Picker } from '@react-native-picker/picker';
import NewExerciseModalContent from '../modals/NewExerciseModalContent';
import { Button, TextInput } from 'react-native-paper';
import ExerciseModalContent from '../modals/ExerciseModalContent';

interface ExerciseLogScreenProps {
  route: any;
}

function ExerciseLogScreen({ route }: ExerciseLogScreenProps): React.JSX.Element {
  const [exercises, setExercises] = useState<DropdownItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>(undefined);
  const [data, setData] = useState<DataPoint[]>([]);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const { showModal } = useModal();

  const dropdownItems = [
    {
      value: '',
      label: 'Select an exercise',
    },
    {
      value: 'new_exercise',
      label: 'Add New Exercise'
    }, 
    ...exercises
  ];

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
        if (route.params && route.params.name) {
          const item = {
            label: convertFromDatabaseFormat(route.params.name),
            value: route.params.name,
          };
          setSelectedItem(item);
          handleSelect(item);
        }
      })
      .catch(err => {
        showToastError('Could not get exercises: ' + err.toString());
      }); 
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
            createdAt: Math.floor(date.getTime() / 1000),
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
      showModal(<ExerciseModalContent reloadData={reloadData} entry={m} />)
    });
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
        <View>
          <TextInput
            label="Weight"
            value={weight}
            onChangeText={(text) => setWeight(text)}
          />
          <TextInput
            placeholder="Reps"
            value={reps.toString()}
            onChangeText={(text) => setReps(text)}
          />
          <TextInput
            placeholder="Notes"
            value={notes}
            onChangeText={(text) => setNotes(text)}
          />
          <Button icon="calendar" onPress={showDatePicker}>
            <Text>{date.toDateString()}</Text>
          </Button>
          <Button onPress={handleAddDataPoint}>Add</Button>
        </View>
      )}
      <Picker
        style={{
          height: 100,
          width: '100%',
        }}
        selectedValue={selectedItem?.value}
        onValueChange={(exercise_id: string) => {
          if (exercise_id === "new_exercise") {
            showModal(
              <NewExerciseModalContent
                setData={setData}
                setExercises={setExercises}
                exercises={exercises}
                setSelectedItem={setSelectedItem}
              />
            );
          } else {
            const item: DropdownItem = {
              label: convertFromDatabaseFormat(exercise_id),
              value: exercise_id,
            };
            setSelectedItem(item);
            handleSelect(item);
          }
        }}
      >
        {dropdownItems.map(item => <Picker.Item key={item.label} label={item.label} value={item.value} />)}
      </Picker>
      <Toast />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
export default ExerciseLogScreen;