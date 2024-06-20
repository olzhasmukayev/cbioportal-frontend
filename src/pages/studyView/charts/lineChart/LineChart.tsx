import React from 'react';
import { observer } from 'mobx-react';
import {
    VictoryLine,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryTooltip,
    VictoryScatter,
    VictorySelectionContainer,
} from 'victory';
import { makeObservable, observable, computed } from 'mobx';

interface IDataBin {
    id: string;
    count: number;
    start?: number;
    end?: number;
    specialValue?: string;
}

interface ILineChartProps {
    data: IDataBin[];
    width?: number;
    height?: number;
    onUserSelection: (selectedData: IDataBin[]) => void;
}

@observer
class LineChart extends React.Component<ILineChartProps> {
    constructor(props: ILineChartProps) {
        super(props);
        makeObservable(this);
    }

    @computed
    get processedData(): { x: number; y: number; label?: string }[] {
        return this.props?.data.slice(0, -2).map(item => ({
            x: item.end ?? item.start ?? 0,
            y: item.count,
        }));
    }

    @computed
    get processedLabelData(): { x: number; y: number; label?: string }[] {
        return this.props?.data.slice(0, -2).map(item => ({
            x: item.end ?? item.start ?? 0,
            y: item.count,
            label: `x:${item.end ?? item.start ?? 0} y:${item.count}`,
        }));
    }

    handleSelection = (points: any, bounds: any) => {
        if (bounds && bounds.x) {
            const selectedData = this.props.data
                .slice(0, -2)
                .filter(
                    item =>
                        (item.end ?? item.start ?? 0) >= bounds.x[0] &&
                        (item.end ?? item.start ?? 0) <= bounds.x[1]
                );
            this.props.onUserSelection(selectedData);
        }
    };

    render() {
        const { width = 400, height = 300 } = this.props;

        return (
            <div>
                <VictoryChart
                    domainPadding={10}
                    theme={VictoryTheme.material}
                    width={width}
                    height={height}
                    containerComponent={
                        <VictorySelectionContainer
                            onSelection={this.handleSelection}
                            selectionDimension="x"
                        />
                    }
                >
                    <VictoryAxis
                        tickFormat={(t: number) => `${t.toFixed(0)}`}
                        style={{ tickLabels: { fontSize: 10, padding: 5 } }}
                        fixLabelOverlap={true}
                    />
                    <VictoryAxis
                        dependentAxis
                        tickFormat={(t: number) => t.toLocaleString()}
                        style={{ tickLabels: { fontSize: 10, padding: 5 } }}
                    />
                    <VictoryLine
                        data={this.processedData}
                        style={{ data: { stroke: '#4f72b2' } }}
                        interpolation="monotoneX"
                    />
                    <VictoryScatter
                        data={this.processedLabelData}
                        size={4}
                        style={{ data: { fill: '#c43a31' } }}
                        labels={({ datum }: { datum: any }) => datum.label}
                        labelComponent={
                            <VictoryTooltip
                                style={{ fontSize: 14 }}
                                flyoutStyle={{
                                    stroke: '#5271FF',
                                    strokeWidth: 1,
                                    fill: 'white',
                                }}
                            />
                        }
                    />
                </VictoryChart>
            </div>
        );
    }
}

export default LineChart;
