import { Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SignalService } from '../../../../../services/signal.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
    selector: 'app-intensive-graph',
    templateUrl: './intensive-graph.component.html',
    styleUrls: ['./intensive-graph.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IntensiveGraphComponent implements OnInit {

    intensiveSignal: any = {};
    timestampList: Array<string> = [];
    timestampListBuffer: Array<string> = [];
    bufferSize: number = 30;
    numberOfItemsFromEndBeforeFetchingMore = 10;

    currentTimestamp: string = '';
    loading: boolean = false;
    listLoading: boolean = false;
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

    public intensiveDataForm = new FormGroup({
        'dateFrom': new FormControl(this.convertDate(new Date(new Date().getTime() - 86400000)), [Validators.required]),
        'dateTo': new FormControl(this.convertDate(new Date()), [Validators.required]),
    });

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
        private datePipe: DatePipe,
        private signalService: SignalService,
        public matDialogRef: MatDialogRef<IntensiveGraphComponent>,) {
        matDialogRef.disableClose = true;
        this.intensiveSignal = data.signalData;
    }

    get form() {
        return this.intensiveDataForm.controls;
    }

    ngOnInit() {
        this.loadIntensiveTimestampList();
    }

    loadIntensiveTimestampList() {
        this.listLoading = true;
        this.timestampList = [];
        this.currentTimestamp = '';

        this.signalService.getIntensiveSignalTimestampList(this.intensiveSignal.name, this.form.dateFrom.value, this.form.dateTo.value).subscribe(
            res => {
                if (res.code == 200 && res.data.timestamps.length > 0) {
                    this.timestampList = res.data.timestamps.map(e=> this.timestampToString(e));
                    this.timestampListBuffer = this.timestampList.slice(0, this.bufferSize);
                    this.currentTimestamp = this.timestampListBuffer[0];
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

        this.signalService.getArrayIntensiveSignalDataForChart(this.intensiveSignal.name, this.stringToTimestamp(this.currentTimestamp)).subscribe(
            res => {
                if (res.code == 200 && res.data.valuesList.length > 0) {
                    this.chartOptions.series = [];
                    const intensiveArray: any[] = res.data.valuesList[0];
                    let name = this.intensiveSignal.name;

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
            }
        );
    }

    onTimestampChange(event) {
        this.currentTimestamp = event;
        this.loadIntensiveData();
    }

    onFilter() {
        this.loadIntensiveTimestampList();
    }

    fromDateEvent(date) {
        this.form.dateFrom.setValue(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

    toDateEvent(date) {
        this.form.dateTo.setValue(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

    timestampToString(timestamp: string): string {
        return this.datePipe.transform(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
    }

    stringToTimestamp(s: string): string{
        return new Date(s).toISOString();
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    setNoDataChart() {
        const newTittle = {
            textStyle: {
                color: 'grey',
                fontSize: 20
            },
            text: 'No data',
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
            text: this.intensiveSignal.name + ' intensive chart',
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
