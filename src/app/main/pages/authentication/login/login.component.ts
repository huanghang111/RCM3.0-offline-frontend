import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {RcmConfigService} from '@rcm/services/config.service';
import {LoginService} from '../../../apps/services/login.service';
import {fuseAnimations} from '@rcm/animations';
import {Router} from '@angular/router';
import * as jwtDecode from 'jwt-decode';
import {AuthStore} from '../../../../../@rcm/_authentication/auth.store';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    credentialsError = false;
    response: any;
    backgroundImage: Array<string> = [];

    /**
     * Constructor
     *
     * @param {RcmConfigService} _rcmConfigService
     * @param router
     * @param _loginService
     * @param authStore
     */
    constructor(
        private _rcmConfigService: RcmConfigService,
        private router: Router,
        private _loginService: LoginService,
        private authStore: AuthStore,
    ) {
        // Configure the layout
        this._rcmConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: false
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    get username(): any {
        return this.loginForm.get('username');
    }

    get password(): any {
        return this.loginForm.get('password');
    }

    /**
     * On init
     */
    ngOnInit(): void {
        /* THIS API CAN BE USED FOR NEXT PHASE, IN WHICH THE IMAGES CAN BE LOADED DYNAMICALLY FROM A DESIRED FOLDER*/
        // this._loginService.getBackgroundImages().subscribe(
        //     res => {
        //         if (res.code === 200 && res.data.images.length > 0) {
        //             this.backgroundImage = res.data.images.map(img => 'data:image/jpeg;base64,' + img);
        //         }
        //     },
        //     error => console.log(error)
        // );
        this.loginForm = new FormGroup({
            username: new FormControl('', [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(50)
            ]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(100)
            ])
        });
        if (this.authStore.getUsername()) {
            this.router.navigate(['/apps/home']);
        }
    }

    onLogin(): void {
        const params = {
            username: this.loginForm.value.username,
            password: this.loginForm.value.password
        };
        this._loginService.login(params).subscribe(
            res => {
                this.response = res;
                if (this.response.code === 200) {
                    const token = this.response.data.id_token;
                    const deCode = jwtDecode(token);
                    this.authStore.clearStorage();
                    this.authStore.setAuthToken(token);
                    this.authStore.setUsername(deCode.user);
                    this.authStore.setExpiredTime(deCode.exp * 1000);
                    this.authStore.setRole(deCode.auth);
                }
            },
            error => {
                if (error && error.error && error.error.code === 401) {
                    // when error happen, response body contained in error
                    console.log(error.error.messages);
                    this.credentialsError = true;
                } else {
                    console.log('Error login::::::::', error);
                }
            },
            () => {
                if (this.response.code === 200) {
                    this.router.navigate(['/apps/home']);
                }
            }
        );
    }

    onInputChange() {
        this.credentialsError = false;
    }

    /* THIS API CAN BE USED FOR NEXT PHASE, IN WHICH THE IMAGES CAN BE LOADED DYNAMICALLY FROM A DESIRED FOLDER*/
    // getBackground(img: string): string {
    //     return `url('${img}')`;
    // }
}
