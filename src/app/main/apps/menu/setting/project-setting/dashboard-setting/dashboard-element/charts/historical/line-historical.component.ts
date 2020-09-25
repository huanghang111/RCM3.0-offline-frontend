import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {LINE_CHART_HISTORICAL} from '../../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {MatDialog, MatDialogRef} from '@angular/material';
import {SignalService} from 'app/main/apps/services/signal.service';
import {DashboardDialogComponent} from '../../dashboard-dialog/dashboard-dialog.component';
import {DatePipe} from '@angular/common';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-line-historical',
    templateUrl: './line-historical.component.html',
    styleUrls: ['./../line.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LineHistoricalComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    loading: boolean = true;
    currentSignalName: Array<string> = [''];
    colors = ['#f0062d', '#688147', '#0bc17c', '#e9b00b'];

    chartOptions: any = {
        color: this.colors,
        chart: {
            zoomType: 'x'
        },
        title: {
            text: ''
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

    dialogRef: MatDialogRef<DashboardDialogComponent>;
    public chartForm = new FormGroup({
        'dateFrom': new FormControl(this.convertDate(new Date(new Date().getTime() - 86400000 * 14)), [Validators.required]),
        'dateTo': new FormControl(this.convertDate(new Date()), [Validators.required]),
    });

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
            this.currentSignalName = this.dataRef.signalName;
            this.loadData();
        } else {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: LINE_CHART_HISTORICAL.componentType
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
        this.chartOptions.title.text = 'Historical chart';
        this.resetVariable();

        this.signalService.getArraySignalPointDataForChart(this.currentSignalName, this.form.dateFrom.value, this.form.dateTo.value)
            .subscribe(res => {
                    if (res.code == 200 && res.data.signalPointData.length > 0) {
                        for (let i = 0; i < res.data.signalPointData.length; i++) {
                            this.chartOptions.series.push(
                                {
                                    type: 'line',
                                    name: res.data.signalPointData[i].signal.name,
                                    pointInterval: 1000,
                                    yAxisIndex: [i],
                                    data: res.data.signalPointData[i].resultList.length > 0 ?
                                        res.data.signalPointData[i].resultList.map(e => [e.t, e.v]) : []
                                }
                            );
                            this.chartOptions.yAxis.push(
                                {
                                    type: 'value',
                                    name: res.data.signalPointData[i].signal.name,
                                    position: i % 2 == 0 ? 'left' : 'right',
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[i]
                                        }
                                    },
                                    nameLocation: 'center',
                                    offset: 15 * i,
                                    axisLabel: {
                                        formatter: `{value} ${res.data.signalPointData[i].signal.unit}`
                                    }
                                },
                            );
                        }
                    }
                }, error => console.log(error),
                () => {
                    this.loading = false;
                    this.dashFinish.emit(LINE_CHART_HISTORICAL.componentType);
                }
            );
    }

    onFilter() {
        this.loadData();
    }

    resetVariable() {
        this.chartOptions.series = [];
    }

    fromDateEvent(date) {
        this.form.dateFrom.setValue(this.convertDate(date));
    }

    toDateEvent(date) {
        this.form.dateTo.setValue(this.convertDate(date));
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }
}
