import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DatePipe} from '@angular/common';
import {DashboardDialogComponent} from '../../dashboard-dialog/dashboard-dialog.component';
import {LINE_CHART_REALTIME} from '../../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';

@Component({
    selector: 'app-line-realtime',
    templateUrl: './line-realtime.component.html',
    styleUrls: ['./../line.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LineRealtimeComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    loading: boolean = true;
    currentSignalName: string[] = [''];
    colors = ['#f0062d', '#0bc17c', '#688147', '#e9b00b'];

    chartOptions = {
        color: this.colors,
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Realtime chart'
        },
        xAxis: {
            type: 'time',
        },
        yAxis: [],
        legend: {},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
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
        },
        series: [],
        toolbox: {
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
        },
        dataZoom: [
            {
                show: true,
                xAxisIndex: 0,
            },
            {
                type: 'inside',
                start: 94,
                end: 100
            }
        ]
    };
    updateOptions: any;

    dialogRef: MatDialogRef<DashboardDialogComponent>;

    /*using getter and setter to determine when will the realtime data comes */
    _realtimeData: any;
    get realtimeData(): any {
        return this._realtimeData;
    }

    @Input('realtimeData')
    set realtimeData(realtimeData: any) {
        this._realtimeData = realtimeData;
        let index: number = this.chartOptions.series.indexOf(this.chartOptions.series.find(e => e.name === this._realtimeData.name)); //find the index of the line data that is updated                    
        if (index >= 0) {
            let lineDataArr: Array<any> = this.chartOptions.series[index].data; //get data array of the line

            if (lineDataArr.length < 100) {
                lineDataArr.push([this._realtimeData.timestamp, this._realtimeData.values]);
            } else {
                lineDataArr = lineDataArr.slice(1); // remove first element of array when length reaches 100
                lineDataArr.push([this._realtimeData.timestamp, this._realtimeData.values]);
            }

            this.chartOptions.series[index].data = lineDataArr; //replace old line with the updated line

            this.updateOptions = {//update the chart
                series: this.chartOptions.series
            };
        }
    }

    /**************************************************/

    constructor(private _matDialog: MatDialog,
                private datePipe: DatePipe) {
    }

    ngOnInit() {
        this.initDialog();
    }

    initDialog() {
        if (this.dataRef && this.dataRef.signalName) {
            this.currentSignalName = this.dataRef.signalName;
            this.loadData();
        } else {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: LINE_CHART_REALTIME.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.name) {
                    this.currentSignalName = result.name.filter(e => e != 0);
                    this.changeData.emit({signalName: this.currentSignalName});
                    this.loadData();
                } else {
                    this.removeDashboardElement();
                }
            });
        }
    }

    loadData() {
        this.loading = true;
        this.resetVariable();

        for (let i = 0; i < this.currentSignalName.length; i++) {
            this.chartOptions.series.push(
                {
                    type: 'line',
                    name: this.currentSignalName[i],
                    pointInterval: 1000,
                    yAxisIndex: [i],
                    data: []
                }
            );
            this.chartOptions.yAxis.push(
                {
                    type: 'value',
                    name: this.currentSignalName[i],
                    position: i % 2 == 0 ? 'left' : 'right',
                    axisLine: {
                        lineStyle: {
                            color: this.colors[i]
                        }
                    },
                    nameLocation: 'center',
                    offset: 15 * i,
                    axisLabel: {
                        formatter: `{value}`
                    }
                },
            );
        }
        ;

        this.dashFinish.emit(LINE_CHART_REALTIME.componentType);
        this.loading = false;
    }

    // loadData() {
    // this.loading = true;
    // const fromDt = new Date();
    // fromDt.setDate(fromDt.getDate() - 1);
    // const toDt = this.convertDate(new Date());
    // this.resetVariable();

    // this.signalService.getArraySignalPointDataForChart(this.currentSignalName, this.convertDate(fromDt), toDt, 'true')
    //     .subscribe(res => {
    //         if (res.code == 200 && this.currentSignalName.length > 0) {
    //             for (let i = 0; i < res.data.signalPointData.length; i++) {
    //                 this.chartOptions.series.push(
    //                     {
    //                         type: 'line',
    //                         name: res.data.signalPointData[i].signal.name,
    //                         pointInterval: 1000,
    //                         yAxisIndex: [i],
    //                         data: res.data.signalPointData[i].resultList.length > 0 ?
    //                             res.data.signalPointData[i].resultList.map(e => [e.t, e.v]) : []
    //                     }
    //                 );
    //                 this.chartOptions.yAxis.push(
    //                     {
    //                         type: 'value',
    //                         name: res.data.signalPointData[i].signal.name,
    //                         position: i % 2 == 0 ? 'left' : 'right',
    //                         axisLine: {
    //                             lineStyle: {
    //                                 color: this.colors[i]
    //                             }
    //                         },
    //                         nameLocation: 'center',
    //                         offset: 15 * i,
    //                         axisLabel: {
    //                             formatter: `{value} ${res.data.signalPointData[i].signal.unit}`
    //                         }
    //                     },
    //                 );
    //             }
    //         }
    //     }, error => console.log(error),
    //         () => { 
    //             this.loading = false; 
    //             this.dashFinish.emit(true); 
    //         }
    //     );
    // }

    resetVariable() {
        this.chartOptions.series = [];
    };

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

}
