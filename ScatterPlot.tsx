import React, { useMemo } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { 
  Circle, 
  Line, 
  Text as SvgText, 
  G 
} from 'react-native-svg';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';

// Define interfaces for type safety
interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface ScatterPlotProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  title?: string;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width = Dimensions.get('window').width - 40,
  height = 300,
  title = 'Scatter Plot',
  margins = { top: 20, right: 20, bottom: 50, left: 50 }
}) => {
  // Memoize the chart creation to optimize performance
  const chartDetails = useMemo(() => {
    // Calculate the inner dimensions of the chart
    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;

    // Determine the ranges for x and y axes
    const xExtent = d3Array.extent(data, d => d.x) as [number, number];
    const yExtent = d3Array.extent(data, d => d.y) as [number, number];

    // Create scales with a bit of padding
    const xScale = d3Scale.scaleLinear()
      .domain([
        xExtent[0] - (xExtent[1] - xExtent[0]) * 0.1, 
        xExtent[1] + (xExtent[1] - xExtent[0]) * 0.1
      ])
      .range([0, innerWidth]);

    const yScale = d3Scale.scaleLinear()
      .domain([
        yExtent[0] - (yExtent[1] - yExtent[0]) * 0.1, 
        yExtent[1] + (yExtent[1] - yExtent[0]) * 0.1
      ])
      .range([innerHeight, 0]);

    // Generate points
    const points = data.map(d => ({
      x: xScale(d.x),
      y: yScale(d.y),
      originalData: d
    }));

    return { 
      xScale, 
      yScale, 
      points, 
      innerWidth, 
      innerHeight,
      xExtent,
      yExtent
    };
  }, [data, width, height, margins]);

  // Generate x-axis ticks
  const xTicks = useMemo(() => 
    chartDetails.xScale.ticks(5).map(tick => ({
      value: tick,
      x: chartDetails.xScale(tick)
    })), 
  [chartDetails]
  );

  // Generate y-axis ticks
  const yTicks = useMemo(() => 
    chartDetails.yScale.ticks(5).map(tick => ({
      value: tick,
      y: chartDetails.yScale(tick)
    })), 
  [chartDetails]
  );

  return (
    <View>
      <Text style={styles.titleText}>{title}</Text>
      <Svg width={width} height={height}>
        <G x={margins.left} y={margins.top}>
          {/* Data points */}
          {chartDetails.points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={5}
              fill="#007bff"
              stroke="#007bff"
              strokeWidth={2}
            />
          ))}

          {/* X-axis */}
          <Line
            x1={0}
            y1={chartDetails.innerHeight}
            x2={chartDetails.innerWidth}
            y2={chartDetails.innerHeight}
            stroke="#000"
            strokeWidth={2}
          />

          {/* Y-axis */}
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={chartDetails.innerHeight}
            stroke="#000"
            strokeWidth={2}
          />

          {/* X-axis ticks and labels */}
          {xTicks.map((tick, i) => (
            <G key={`x-tick-${i}`}>
              <Line
                x1={tick.x}
                y1={chartDetails.innerHeight}
                x2={tick.x}
                y2={chartDetails.innerHeight + 6}
                stroke="#000"
                strokeWidth={2}
              />
              <SvgText
                x={tick.x}
                y={chartDetails.innerHeight + 15}
                fontSize={12}
                fill="#000"
                textAnchor="middle"
              >
                {tick.value}
              </SvgText>
            </G>
          ))}

          {/* Y-axis ticks and labels */}
          {yTicks.map((tick, i) => (
            <G key={`y-tick-${i}`}>
              <Line
                x1={0}
                y1={tick.y}
                x2={-6}
                y2={tick.y}
                stroke="#000"
                strokeWidth={2}
              />
              <SvgText
                x={-15}
                y={tick.y}
                fontSize={12}
                fill="#000"
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {tick.value}
              </SvgText>
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  }
});


export default ScatterPlot;