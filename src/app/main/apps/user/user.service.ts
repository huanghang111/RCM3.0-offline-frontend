import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private _httpClient: HttpClient
    ) {
    }

    getAllSignalAd(page: any, pageSize: any): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/user/getUser?page=${page - 1}&size=${pageSize}`);
    }

    getAllSignal(page: any, pageSize: any): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/user/getAllUser?page=${page - 1}&size=${pageSize}`);
    }

    resetPassword(userId: string, newPassword: string) {
        const data = {loginName: userId, newPassword: newPassword};
        return this._httpClient
            .post(`${environment.apiUrl}/api/user/reset-user-password`, data);
    }
}
