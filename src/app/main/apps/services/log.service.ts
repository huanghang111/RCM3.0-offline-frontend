import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LogService {

    constructor(private _httpClient: HttpClient) {
    }

    createLog(username: string, message: string, operation: string): Observable<any> {
        const data = {username: username, message: message, operation: operation};
        return this._httpClient.post(`${environment.apiUrl}/api/log/createLog`, data);
    }

    getLogs(params: any, page: number, pageSize: number): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/log/getLogs?page=${page - 1}&size=${pageSize}`, params);
    }

    exportLogs(params: any) {
        const url = `${environment.apiUrl}/api/log/exportLogs`;
        return this._httpClient.post(url, params, {responseType: 'arraybuffer'});
    }
}
