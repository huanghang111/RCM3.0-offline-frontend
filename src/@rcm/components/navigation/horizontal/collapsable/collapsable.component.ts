import {Component, HostBinding, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {fuseAnimations} from '@rcm/animations';
import {RcmConfigService} from '@rcm/services/config.service';
import {TranslateService} from '@ngx-translate/core';
import {AuthStore} from '@rcm/_authentication/auth.store';

@Component({
    selector: 'fuse-nav-horizontal-collapsable',
    templateUrl: './collapsable.component.html',
    styleUrls: ['./collapsable.component.scss'],
    animations: fuseAnimations
})
export class FuseNavHorizontalCollapsableComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    isOpen = false;

    @HostBinding('class')
    classes = 'nav-collapsable nav-item';

    @Input()
    item: any;
    browserLang;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _rcmConfigService: RcmConfigService,
        private _translateService: TranslateService,
        private _authStore: AuthStore
    ) {
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
        // this.browserLang = this._translateService.getBrowserLang();
        // console.log(this.browserLang);
        // if (this._authStore.getLang()) {
        //     this.browserLang = this._authStore.getLang();
        // }
        // else { this.browserLang = 'cn' }

        if (this._translateService.currentLang === 'en') {
            this.browserLang = 'en';
        } else {
            this.browserLang = 'cn';
        }

        // Subscribe to config changes
        this._rcmConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (config) => {
                    this.fuseConfig = config;
                }
            );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open
     */
    @HostListener('mouseenter')
    open(): void {
        this.isOpen = true;
    }

    /**
     * Close
     */
    @HostListener('mouseleave')
    close(): void {
        this.isOpen = false;
    }
}
