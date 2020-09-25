import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ChartData} from './chartData';

@Component({
    selector: 'app-common-chart',
    templateUrl: './common-chart.component.html',
    // styleUrls: ['./common-high-chart.component.scss']
})
export class CommonChartComponent implements OnInit, OnChanges {

    @Input()
    chartData: ChartData = new ChartData();

    chartTitle = '';

    chartOptions = {
        title: {
            text: this.chartTitle
        },
        xAxis: {
            type: 'category',
            show: false
        },
        yAxis: {
            type: 'value'
        },
        tooltip: {
            formatter: function (params) {
                return '<strong>Data value: </strong>' + params.value + '<br/>';
            },
            trigger: 'item',
            axisPointer: {
                type: 'line'
            }
        },
        series: [],
        legend: {
            type: 'scroll',
            orient: 'horizontal', // 'vertical' || 'horizontal'
            x: 'left', // 'center' | 'left' | {number} || 'right'
            y: 25, // 'center' | 'bottom' | {number}
            padding: 10,    // [5, 10, 15, 20]
            itemGap: 20,
            textStyle: {color: 'red'},
            width: '90%'
        },
        toolbox: {},
        dataZoom: []
    };


    constructor() {
    }

    ngOnInit() {
        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadData();
    }

    loadData() {
        if (this.chartData && this.chartData.data.length > 0) {
            this.chartOptions.title = {text: this.chartData.chartTitle};
            this.chartOptions.dataZoom = [
                {
                    show: true,
                    yAxisIndex: 0,
                }
            ];
            this.chartOptions.toolbox = {
                feature: {
                    dataZoom: {
                        xAxisIndex: 'none',
                        title: {
                            zoom: 'zoom by rectangle',
                            back: 'undo zooming'
                        }
                    },
                    dataView: {title: 'Data view', lang: ['Data view', 'Close', 'Refresh']},
                    restore: {title: 'Restore chart to origin position'},
                    saveAsImage: {title: 'Save chart as image'}
                }
            };
            if (this.chartData.xAxisData) {
                this.chartOptions.dataZoom = [
                    {
                        show: true,
                        xAxisIndex: 0,
                    },
                    {
                        type: 'inside',
                        start: 94,
                        end: 100
                    }
                ];
                this.chartOptions.toolbox = {
                    feature: {
                        dataZoom: {
                            title: {
                                zoom: 'zoom by rectangle',
                                back: 'undo zooming'
                            }
                        },
                        dataView: {title: 'Data view', lang: ['Data view', 'Close', 'Refresh']},
                        restore: {title: 'Restore chart to origin position'},
                        saveAsImage: {title: 'Save chart as image'}
                    }
                };
                const newXAxis = {
                    show: true,
                    type: 'time',
                    max: this.chartData.xAxisMax,
                };
                const newYAxis = {
                    show: true,
                    type: 'value',
                    boundaryGap: [0, '100%'],
                    splitLine: {
                        show: false
                    }
                };
                this.chartOptions.yAxis = newYAxis;
                this.chartOptions.xAxis = newXAxis;
                this.chartOptions.tooltip = {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line'
                    },
                    formatter: function (params) {
                        params = params[0];
                        var date = new Date(params.value[0]);
                        return date.getDate() + '/'
                            + (date.getMonth() + 1) + '/'
                            + date.getFullYear() + '('
                            + date.getHours() + ':'
                            + date.getMinutes() + ':'
                            + date.getSeconds() + ':' + date.getMilliseconds() + ')'
                            + '\nValue: ' + params.value[1];
                    }
                };
            }
            if (this.chartData.data[0].length > 1) {
                this.chartOptions.series = [];
                let chartSeries = [];
                for (let i = 0; i < this.chartData.data.length; i++) {
                    let name = this.chartData.seriesName;
                    if (i > 0) {
                        name += `_${i + 1}`;
                    }
                    let aSeries = {
                        name: name,
                        data: this.chartData.data[i],
                        type: 'line',
                    };
                    chartSeries.push(aSeries);
                }
                this.chartOptions.series = chartSeries;
            } else {
                this.chartOptions.series = [];
                let aSeries = {
                    name: this.chartData.seriesName,
                    data: this.chartData.data[0],
                    type: 'line',
                };
                this.chartOptions.series.push(aSeries);
            }
        } else if (this.chartData && this.chartData.data.length <= 0) {
            const newTittle = this.noDataTitle();
            let aSeries = {
                name: this.chartData.seriesName,
                type: 'line',
            };
            const xAxis = {
                show: false,
                type: 'category'
            };
            const yAxis = {
                show: false,
                type: 'value'
            };
            this.chartOptions.title = newTittle;
            this.chartOptions.xAxis = xAxis;
            this.chartOptions.yAxis = yAxis;
            this.chartOptions.series = [];
            this.chartOptions.series.push(aSeries);
        }
    }

    static noDataTitle(): any {
        return {
            textStyle: {
                color: 'grey',
                fontSize: 20
            },
            text: 'No data',
            left: 'center',
            top: 'center'
        };
    }

    private noDataTitle(): any {
        return {
            textStyle: {
                color: 'grey',
                fontSize: 20
            },
            text: 'No data',
            left: 'center',
            top: 'center'
        };
    }
}
