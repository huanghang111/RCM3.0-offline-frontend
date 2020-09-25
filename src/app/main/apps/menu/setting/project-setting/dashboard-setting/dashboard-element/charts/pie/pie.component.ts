import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ErrorService} from 'app/main/apps/services/error.service';
import {MatSnackBar} from '@angular/material';
import {ERROR_PIE_CHART} from '@rcm/_helpers/constant/dashboard-element-constant';

@Component({
    selector: 'app-pie',
    templateUrl: './pie.component.html',
    styleUrls: ['./../line.component.scss']
})
export class PieComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    loading: boolean = false;
    chartOptions = {
        grid: {
            left: '3%',
            right: '10%',
            bottom: '3%',
            containLabel: true
        },
        credits: {
            enabled: false
        },
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}<br/><b>{c}</b> records (<b>{d}%</b>)'
        },
        series: [],
    };

    errorArray: Array<any> = [
        {
            name: '',
            value: 0
        },
        {
            name: '',
            value: 0
        },
        {
            name: '',
            value: 0
        },
        {
            name: '',
            value: 0
        },
    ];

    totalCounter: number = 0;

    digit: number = 0;
    unit: string = '';
    healthyVal: string = '';
    healthyName: string = '';
    updateOptions: any;
    signalList: Array<any> = [];

    /*using getter and setter to determine when will the realtime data comes */
    _realtimeData: any;
    get realtimeData(): any {
        return this._realtimeData;
    }

    @Input('realtimeData')
    set realtimeData(realtimeData: any) {
        this._realtimeData = realtimeData;
        if (this._realtimeData.ack != undefined) { //errorData coming

            let index = this.signalList.indexOf(this.signalList.find(e => e.name === this._realtimeData.name));
            if (index >= 0) {
                this.signalList[index].occurrence++;
            } else {
                this.signalList.push(new Object({
                    level: this._realtimeData.threshold.level,
                    name: this._realtimeData.name,
                    occurrence: 1
                }));
            }

            this.totalCounter++;
            this.signalList.sort((a, b) => {
                return b.occurrence - a.occurrence;
            });

            let len: number = this.signalList.length > 3 ? 3 : this.signalList.length;

            for (let i = 0; i < len; i++) {
                this.errorArray[i] = {
                    name: this.signalList[i].name + ' - ' + this.signalList[i].level,
                    value: this.signalList[i].occurrence
                };
            }
            this.errorArray[3] = {
                name: 'Others',
                value: this.totalCounter - (this.errorArray[0].value + this.errorArray[1].value + this.errorArray[2].value)
            };
            this.redrawChart();
        } else { //signalData coming
            if (this._realtimeData.name === this.healthyName) {
                this.healthyVal = parseFloat(this.realtimeData.values.toFixed(this.digit)).toString() + ' ' + this.unit;
            }
        }
    }

    /**************************************************/
    constructor(private errorService: ErrorService,
                private _matSnackBar: MatSnackBar,
    ) {
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.errorService.getDataForPieChart().subscribe(
            res => {
                if (res.code == 200) {
                    this.digit = res.data.setData.sigDataHealthy.digit ? parseInt(res.data.setData.sigDataHealthy.digit) : 1;
                    this.unit = res.data.setData.sigDataHealthy.unit ? res.data.setData.sigDataHealthy.unit : '';

                    if (res.data.setData.sigDataHealthy.data) {
                        this.healthyVal = parseFloat(res.data.setData.sigDataHealthy.data.values.toFixed(this.digit)).toString() + ' ' + this.unit;
                    }

                    this.healthyName = res.data.setData.sigDataHealthy.name;

                    this.signalList = res.data.setData.errorList.filter(e => e != null);

                    this.signalList.sort((a, b) => {
                        return b.occurrence - a.occurrence;
                    });

                    this.signalList.forEach(element => {
                        if (element.occurrence) {
                            this.totalCounter += element.occurrence;
                        }
                    });

                    //if have more than 4 signals => len =4; else len = signal list length
                    let len: number = this.signalList.length > 4 ? 4 : this.signalList.length;

                    for (let i = 0; i < len; i++) {
                        this.errorArray[i] = {
                            name: this.signalList[i].name + ' - ' + this.signalList[i].level,
                            value: this.signalList[i].occurrence
                        };
                    }

                    this.errorArray[3] = {
                        name: 'Others',
                        value: this.totalCounter - (this.errorArray[0].value + this.errorArray[1].value + this.errorArray[2].value)
                    };

                    this.chartOptions.series.push(
                        {
                            type: 'pie',
                            radius: ['100%', '70%'],
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                }
                            },
                            data: [
                                {
                                    name: this.errorArray[0].name,
                                    value: this.errorArray[0].value
                                },
                                {
                                    name: this.errorArray[1].name,
                                    value: this.errorArray[1].value
                                },
                                {
                                    name: this.errorArray[2].name,
                                    value: this.errorArray[2].value
                                },
                                {
                                    name: this.errorArray[3].name,
                                    value: this.errorArray[3].value
                                }
                            ],
                        }
                    );
                }
            }, error => {
                this._matSnackBar.open(`There is an error. Error message: ${error.error.messages}`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                });
            },
            () => {
                this.loading = false;
                this.dashFinish.emit(ERROR_PIE_CHART.componentType);
            }
        );
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    redrawChart() {
        let updatedData: Array<any> = [
            {
                name: this.errorArray[0].name,
                value: this.errorArray[0].value
            },
            {
                name: this.errorArray[1].name,
                value: this.errorArray[1].value
            },
            {
                name: this.errorArray[2].name,
                value: this.errorArray[2].value
            },
            {
                name: this.errorArray[3].name,
                value: this.errorArray[3].value
            }
        ];

        this.updateOptions = {
            series: [{
                data: updatedData
            }]
        }
    }

}
