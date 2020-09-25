import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';

@Injectable()
export class VersionService implements Resolve<any> {
    versionNumber: any;

    constructor(
        private _httpClient: HttpClient
    ) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getVersions()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getVersions(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environment.apiUrl}/versions`)
                .subscribe((res: any) => {
                    this.versionNumber = res.data.version;
                    resolve(this.versionNumber);
                }, reject);
        });
    }
}
