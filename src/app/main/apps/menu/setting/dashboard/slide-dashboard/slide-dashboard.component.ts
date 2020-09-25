import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DashboardModel } from '../../setting.model';
import { SettingService } from 'app/main/apps/services/setting.service';
import { AuthStore } from '@rcm/_authentication/auth.store';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-slide-dashboard',
    templateUrl: './slide-dashboard.component.html',
    styleUrls: ['./slide-dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SlideDashboardComponent implements OnInit, OnDestroy {

    dashboards: DashboardModel[] = [];
    dashboardIDs: Array<any> = [];

    currentTimeout: any;
    timerInterval: any;

    currentDashboardID: number;
    reloadDashboard = true;
    currentDelayTime: number;
    currentSlideNumber: number = 1;
    displayTime: number;
    componentLoaded: boolean = false;
    daysLoaded: boolean = false;
    newLoaded: boolean = false;

    constructor(@Inject(DOCUMENT) private document: any, private settingService: SettingService, private authStore: AuthStore, private router: Router, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.getDashboard();
        this.openFullscreen();
    }

    getDashboard() {
        this.settingService.getProjectById(this.authStore.getProjectId()).subscribe(
            res => {
                if (res.status == 200 && res.body.data.project) {
                    this.dashboards = [];
                    this.dashboardIDs = [];

                    this.dashboards = res.body.data.project.dashboards.filter(e => e.addSlide === true);
                    // get ids of dashboards
                    this.dashboardIDs = this.dashboards.map(e => e.id);

                    // set the first slide
                    this.currentDashboardID = this.dashboardIDs[0]; //send the first ID to add-edit-dashboard.component
                    this.displayTime = this.dashboards[0].delayTime;
                }
            }
        );
    }

    //check if the dashboard has finished loading, if it does, start setting timeout for next dashboard
    checkLoading(event: boolean, type: string, dashboardID: number) {

        switch (type) {
            case 'component': this.componentLoaded = event;
                break;
            case 'new': this.newLoaded = event;
                break;
            case 'days': this.daysLoaded = event;
                break;
        }

        if (this.componentLoaded && this.newLoaded && this.daysLoaded && dashboardID === this.currentDashboardID) { //after all components are loaded
            // console.log("All component loaded ...");
            this.componentLoaded = false;
            this.daysLoaded = false;
            this.newLoaded = false;
            this.checkTimeOut(dashboardID);
        }
    }

    //set timeout of slides
    checkTimeOut(dashboardID: number) {
        let dashboard: DashboardModel = this.dashboards.find(e => e.id === dashboardID);

        this.currentDelayTime = (dashboard.delayTime * 1000);
        this.displayTime = dashboard.delayTime;

        this.startTimer();

        this.currentTimeout = setTimeout(() => {
            this.nextDash();
        }, this.currentDelayTime);
    }

    onSlideChange(index: number) {
        this.reloadDashboard = false;
        this.stopTimer();
        this.stopTimeout();

        this.currentDashboardID = this.dashboardIDs[index]; //send the dashboard ID to add-edit-dashboard.component => trigger checkLoading()
        this.currentSlideNumber = index + 1;

        //use this to reload the slide
        setTimeout(() => {
            this.reloadDashboard = true;
        }, 0);
    }

    nextDash() {
        let i = this.dashboardIDs.indexOf(this.currentDashboardID); //get current slide index

        if (i == this.dashboardIDs.length - 1) //reached final id
        {
            i = 0;
        }// refresh to 0
        else {
            i++;
        }

        this.onSlideChange(i);
    }

    previousDash() {
        let i = this.dashboardIDs.indexOf(this.currentDashboardID); //get current slide index

        if (i == 0) // on first id
        {
            i = this.dashboardIDs.length - 1;
        }// refresh to last id
        else {
            i--;
        }

        this.onSlideChange(i);
    }

    stopTimeout() {
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
    }

    startTimer() {
        this.stopTimer();

        this.timerInterval = setInterval(() => {
            if (this.displayTime > 0) {
                this.displayTime--;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    openFullscreen() {
        // this.authStore.setFullScreen('true');
        let elem;
        elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }

    closeFullscreen() {
        this.ngOnDestroy();
        if (this.document.exitFullscreen) {
            try {
                this.document.exitFullscreen();
            } catch (e) {
                console.log('Close successfully');
            }
        } else if (this.document.mozCancelFullScreen) {
            /* Firefox */
            this.document.mozCancelFullScreen();
        } else if (this.document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            this.document.webkitExitFullscreen();
        } else if (this.document.msExitFullscreen) {
            /* IE/Edge */
            this.document.msExitFullscreen();
        }

        this.router.navigate(['apps/setting/dashboard']);
    }

    ngOnDestroy() {
        // this.authStore.setFullScreen("false");
        this.stopTimeout();
        this.stopTimer();
    }

}
