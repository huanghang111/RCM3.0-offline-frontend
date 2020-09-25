import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { LINE_CHART_INTENSIVE } from '../../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DashboardDialogComponent } from '../../dashboard-dialog/dashboard-dialog.component';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SignalService } from 'app/main/apps/services/signal.service';

@Component({
    selector: 'app-line-intensive',
    templateUrl: './line-intensive.component.html',
    styleUrls: ['./../line.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LineIntensiveComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    loading: boolean = false;
    listLoading: boolean = false;
    timestampList: Array<any> = [];
    timestampListBuffer: Array<string> = [];
    bufferSize: number = 30;
    numberOfItemsFromEndBeforeFetchingMore = 10;

    currentSelectionList: Array<any> = [];
    chartOptions: any = {
        title: {
            text: ''
        },
        xAxis: {
            type: 'category',
            name: 'Index',
            nameLocation: 'center',
        },
        yAxis: {
            type: 'value',
            name: 'Value',
            nameLocation: 'center',
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal', // 'vertical'
            x: 'left', // 'center' | 'left' | {number},
            y: 25, // 'center' | 'bottom' | {number}
            padding: 10,    // [5, 10, 15, 20]
            itemGap: 20,
            textStyle: { color: 'red' },
            selected: {
                'Precipitation': false
            }
        },
        tooltip: {
            formatter: function (params) {
                return '<strong>Data value: </strong>' + params.value + '<br/>';
            },
            trigger: 'item'
        },
        series: [],
        toolbox: {
            feature: {
                dataZoom: {
                    xAxisIndex: 'none',
                    title: {
                        zoom: 'zoom by rectangle',
                        back: 'undo zooming'
                    }
                },
                dataView: { title: 'Data view', lang: ['Data view', 'Close', 'Refresh'] },
                restore: { title: 'Restore chart to origin position' },
                saveAsImage: { title: 'Save chart as image' }
            }
        },
        dataZoom: [
            {
                show: true,
                xAxisIndex: 0
            }
        ]
    };

    dialogRef: MatDialogRef<DashboardDialogComponent>;

    chartForm = new FormGroup({
        'name': new FormControl(''),
        'dateFrom': new FormControl(this.convertDate(new Date(new Date().getTime() - 86400000)), [Validators.required]),
        'dateTo': new FormControl(this.convertDate(new Date()), [Validators.required]),
        'timestamps': new FormControl('', [Validators.required])
    });


    /*using getter and setter to determine when will the realtime data comes */
    _realtimeData: any;
    get realtimeData(): any {
        return this._realtimeData;
    }

    @Input('realtimeData')
    set realtimeData(realtimeData: any) {
        this._realtimeData = realtimeData;
        this.timestampList.splice(0, 0, realtimeData.timestamp);
    }

    /**************************************************/

    constructor(private _matDialog: MatDialog,
        private signalService: SignalService,
        private datePipe: DatePipe) {
    }

    get form() {
        return this.chartForm.controls;
    }

    ngOnInit() {
        this.initDialog();
    }

    initDialog() {
        if (this.dataRef && this.dataRef.signalName) {
            this.form.name.setValue(this.dataRef.signalName);
            this.loadIntensiveTimestampList();
        } else {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: LINE_CHART_INTENSIVE.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.name) {
                    this.form.name.setValue(result.name);
                    this.changeData.emit({ signalName: this.form.name.value });
                    this.loadIntensiveTimestampList();
                } else {
                    this.removeDashboardElement();
                }
            });
        }
    }

    loadIntensiveTimestampList() {
        this.listLoading = true;
        this.timestampList = [];

        this.signalService.getIntensiveSignalTimestampList(this.form.name.value, this.form.dateFrom.value, this.form.dateTo.value).subscribe(
            res => {
                if (res.code == 200 && res.data.timestamps.length > 0) {
                    this.timestampList = res.data.timestamps.map(e => this.timestampToString(e));
                    this.timestampListBuffer = this.timestampList.slice(0, this.bufferSize);
                    this.currentSelectionList.push(this.timestampList[0]);
                    this.form.timestamps.setValue(this.currentSelectionList);
                }
            },
            error => {
                this.listLoading = false;
                console.log(error);
                this.setNoDataChart();
            },
            () => {
                this.listLoading = false;
                this.loadIntensiveData();
            }
        );
    }

    loadIntensiveData() {
        this.loading = true;
        this.signalService.getArrayIntensiveSignalDataForChart(this.form.name.value, this.stringToTimestamp(this.form.timestamps.value)).subscribe(
            res => {
                if (res.code == 200 && res.data.valuesList.length > 0) {
                    this.chartOptions.series = [];
                    for (let i = 0; i < res.data.valuesList.length; i++) {
                        const intensiveArray: any[] = res.data.valuesList[i];
                        let name = this.timestampToString(this.form.timestamps.value[i]);

                        for (let j = 0; j < intensiveArray.length; j++) {
                            if (j > 0) {
                                name += `_${j + 1}`;
                            }
                            //create an array with value = [1, 2, 3, 4, 5 .... length], for better performance
                            //because originally, in order to create an array [1, 2, 3, 4...] we have to do 
                            // for(){
                            //     array.push(i)
                            //  }, which is bad 
                            this.chartOptions.xAxis.data = Array.from(Array(intensiveArray[j].length + 1).keys()).slice(1);

                            this.chartOptions.series.push(
                                {
                                    name: name,
                                    data: intensiveArray[j],
                                    type: 'line'
                                }
                            );
                        }
                    }

                    this.setYesDataChart();
                } else {
                    this.setNoDataChart();
                }
            },
            error => {
                console.log(error);
                this.setNoDataChart();
                this.loading = false;
            },
            () => {
                this.loading = false;
                this.dashFinish.emit(LINE_CHART_INTENSIVE.componentType);
            }
        );
    }

    timestampSelectChange() {
        if (this.form.timestamps.value.length <= 3) {
            this.currentSelectionList = this.form.timestamps.value;
        } else {
            this.form.timestamps.setValue(this.currentSelectionList);
        }
    }

    onFilter() {
        this.loadIntensiveData();
    }

    fromDateEvent(date) {
        this.form.dateFrom.setValue(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

    toDateEvent(date) {
        this.form.dateTo.setValue(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    timestampToString(timestamp: string): string {
        return this.datePipe.transform(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
    }

    stringToTimestamp(s): string[] {
        let result = null;
        if (s) {
            if (typeof s === "string") {
                result = new Date(s).toISOString();
            } else result = s.map(e => { return new Date(e).toISOString() });
        }
        return result;
    }

    setNoDataChart() {
        const newTittle = {
            textStyle: {
                color: 'grey',
                fontSize: 20
            },
            text: 'No data in 14 days',
            left: 'center',
            top: 'center'
        };
        const yAxis = {
            show: false,
            type: 'value',
            name: '',
            nameLocation: 'center',
        };
        this.chartOptions.title = newTittle;
        this.chartOptions.xAxis.show = false;
        this.chartOptions.yAxis = yAxis;
        this.chartOptions.series = [];
    }

    setYesDataChart() {
        const newTittle = {
            textStyle: {
                color: 'black',
                fontSize: 16
            },
            text: this.form.name.value + ' intensive chart',
            left: 'top',
            top: 'left'
        };
        const yAxis = {
            type: 'value',
            name: 'Value',
            nameLocation: 'center',
            nameTextStyle: {
                padding: [0, 0, 20, 0]
            }
        };

        this.chartOptions.title = newTittle;
        this.chartOptions.xAxis.show = true;
        this.chartOptions.yAxis = yAxis;
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.timestampList.length <= this.timestampListBuffer.length) {
            return;
        }

        if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.timestampListBuffer.length) {
            this.fetchMore();
        }
    }

    fetchMore() {
        const len = this.timestampListBuffer.length;
        const more = this.timestampList.slice(len, this.bufferSize + len);
        this.timestampListBuffer = this.timestampListBuffer.concat(more);
    }
}
