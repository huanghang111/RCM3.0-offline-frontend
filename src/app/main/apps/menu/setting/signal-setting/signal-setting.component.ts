import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {fuseAnimations} from '../../../../../../@rcm/animations';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';

import {SignalCalDialogComponent} from './signal-cal/signal-cal.component';
import {SettingService} from 'app/main/apps/services/setting.service';
import {AuthStore} from '../../../../../../@rcm/_authentication/auth.store';
import {SignalCreateFormComponent} from './signal-create-form/signal-create-form.component';
import {HealthyFormComponent} from './healthy-form/healthy-form.component';
import {TranslateService} from '@ngx-translate/core';
import {SignalEditFormComponent} from './signal-edit-form/signal-edit-form.component';
import {environment} from '../../../../../../environments/environment';
import {CommonUtilitiesService} from '../../../../../../@rcm/_helpers/common-utilities.service';
import {TYPE_EXCEL} from '../../../../../../@rcm/_helpers/constant/export-constants';

@Component({
    selector: 'app-signal-setting',
    templateUrl: './signal-setting.component.html',
    styleUrls: ['./signal-setting.component.scss'],
    animations: fuseAnimations
})
export class SignalSettingComponent implements OnInit {

    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;
    @ViewChild('inputFile') inputFile: ElementRef;
    @ViewChild('descDialog') descDialogTemplate: TemplateRef<any>;

    displayedColumns = ['cmd', 'id', 'sigName', 'desc', 'sigType', 'action'];
    signalData: any;
    importForm: FormGroup;
    wrongType = false;
    createSelected = '';
    importFileName: string = ' ';
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    descDialogRef: MatDialogRef<any>;
    currentDesc: string = '';
    currentName: string = '';

    isLoadingData: boolean;
    dialogRef: any;
    isShowed: Boolean = false;

    totalItems: number = 0;
    currentPage: number = 1;
    itemsPerPage: number = 10;
    isExporting = false;
    isNoData = false;

    constructor(
        private settingService: SettingService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private authStore: AuthStore,
        private translateService: TranslateService,
        private commonUtil: CommonUtilitiesService) {
    }

    ngOnInit() {
        this.getSignals();
        this.importForm = new FormGroup({
            'importFile': new FormControl('', [Validators.required]),
        });
    }

    getSignals() {
        this.settingService.getSignals(this.currentPage, this.itemsPerPage, this.authStore.getProjectId()).subscribe(
            res => {
                if (res.code == 200) {
                    this.signalData = res.data.signals;
                    this.totalItems = res.data.totalElements;
                }
            },
            error => {
                const errorMess = `Error when getting signals. Error message: ${error.error.messages}`;
                this.handleError(error, errorMess);
            }
        );
    }

    createSignal() {
        this.dialogRef = this._matDialog.open(SignalCreateFormComponent, {
            panelClass: 'signal-create-form'
        });
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.getSignals();
            }
        });
    }

    editSignal(name: string) {
        this.dialogRef = this._matDialog.open(SignalEditFormComponent, {
            panelClass: 'signal-edit-form',
            data: {
                signalName: name,
                action: 'edit'
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.getSignals();
            }
        });
    }

    deleteSignal(signalName: string) {

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = this.translateService.instant('ACTION.Confirm_delete');
        this.confirmDialogRef.componentInstance.confirmHeader =
            this.translateService.instant('CONFIGURATION.Signal.Soft_delete') + ` ${signalName}`;

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.settingService.deleteSignal(signalName).subscribe(res => {
                    if (res == 200) {
                        this._matSnackBar.open(`Signal "${signalName}" is DELETED.`, 'OK', {
                            verticalPosition: 'bottom',
                            duration: 5000
                        });
                    }
                }, error => {
                    const errorMess = `Error when delete. Error message: ${error.error.messages}`;
                    this.handleError(error, errorMess);
                }, () => this.getSignals());
            }

            this.confirmDialogRef = null;
        });
    }

    importFile() {
        this.settingService.importFile(this.importForm.get('importFile').value, this.authStore.getProjectId()).subscribe(data => {
            this.getSignals();
            this._matSnackBar.open(`Import file successfully`, 'OK', {
                verticalPosition: 'bottom',
                duration: 5000
            });
        }, error => {
            const errorMess = `Import error, please check your file! \nError message: ${error.error.messages}`;
            this.handleError(error, errorMess);
        }, () => {
            this.resetImportFile();
        });
    }

    onFileSelectChange(event) {
        this.wrongType = false;
        if (event.target.files.length > 0) {
            const fileImport: File = event.target.files[0];
            this.importFileName = fileImport.name;

            if (!this.importFileName.includes(".xlsx")) {
                this.wrongType = true;
                this.resetImportFile();
            } else {
                this.importForm.get('importFile').setValue(fileImport);
            }
            this.isShowed = true;
        }
    }

    resetImportFile() {
        this.importFileName = 'No File Choosen';
        this.importForm.get('importFile').setValue('');
        this.inputFile.nativeElement.value = null;
        this.isShowed = false;
    }

    handleError(error: any, errorMessage: string) {
        console.log(`Error message: ${error.error.messages} 
        - Error status: ${error.error.status} 
        - Error code: ${error.error.code}`);
        this._matSnackBar.open(errorMessage, 'OK', {
            verticalPosition: 'bottom',
            duration: 5000
        });
    }

    onPageChange(number: number) {
        this.currentPage = number;
        this.getSignals();
    }

    onItemPerPage(event) {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.getSignals();
    }


    newCalculationSignal() {
        this.dialogRef = this._matDialog.open(SignalCalDialogComponent, {
            panelClass: 'signal-cal-dialog',
            data: {
                type: this.createSelected,
            }
        });

        this.dialogRef.afterClosed().subscribe(
            res => {
                if (res) {
                    this.getSignals();
                }
            }
        );
    }

    editHealthySignal() {
        this.dialogRef = this._matDialog.open(HealthyFormComponent, {
            panelClass: 'signal-cal-dialog',
        });
    }

    onTrigger(name): void {
        this.settingService.sendMessageTrigger(name).subscribe(
            res => {
            }, error => {
                console.log(error);
                this._matSnackBar.open(`Error triggering the signal`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }
        );
    }

    onMoreClick(name, desc) {
        this.descDialogRef = this._matDialog.open(this.descDialogTemplate);
        this.currentDesc = desc;
        this.currentName = name;
    }

    onExport() {
        this.isExporting = true;
        const url = `${environment.apiUrl}/api/signal/exportConfig?projectId=${this.authStore.getProjectId()}`;
        this.commonUtil.exportFile(url, TYPE_EXCEL, null, 'Signal_Configuration_Data.xlsx')
            .catch(error => {
                if (error.status == 404) {
                    this._matSnackBar.open(`No Signal config was found!!!`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            });
    }
}
