import React from 'react';
import { observer } from 'mobx-react';
import {
    VictoryLine,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryVoronoiContainer,
    VictoryTooltip,
    VictoryScatter,
} from 'victory';
import { makeObservable, computed } from 'mobx';

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
}

@observer
class LineChart extends React.Component<ILineChartProps> {
    constructor(props: ILineChartProps) {
        super(props);
        makeObservable(this);
    }

    @computed
    get processedData(): { x: number; y: number; label?: string }[] {
        return this.props.data.slice(0, -2).map(item => ({
            x: item.end ?? item.start ?? 0,
            y: item.count,
        }));
    }

    @computed
    get processedLabelData(): { x: number; y: number; label?: string }[] {
        return this.props.data.slice(0, -2).map(item => ({
            x: item.end ?? item.start ?? 0,
            y: item.count,
            label:
                'x:' +
                String(item.end ?? item.start ?? 0) +
                ' y: ' +
                String(item.count),
        }));
    }

    render() {
        const { width = 400, height = 300 } = this.props;
        console.log(this.props.data);
        return (
            <div>
                <VictoryChart
                    domainPadding={10}
                    theme={VictoryTheme.material}
                    width={width}
                    height={height}
                    containerComponent={<VictoryVoronoiContainer />}
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
                        size={3}
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
