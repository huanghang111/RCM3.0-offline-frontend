import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { RcmConfigService } from '@rcm/services/config.service';
import { navigation } from 'app/navigation/navigation';
import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';
import { NavigationStart, Router, NavigationEnd } from '@angular/router';
import { AuthStore } from '../../../../@rcm/_authentication/auth.store';

@Component({
    selector: 'horizontal-layout-1',
    templateUrl: './layout-1.component.html',
    styleUrls: ['./layout-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HorizontalLayout1Component implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;

    isShow: boolean = false;
    isToggleClicked: boolean = false;
    isShowSubmenu: boolean = true;
    isFullscreen: boolean = false;

    @ViewChild(ToolbarComponent)
    private toolbarComponent: ToolbarComponent;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {RcmConfigService} _rcmConfigService
     * @param router
     * @param authStore
     */
    constructor(
        private _rcmConfigService: RcmConfigService,
        private router: Router,
        private authStore: AuthStore
    ) {
        // Set the defaults
        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this._rcmConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });
        this.router.events.subscribe(
            routeChange =>
                {
                    if(routeChange instanceof NavigationStart) {
                        this.onRouteChange(routeChange);
                    } else if( routeChange instanceof NavigationEnd){
                        this.isFullscreen = this.router.url.includes("slide-dashboard");
                    }
                }
        );


    }

    onRouteChange(routeChange: NavigationStart) {
        this.isShowSubmenu = !!this.authStore.getProjectId();
    }

    // isFullScreen(): boolean {
    //     return this.authStore.getFullScreen();
    // }

    onShowMenuChange(isMenuShow) {
        this.isShow = isMenuShow;
        this.isToggleClicked = true;
    }

    onClickedOutside(e: Event) {
        // console.log(this.isShow)
        if (this.isToggleClicked) {
            this.isToggleClicked = false;
        } else {
            this.isShow = false;
            this.toolbarComponent.isActive = false;
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
