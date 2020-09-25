import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {RcmConfigService} from '@rcm/services/config.service';
import {FuseNavigationService} from '@rcm/components/navigation/navigation.service';
import {FuseSidebarService} from '@rcm/components/sidebar/sidebar.service';
import {RcmSplashScreenService} from '@rcm/services/splash-screen.service';
import {RcmTranslationLoaderService} from '@rcm/services/translation-loader.service';

import {navigation} from 'app/navigation/navigation';
import {AuthStore} from '@rcm/_authentication/auth.store';
import {HttpCancelService} from './main/apps/services/http-cancel.service';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {RcmConfigService} _rcmConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {RcmSplashScreenService} _rcmSplashScreenService
     * @param {RcmTranslationLoaderService} _rcmTranslationLoaderService
     * @param {Platform} _platform
     * @param {TranslateService} _translateService
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _rcmConfigService: RcmConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _rcmSplashScreenService: RcmSplashScreenService,
        private _rcmTranslationLoaderService: RcmTranslationLoaderService,
        // private _translateService: TranslateService,
        private _platform: Platform,
        public translate: TranslateService,
        private _authStore: AuthStore,
        private httpCancelService: HttpCancelService
    ) {
        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // // Add languages
        // this._translateService.addLangs(['en', 'tr']);

        // // Set the default language
        // this._translateService.setDefaultLang('en');

        // // Set the navigation translations
        // this._rcmTranslationLoaderService.loadTranslations(navigationEnglish, navigationTurkish);

        // // Use a language
        // this._translateService.use('en');

        translate.addLangs(['en', 'cn']);
        translate.setDefaultLang('cn');

        // const browserLang = translate.getBrowserLang();
        // translate.use(browserLang.match(/en|cn/) ? browserLang : 'cn');

        if (_authStore.getLang()) {
            translate.use(_authStore.getLang());
        } else {
            translate.use('cn');
        }

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
         setTimeout(() => {
            translate.setDefaultLang('en');
            translate.setDefaultLang('cn');
         });

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

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

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                } else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });
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
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    cancelRequest() {
        this.httpCancelService.cancelPendingRequests();
    }

    hideSpinner() {
        this.cancelRequest();
        const element: HTMLElement = <HTMLElement>document.querySelector('.loading-spinner');
        if (element) {
            element.hidden = true;
        }
    }
}
