import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FloatingActionButton from '../components/FloatingActionButton';
import { useModal } from '../modals/ModalContext';
import AddWeightModal from '../modals/AddWeightModal';
import { getWeight } from '../network/weight';
import { mapWeightEntriesToDataPoint } from '../utils';
import ScatterPlot from '../ScatterPlot';
import DataPoint from '../types/DataPoint';

const WeightScreen = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const { showModal } = useModal();

  const loadData = () => {
    getWeight().then(result => {
      setData(mapWeightEntriesToDataPoint(result));
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWeight = (_e: any) => {
    showModal(<AddWeightModal loadData={loadData} />);
  }

  return (
    <View style={styles.container}>
      <ScatterPlot
        datasets={[data]}
        onDataPointClick={() => {}}
        zoomAndPanEnabled={false}
      />
      <FloatingActionButton onPress={handleAddWeight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default WeightScreen;
