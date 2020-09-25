import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {SignalService} from 'app/main/apps/services/signal.service';
import {SettingService} from 'app/main/apps/services/setting.service';

@Component({
    selector: 'app-healthy-form',
    templateUrl: './healthy-form.component.html',
    styleUrls: ['./healthy-form.component.scss']
})
export class HealthyFormComponent implements OnInit {

    currentHealthy = '';
    signalNames: Array<any> = [];

    constructor(
        public matDialogRef: MatDialogRef<HealthyFormComponent>,
        private settingService: SettingService,
        private signalService: SignalService,
        private matSnackBar: MatSnackBar) {
        matDialogRef.disableClose = true;
    }

    ngOnInit() {
        this.getHealthy();
        this.getSignals();
    }

    onSet(): void {
        this.settingService.modifyHealthy(this.currentHealthy).subscribe(
            res => {
                if (res.code == 201) {
                    this.matSnackBar.open(`Set healthy signal as ${this.currentHealthy} successfully.`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                    this.matDialogRef.close({
                        status: 'success'
                    });
                }
            }
        );
    }

    getSignals(): void {
        this.signalService.getSignalPointsDashboardEdit().subscribe(
            res => {
                if (res.code == 200 && res.data.signalPoints.length > 0) {
                    this.signalNames = res.data.signalPoints.map(e => e.name);
                }
            }, error => console.log(error)
        );
    }

    getHealthy(): void {
        this.settingService.getHealthyOfProject().subscribe(
            res => {
                if (res.body.code == 200 && res.body.data.healthyInfo) {
                    this.currentHealthy = res.body.data.healthyInfo.signalName;
                }
            }
        );
    }
}
