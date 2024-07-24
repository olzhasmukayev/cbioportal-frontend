import React from 'react';
import { observer } from 'mobx-react';
import {
    VictoryArea,
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

interface IAreaChartProps {
    data: IDataBin[];
    width?: number;
    height?: number;
    onUserSelection: (selectedData: IDataBin[]) => void;
}

@observer
class AreaChart extends React.Component<IAreaChartProps> {
    @observable.ref
    private mousePosition = { x: 0, y: 0 };

    @observable
    private currentPointIndex = -1;

    @observable
    private toolTipModel: ToolTipModel | null = null;

    constructor(props: IAreaChartProps) {
        super(props);
        makeObservable(this);
    }

    @computed
    get processedData(): { x: number; y: number }[] {
        return this.props.data.slice(0, -2).map(item => ({
            x: item.end ?? item.start ?? 0,
            y: item.count,
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

    render() {
        const { width, height } = this.props;

        return (
            <div onMouseMove={this.onMouseMove} style={{ overflow: 'hidden' }}>
                <VictoryChart
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
                    />
                    <VictoryAxis
                        dependentAxis
                        tickFormat={(t: number) => t.toLocaleString()}
                    />
                    <VictoryArea
                        data={this.processedData}
                        style={{ data: { fill: '#2986E2', stroke: '#4f72b2' } }}
                        interpolation="monotoneX"
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

export default AreaChart;
