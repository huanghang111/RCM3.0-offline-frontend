import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import {environment} from 'environments/environment';
import {OPT_LOGO} from '../../../../@rcm/_helpers/constant/log-constants';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';
import {LogService} from './log.service';
import {MatDialog} from '@angular/material/dialog';

@Injectable()
export class LoginService implements Resolve<any> {
    constructor(
        private _httpClient: HttpClient,
        public authStore: AuthStore,
        private logService: LogService,
        private router: Router,
        private dialogRef: MatDialog
    ) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
    }

    login(credentials): Observable<any> {
        return this._httpClient.post(
            `${environment.apiUrl}/api/login`,
            credentials
        );
    }

    logout() {
        const username = this.authStore.getUsername();
        this.dialogRef.closeAll();
        this.logService.createLog(username, `${username} logged out`, OPT_LOGO.key).subscribe(() => {
            this.authStore.clearStorage();
            this.router.navigate(['pages/auth/login']);
        });
    }

    //TODO DEVELOP
    refreshToken() {
        if (this.authStore.getExpiredTime()) {
            const currentTime: number = new Date().getTime();
            const beforeRefreshTime = currentTime - 30000; //30s before token expire

        }
    }

    /* THIS API CAN BE USED FOR NEXT PHASE, IN WHICH THE IMAGES CAN BE LOADED DYNAMICALLY FROM A DESIRED FOLDER*/
    // getBackgroundImages(): Observable<any> {
    //     return this._httpClient.get(`${environment.apiUrl}/api/getBackgroundImages`);
    // }
}
