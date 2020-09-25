import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardModel } from '../setting.model';
import { AuthStore } from '@rcm/_authentication/auth.store';
import { SettingService } from 'app/main/apps/services/setting.service';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    dashboards: DashboardModel[] = [];
    isValid: boolean = true;

    constructor(private router: Router,
        private settingService: SettingService,
        private authStore: AuthStore,
        private _matSnackBar: MatSnackBar
    ) {
    }

    ngOnInit() {
        this.getProject();
    }

    startSlide() {
        if (this.isValid) {
            const url = 'apps/setting/dashboard/slide-dashboard';
            this.router.navigate([url]);
        } else {
            this._matSnackBar.open(`Slide has not been set. Please go to Setting and configure it first`, 'OK', {
                verticalPosition: 'bottom',
                duration: 4000
            });
        }
    }

    getProject(): void {
        this.settingService.getProjectById(this.authStore.getProjectId()).subscribe(
            res => {
                if (res.body.code == 200 && res.body.data.project) {
                    this.dashboards = res.body.data.project.dashboards.filter(e => e != null);

                    //if no dashboards set slide => can't start slide
                    this.isValid = this.dashboards.find(e => e.addSlide === true) ? true : false;
                }
            },
            error => {
                console.log(error);
            }
        );
    }
}
