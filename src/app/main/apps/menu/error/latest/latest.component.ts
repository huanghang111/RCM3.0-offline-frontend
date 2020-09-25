import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../../services/error.service';
import { RelatedDataComponent } from '../../../../../../@rcm/components/related-data/related-data.component';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SocketApiService } from 'app/main/apps/services/socket-api.service';
import { SignalService } from 'app/main/apps/services/signal.service';
import { DATA_TYPE_BOOL } from '../../../../../../@rcm/_helpers/constant/signal-constants';

@Component({
    selector: 'app-latest',
    templateUrl: './latest.component.html',
    styleUrls: ['./latest.component.scss']
})
export class LatestComponent implements OnInit, OnDestroy {

    selectAllText: string;
    checkedAll: boolean = false;
    checkedItems: Array<any> = [];
    signalList: Array<any> = [];

    isAcknowledge: boolean = true;
    currentSort: number = 0;
    dataSourceArray: Array<any> = [];

    totalItems: number = 0;
    currentPage: number = 1;
    itemsPerPage: number = 10;
    displayedColumns: string[] = ['sigIDData', 'sigName', 'value', 'threshold', 'timestamp', 'relatedData'];
    dialogRef: any;

    constructor(private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private errorService: ErrorService,
        private datePipe: DatePipe,
        private _translateService: TranslateService,
        private socketApi: SocketApiService,
        private signalService: SignalService) {
    }


    ngOnInit() {
        this.loadSignalList(); //need this to check if incoming realtime signal belongs to current project
        this._translateService.get('ERROR.LATEST.Select').subscribe(translation => {
            this.selectAllText = translation;
        });
    }

    ngOnDestroy() {
        this.disconnectSocket();
    }

    loadSignalList() {
        this.signalService.getSignalPointsDashboardEdit().subscribe(
            res => {
                if (res.code == 200 && res.data.signalPoints.length > 0) {
                    this.signalList = res.data.signalPoints.filter(e => e != null);
                }
            }, error => console.log(error),
            () => this.loadData()
        );
    }

    loadData() {
        this.disconnectSocket();
        this.dataSourceArray = [];
        this.checkedItems = [];
        this.errorService.getListLatestError(this.currentPage, this.itemsPerPage).subscribe(
            response => {
                if (response.code == 200 && response.data.totalElements > 0) {
                    this.dataSourceArray = response.data.errors.filter(e => e != null);
                    this.totalItems = response.data.totalElements;
                    this.dataSourceArray.forEach(element => {
                        if (element.dataType !== DATA_TYPE_BOOL) {
                            let digit = element.digit ? element.digit : 1;
                            element.signalError[0].values = parseFloat(element.signalError[0].values.toFixed(digit));
                            element.signalError[1].values = parseFloat(element.signalError[1].values.toFixed(digit));
                        }
                        this.checkedItems.push({
                            checked: false,
                            name: element.signalName,
                            signalError: element.signalError
                        });
                    });
                }
            },
            error => console.log(error),
            () => {
                if (!this.socketApi.isConnected()) {
                    this.connectSocket();
                }
            }
        );
    }

    //get the latest error record of signal Error
    getLatestError(signalName: string, level: string) {
        this.errorService.getLatestRecord(signalName, level).subscribe(
            res => {
                if (res.code == 200 && res.data) {
                    let index = this.dataSourceArray.indexOf(this.dataSourceArray.find(e=> e.signalName === res.data.latestError.name
                        && e.signalError[1].threshold.id === res.data.latestError.threshold.id));
                    if(index >= 0){
                        let signalError = this.dataSourceArray[index].signalError[1];
                        signalError.id = res.data.latestError.id;
                        signalError.timestamp = res.data.latestError.timestamp;
                        signalError.ack = res.data.latestError.ack;
                        signalError.threshold = res.data.latestError.threshold;
                        if (this.dataSourceArray[index].dataType !== DATA_TYPE_BOOL) {
                            let digit = this.dataSourceArray[index].digit ? this.dataSourceArray[index].digit : 1;
                            signalError.values = parseFloat(res.data.latestError.values.toFixed(digit));
                        }
                    }
                }
            }
        );
    }

    panelClick(signalError) {
        //only if 2 signal errors have the same id, which means currently there is no latest error for this
        if (signalError[0].id == signalError[1].id) {
            this.getLatestError(signalError[0].name, signalError[0].threshold.level);
        }
    }

    onCheckAll(event) {
        this.checkedItems.forEach((element) => {
            element.checked = event.checked;
        });
        this.checkedAll = event.checked;
        if (event.checked) {
            this._translateService.get('ERROR.LATEST.Unselect').subscribe(translation => {
                this.selectAllText = translation;
            });
        } else {
            this._translateService.get('ERROR.LATEST.Select').subscribe(translation => {
                this.selectAllText = translation;
            });
        }
        ;
    }

    onCheckItem(event, signalName, signalError) {
        if (!event.checked) {
            if (this.isCheckAll()) {
                this.checkedAll = false;
                this._translateService.get('ERROR.LATEST.Select').subscribe(translation => {
                    this.selectAllText = translation;
                });
            } else {
                this._translateService.get('ERROR.LATEST.Unselect').subscribe(translation => {
                    if (this.selectAllText === translation) {
                        this._translateService.get('ERROR.LATEST.Select').subscribe(res => {
                            this.selectAllText = res;
                        });
                    }
                });

            }
        } else if (event.checked) {
            if (!this.isCheckAll()) {
                this.checkedAll = true;
                this._translateService.get('ERROR.LATEST.Select').subscribe(translation => {
                    this.selectAllText = translation;
                });
            } else {
                this._translateService.get('ERROR.LATEST.Unselect').subscribe(translation => {
                    this.selectAllText = translation;
                });
            }

        }

        this.checkedItems.find(element => {
            return element.name == signalName && element.signalError == signalError;
        }).checked = event.checked;

        //if all records are checked, checkall will be true. If one is uncheck, false
        this.checkedAll = this.isCheckAll();
    }

    isCheckAll(): boolean {
        return this.checkedItems.every(element => {
            return element.checked;
        });
    }

    openRelatedData(sigId: number, element: any) {
        this.dialogRef = this._matDialog.open(RelatedDataComponent, {
            panelClass: 'related-data',
            data: {
                signalId: sigId,
                error: element,
                action: 'view'
            },
        });
    }

    acknowledge(errors: any[], thresholdLevel: string) {
        let listErrorId: string[] = [];
        for (let data of errors) {
            listErrorId.push(data.id);
        }
        const dataCall = { listErrorId, thresholdLevel: thresholdLevel };
        this.errorService.acknowledgeLatestError(dataCall).subscribe(
            res => {
            },
            error => {
                console.log(error);
                this._matSnackBar.open(`Error when trying to acknowlegde record`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                });
            },
            () => this.loadData()
        );
    }

    onPageChange(number: number) {
        this.currentPage = number;
        this.loadData();
    }

    onItemPerPage(event) {
        this.currentPage = 1;
        this.itemsPerPage = event;
        this.checkedItems = [];
        this.checkedAll = false;
        this.onCheckAll(!event.checked);
        this.loadData();
    }

    onExport() {
        if (this.checkedItems.filter(e => e.checked == true).length > 0) {
            let names: Array<string> = [];
            let thresholdIds: Array<string> = [];
            this.checkedItems.forEach(element => {
                if (element.checked) {
                    names.push(element.name);
                    thresholdIds.push(element.signalError[0].threshold.id);
                }
            });
            this.errorService.exportLastestData(names, thresholdIds)
                .catch(e => {
                    this._matSnackBar.open(`Error when trying to download file`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                });
        } else {
            this._matSnackBar.open(`No record was chosen to export`, 'OK', {
                verticalPosition: 'bottom',
                duration: 5000
            });
        }
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    }

    connectSocket() {
        this.socketApi._connect('/topic/errorData', false);
        this.socketApi.receive().subscribe(
            res => {
                if (res.name) {
                    if (res.dataType !== DATA_TYPE_BOOL) { //round up number if not boolean
                        let digit = res.digit ? res.digit : 1;
                        res.values = parseFloat(res.values.toFixed(digit));
                    }
                    //because errors come in as a pair of 2 errorDatas, and the 2nd errorData is always the latest, which we are going to change => signalError[1]
                    let signal = this.dataSourceArray.find(e => e.signalName === res.name
                        && e.signalError[1].threshold.id === res.threshold.id); // compare its name and its latest threshold.id => get the signal
                    if (signal) { //if the signal exists in the list
                        let signalError = signal.signalError[1];
                        if (signalError) {
                            signalError.id = res.id;
                            signalError.timestamp = res.timestamp;
                            signalError.ack = res.ack;
                            signalError.threshold = res.threshold;
                            signalError.values = res.values;
                            signal.count++;
                        }
                    } else {// new sigError, not in the signalError list => add new
                        let index: number = this.signalList.indexOf(this.signalList.find(e => e.name === res.name));

                        if (index >= 0 && this.dataSourceArray.length < 10) {
                            let newSignal = {
                                signalName: res.name,
                                signalError: [res, { ...res }],
                                count: 1,
                                signalDBId: this.signalList[index].id
                            };
                            this.checkedItems.splice(0, 0, {
                                checked: false,
                                id: this.signalList[index].id,
                                signalError: newSignal.signalError
                            });
                            this.dataSourceArray.splice(0, 0, newSignal);
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

    // testClick() {
    //     let res = {
    //         "id": null,
    //         "name": "tcpint32",
    //         "values": Math.random() * 590,
    //         "timestamp": new Date().toISOString(),
    //         "ack": false,
    //         "threshold": {
    //             "id": "5df9d2eca76aed4d04450c67",
    //             "values": "870",
    //             "level": "Too_Low",
    //             "errorMessages": "Very low float TCP",
    //             "relatedSignals": []
    //         }
    //     }

    //     //because errors come in as a pair of 2 errorDatas, and the 2nd errorData is always the latest, which we are going to change => signalError[1]
    //     let signal = this.dataSourceArray.find(e => e.signalName === res.name
    //         && e.signalError[1].threshold.id === res.threshold.id); // compare its name and its latest threshold.id => get the signalError
    //     if (signal) { //if the sigError exists in the list
    //         let signalError = signal.signalError[1];
    //         if (signalError) {
    //             signalError.id = res.id;
    //             signalError.timestamp = res.timestamp;
    //             signalError.ack = res.ack;
    //             signalError.threshold = res.threshold;
    //             signalError.values = res.values;
    //             signal.count++;
    //         }
    //     } else {
    //         let index: number = this.signalList.indexOf(this.signalList.find(e => e.name === res.name));

    //         if (index >= 0) {
    //             let newSignal = {
    //                 signalName: res.name,
    //                 signalError: [res, { ...res }],
    //                 count: 1,
    //                 signalDBId: this.signalList[index].id
    //             };
    //             this.checkedItems.splice(0, 0, {
    //                 checked: false,
    //                 id: this.signalList[index].id,
    //                 signalError: newSignal.signalError
    //             });
    //             this.dataSourceArray.splice(0, 0, newSignal);
    //         }
    //     }
    // }
}


