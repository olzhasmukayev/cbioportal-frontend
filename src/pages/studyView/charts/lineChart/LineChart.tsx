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
import autobind from 'autobind-decorator';
import BarChartToolTip from '../barChart/BarChartToolTip';
import { ToolTipModel } from '../barChart/BarChartToolTip';
import WindowStore from 'shared/components/window/WindowStore';
import ReactDOM from 'react-dom';

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
    @observable.ref
    private mousePosition = { x: 0, y: 0 };

    @observable
    private currentPointIndex = -1;

    @observable
    private toolTipModel: ToolTipModel | null = null;

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

    @autobind
    private onMouseMove(event: React.MouseEvent<any>): void {
        this.mousePosition = { x: event.pageX, y: event.pageY };
    }

    private get scatterEvents() {
        const self = this;
        return [
            {
                target: 'data',
                eventHandlers: {
                    onMouseEnter: () => {
                        return [
                            {
                                target: 'data',
                                mutation: (event: any) => {
                                    self.currentPointIndex =
                                        event.datum.eventKey;
                                    self.toolTipModel = {
                                        start:
                                            self.props.data[
                                                self.currentPointIndex
                                            ].start,
                                        end:
                                            self.props.data[
                                                self.currentPointIndex
                                            ].end,
                                        special:
                                            self.props.data[
                                                self.currentPointIndex
                                            ].specialValue,
                                        sampleCount: event.datum.y,
                                    };
                                },
                            },
                        ];
                    },
                    onMouseLeave: () => {
                        return [
                            {
                                target: 'data',
                                mutation: () => {
                                    self.toolTipModel = null;
                                },
                            },
                        ];
                    },
                },
            },
        ];
    }

    render() {
        const { width = 400, height = 300 } = this.props;

        return (
            <div onMouseMove={this.onMouseMove} style={{ overflow: 'hidden' }}>
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
                        labelComponent={<></>}
                        events={this.scatterEvents}
                    />
                </VictoryChart>
                {ReactDOM.createPortal(
                    <BarChartToolTip
                        mousePosition={this.mousePosition}
                        windowWidth={WindowStore.size.width}
                        model={this.toolTipModel}
                        totalBars={this.props.data.length}
                        currentBarIndex={this.currentPointIndex}
                    />,
                    document.body
                )}
            </div>
        );
    }
}

export default LineChart;
