import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DashboardDialogComponent} from '../../dashboard-dialog/dashboard-dialog.component';
import {SignalService} from 'app/main/apps/services/signal.service';
import {BAR_CHART} from '../../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {CommonChartComponent} from '../../../../../../../../../../@rcm/components/common-chart/common-chart.component';

@Component({
    selector: 'app-bar',
    templateUrl: './bar.component.html',
    styleUrls: ['./../line.component.scss']
})
export class BarComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    loading: boolean = false;
    currentSignalName: string[] = [''];

    chartOptions = {
        color: ['#3398DB'],
        title: {
            text: 'Signals bar chart'
        },
        xAxis: {
            type: 'category',
            axisLabel: {
                rotate: 20
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
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
        legend: {
            data: [],
            orient: 'horizontal', // 'vertical'
            x: 'left', // 'right' | 'center'| 'left' | {number},
            y: 25, // 'center' | 'bottom' | {number}
            padding: 10,    // [5, 10, 15, 20]
            itemGap: 20,
            textStyle: {color: 'red'},
            selected: {
                'Precipitation': false
            }
        }
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
        let seriesArr: Array<any> = [];
        
        if(this.chartOptions.series[0]){
            seriesArr = this.chartOptions.series[0].data; //we have only one series of data, which is bar data
        }
        let index = seriesArr.indexOf(seriesArr.find(e => e.name === this._realtimeData.name)); //find the index of the data that is updated
        if (index >= 0 && seriesArr[index].value != [this._realtimeData.name, this._realtimeData.values ? parseFloat(this._realtimeData.values).toFixed(2) : null]) { //only update if the data is different
            seriesArr[index].value = [this._realtimeData.name, this._realtimeData.values ? parseFloat(this._realtimeData.values).toFixed(2) : null];
            this.updateOptions = {//update the chart
                series: [{
                    data: seriesArr
                }]
            };
        }
    }

    /**************************************************/
    constructor(private _matDialog: MatDialog,
                private signalService: SignalService) {
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
                    componentType: BAR_CHART.componentType
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

        this.signalService.getDataForBarChart(this.currentSignalName)
            .subscribe(res => {
                    if (res.code == 200) {
                        if (res.data.barData.length <= 0) {
                            const newTittle = CommonChartComponent.noDataTitle();
                            const xAxis = {
                                show: false,
                                type: 'value',
                                axisLabel: {
                                    rotate: 45
                                }
                            };
                            const yAxis = {
                                show: false,
                                type: 'value'
                            };
                            this.chartOptions.title = newTittle;
                            this.chartOptions.xAxis = xAxis;
                            this.chartOptions.yAxis = yAxis;
                            this.chartOptions.series = [];
                        } else {
                            let arrName: Array<string> = res.data.barData.map(e => e.name);
                            let arrVal: Array<any> = res.data.barData.map(e => Object({
                                value: [e.name, e.values ? parseFloat(e.values).toFixed(2) : null],
                                name: e.name
                            }));

                            this.chartOptions.legend.data = arrName;
                            this.chartOptions.series.push({
                                type: 'bar',
                                data: arrVal
                            });

                        }
                    }
                }, error => console.log(error),
                () => {
                    this.loading = false;
                    this.dashFinish.emit(BAR_CHART.componentType);
                }
            );
    }

    resetVariable() {
        this.chartOptions.series = [];
        this.chartOptions.legend.data = [];
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

}
