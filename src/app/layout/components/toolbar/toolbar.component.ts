import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import * as LANG from '../../../../@rcm/_helpers/constant/lang-constant';
import {RcmConfigService} from '@rcm/services/config.service';
import {FuseSidebarService} from '@rcm/components/sidebar/sidebar.service';

import {navigation} from 'app/navigation/navigation';
import {Router} from '@angular/router';
import {LoginService} from 'app/main/apps/services/login.service';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';


@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy {
    @Output() showMenu = new EventEmitter<Boolean>();

    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: Array<any> = [LANG.LANG_CN, LANG.LANG_EN];
    navigation: any;
    // selectedLanguage: any;
    userStatusOptions: any[];
    isActive: Boolean = false;
    userName: string;
    langShowed: string;
    // Private
    private _unsubscribeAll: Subject<any>;

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * Constructor
     *
     * @param {RcmConfigService} _rcmConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     * @param router
     * @param _loginService
     * @param authStore
     */
    constructor(
        private _rcmConfigService: RcmConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private router: Router,
        private _loginService: LoginService,
        public authStore: AuthStore
    ) {
        // Set the defaults
        this.userStatusOptions = [
            {
                'title': 'Online',
                'icon': 'icon-checkbox-marked-circle',
                'color': '#4CAF50'
            },
            {
                'title': 'Away',
                'icon': 'icon-clock',
                'color': '#FFC107'
            },
            {
                'title': 'Do not Disturb',
                'icon': 'icon-minus-circle',
                'color': '#F44336'
            },
            {
                'title': 'Invisible',
                'icon': 'icon-checkbox-blank-circle-outline',
                'color': '#BDBDBD'
            },
            {
                'title': 'Offline',
                'icon': 'icon-checkbox-blank-circle-outline',
                'color': '#616161'
            }
        ];

        this.navigation = navigation;
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to the config changes
        this._rcmConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
        // this.selectedLanguage = _.find(this.languages, {'id': this._translateService.currentLang});
        // console.log(this._translateService.currentLang);
        if (this._translateService.currentLang === 'en') {
            this.langShowed = 'en';
        } else {
            this.langShowed = '中';
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        // this.authStore.clearStorage();
    }

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void {
        // Do your search here...
        console.log(value);
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void {
        // Set the selected language for the toolbar
        // this.selectedLanguage = lang;
        // Use the selected language for translations
        if (lang.id != this._translateService.currentLang) {
            if (lang.id === 'en') {
                this.langShowed = 'en';
            } else {
                this.langShowed = '中';
            }
            this.authStore.setLang(lang.id);
            window.location.reload();
            this._translateService.use(lang.id);
        } else {
            this.authStore.setLang(lang.id);
            this._translateService.use(lang.id);
        }

    }

    logout() {
        this._loginService.logout();
    }

    menuClick() {
        this.isActive = this.isActive !== true;
        this.showMenu.emit(this.isActive);
    }

    getUsername(): any {
        this.userName = this.authStore.getUsername();
        return this.authStore.getUsername();
    }

    navigateHome() {
        const url = './apps/home';
        this.router.navigate([url]);
    }
}
