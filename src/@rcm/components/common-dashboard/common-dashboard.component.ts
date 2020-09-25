import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardModel } from 'app/main/apps/menu/setting/setting.model';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { FuseConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { SettingService } from 'app/main/apps/services/setting.service';
import { AuthStore } from '@rcm/_authentication/auth.store';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-common-dashboard',
    templateUrl: './common-dashboard.component.html',
    styleUrls: ['./common-dashboard.component.scss']
})
export class CommonDashboardComponent implements OnInit {
    @Input('dashboard') dashboard: DashboardModel;
    @Input('settingMode') settingMode: boolean;
    @Output('refresh') refresh = new EventEmitter();

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    hideSaveBtn: boolean = true;
    currentCheckboxState: boolean;

    constructor(private _matDialog: MatDialog,
        private router: Router,
        private settingService: SettingService,
        private _matSnackBar: MatSnackBar,
        private authStore: AuthStore,
        private _translateService: TranslateService
    ) {
    }

    ngOnInit() {
        if (this.dashboard) {
            this.currentCheckboxState = this.dashboard.addSlide;
        }
    }

    editDashboard(id): void {
        const url = 'apps/setting/project-setting/' + `${this.authStore.getProjectId()}` + '/dashboard/edit-dashboard/' + `${id}`;
        this.router.navigate([url]);
    }

    deleteDashboard(id, name): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this._translateService.get(['PROJECT.Dashboard.DeleteTitle', 'ACTION.Confirm_delete']).subscribe(translations => {
            this.confirmDialogRef.componentInstance.confirmMessage = translations['ACTION.Confirm_delete'];
            this.confirmDialogRef.componentInstance.confirmHeader = translations['PROJECT.Dashboard.DeleteTitle'] + ' ' + name;
        });

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.settingService.deleteDashboardById(id, this.authStore.getProjectId()).subscribe(
                    res => {
                        this._matSnackBar.open(`Dashboard '${name}' deleted.`, 'OK', {
                            verticalPosition: 'bottom',
                            duration: 5000
                        });
                    }, error => {
                        console.log(error);
                        this._matSnackBar.open(`Error when delete dashboard`, 'OK', {
                            verticalPosition: 'bottom',
                            duration: 5000
                        });
                    }, () => {
                        this.refresh.emit(true);
                    }
                );
            }
            this.confirmDialogRef = null;
        });
    }

    onSaveTime(dashboardId, delayTime): void {

        if (!this.currentCheckboxState) {
            delayTime = 0;
        }

        this.settingService.editDashboardSlide(dashboardId, delayTime).subscribe(
            res => {
                if (res.code == 200) {
                    this._matSnackBar.open(res.messages + ` successfully`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            },
            error => {
                this._matSnackBar.open(`Edit dashboard slide failed with error: ${error.error.messages}`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            },
            () => this.hideSaveBtn = true
        );
    }

    onCheckbox(event, id): void {
        this.hideSaveBtn = false;
        this.currentCheckboxState = event.checked;
        // if (event.checked) {

        // } else {
        //   this.hideSaveBtn = true;
        //   this.onSaveTime(id, 0);
        // }
    }

    onInputChange() {
        this.hideSaveBtn = false;
    }

    viewDetail(id: number) {
        const url = 'apps/setting/project-setting/dashboard/view-dashboard/' + `${id}`;
        this.router.navigate([url]);
    }
}
