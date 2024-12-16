import {useState} from "react";
import {View, TextInput, Button, StyleSheet, Text} from "react-native";
import {calculateMacros} from "../nutrition";
import {postFood} from "../network/food";
import NutritionInfo from "../types/NutritionInfo";
import {showToastError} from "../utils";

interface MacroByLabelCalculatorProps {
  nutritionInfo: NutritionInfo;
  setModalVisible: (visible: boolean) => void;
  loadData: () => void;
}

const MacroByLabelCalculator = ({ nutritionInfo, setModalVisible, loadData }: MacroByLabelCalculatorProps) => {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');

  const handleAddDietLog = async (_e: any) => {
    const parsedAmount = parseFloat(amount);
    const macros = calculateMacros(nutritionInfo, parsedAmount);
    const createdAt = Math.floor(Date.now() / 1000)
    const result = await postFood({
      name,
      macros,
      nutritionInfo,
      createdAt,
    });
    if (!result.acknowledged) {
      showToastError("Could not save diet entry, please try again.");
      loadData();
    }
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Enter name"
      />
      <View style={styles.amountRow}>
        <TextInput
          style={styles.input}
          onChangeText={setAmount}
          value={amount}
          placeholder="Enter amount"
        />
        <Text>g</Text>
      </View>
      <Button title="Add" onPress={handleAddDietLog} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 10,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
});

export default MacroByLabelCalculator;

