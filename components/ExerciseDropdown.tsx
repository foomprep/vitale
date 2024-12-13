import { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import DropdownItem from '../types/DropdownItem';
import { StyleSheet } from 'react-native';
interface ExerciseDropdownProps {
  dropdownItems: { label: string; value: string }[];
  onChange: (item: DropdownItem) => void;
  selectedItem: DropdownItem | undefined;
}
const ExerciseDropdown = ({ dropdownItems, onChange, selectedItem }: ExerciseDropdownProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);
  return (
    <Dropdown
      style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={[styles.selectedTextStyle, { fontWeight: 'bold', textAlign: 'center' }]}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={dropdownItems}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={!isFocus ? 'Select exercise' : '...'}
      searchPlaceholder="Search..."
      value={selectedItem === undefined ? '' : selectedItem.value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={onChange}
    />
  )
}
export default ExerciseDropdown;

const styles = StyleSheet.create({
  dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
