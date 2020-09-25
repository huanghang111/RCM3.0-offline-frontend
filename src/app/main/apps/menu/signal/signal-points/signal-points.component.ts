import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalService } from 'app/main/apps/services/signal.service';
import { SocketApiService } from 'app/main/apps/services/socket-api.service';
import { DATA_TYPE_BOOL } from '@rcm/_helpers/constant/signal-constants';

@Component({
    selector: 'app-signal-points',
    templateUrl: './signal-points.component.html',
    // styleUrls: ['./signal-points.component.scss']
})
export class SignalPointsComponent implements OnInit, OnDestroy {
    signalPoints: Array<any> = [];
    timeout: any;
    realTimeData: any = null;

    constructor(private signalService: SignalService,
        private socketApi: SocketApiService) {
    }

    ngOnInit() {
        this.getData();
    }

    ngOnDestroy() {
        window.clearTimeout(this.timeout);
        this.disconnectSocket();
    }

    getData() {
        this.signalService.getSignalPoints().subscribe(
            res => {
                if (res.code == 200 && res.data.listSigData.length > 0) {
                    this.signalPoints = res.data.listSigData.filter(e => e != null && e.signal != null);
                    this.signalPoints.sort((a, b) => {

                        let cmdID_a = (a.signal.cmd as number);
                        let cmdID_b = (b.signal.cmd as number);
                        if (cmdID_a === cmdID_b) {
                            let signalID_a = (a.signal.signalId as String).toLowerCase();
                            let signalID_b = (b.signal.signalId as String).toLowerCase();
                            return signalID_a > signalID_b ? 1 : -1;
                        }

                        return cmdID_a - cmdID_b;
                    })
                }
            },
            error => console.log(error),
            () => {
                if (!this.socketApi.isConnected()) {
                    this.connectSocket();

                    this.timeout = window.setTimeout(() => {
                        this.fillInValues();
                    }, 3000);
                }
            }
        );
    }

    fillInValues() {
        //looping through the signal point list to search for the one that does not have value yet
        this.signalPoints.forEach(e => {
            if (!e.signalData && !e.danger) {
                //then make a request to get the value
                this.signalService.getDataByName(e.signal.name).subscribe(
                    res => {
                        if (res.code === 200 && res.data) {
                            //apply the fetched value as a realtime data
                            if (res.data.signalData && res.data.danger) {
                                this.realTimeData = new Object({
                                    name: e.signal.name,
                                    values: res.data.signalData.values,
                                    danger: res.data.danger
                                });
                            }
                        }

                    }, error => console.log(error)
                );
            }
        });
    }

    connectSocket() {
        this.socketApi._connect('/topic/signalData', false);
        this.socketApi.receive().subscribe(
            res => {
                if (res.name) {
                    let index: number = this.signalPoints.indexOf(this.signalPoints.find(e => e.signal && e.signal.name === res.name));
                    if (index >= 0) {
                        this.realTimeData = res;
                        //if currently there is no value - meaning the first time data is loaded
                        if (!this.signalPoints[index].signalData) {
                            this.signalPoints[index].signalData = res;
                            this.signalPoints[index].danger = res.danger;
                        }
                    }
                }
            }
        );
    }

    disconnectSocket() {
        if (this.socketApi.isConnected()) {
            this.socketApi._disconnect();
        }
    }

    // test() {
    //     let res = {
    //         "id": null,
    //         "name": "System Pressure",
    //         "values": this.getRandomInt(10, 99),
    //         "timestamp": "2019-12-25T09:13:34.190Z",
    //         "danger": this.getRandomInt(1, 5)
    //     };

    //     if (res.name) {
    //         let index: number = this.signalPoints.indexOf(this.signalPoints.find(e => e.signal.name === res.name));
    //         if (index >= 0) {
    //             this.realTimeData = res;
    //         }
    //     }
    // }

    // getRandomInt(min, max): number {
    //     min = Math.ceil(min);
    //     max = Math.floor(max);
    //     return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    //   }
}
