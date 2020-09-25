import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';

@Injectable({
    providedIn: 'root'
})
export class DiagnoseService {

    constructor(
        private _httpClient: HttpClient,
        private authStore: AuthStore
    ) {
    }

    getAllSignalFaultWithData(page: any, pageSize: any): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/diagnose/getAllSignalFaultWithData?page=${page - 1}&size=${pageSize}&projectId=${this.authStore.getProjectId()}`);
    }

    getDiagnoseBySignalNameAndTimestamp(signalName: string, timestamp: string): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/diagnose/getDiagnoseBySignalNameAndTimestamp?signalName=${signalName}&timestamp=${timestamp}`, {observe: 'response'});
    }

    getDiagnoseDetail(page: any, pageSize: any, signalName: string): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/diagnose/getDiagnoseDetail?page=${page - 1}&size=${pageSize}&signalName=${signalName}`, {observe: 'response'});
    }

    getDiagnoseCalc(faultId: string): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/diagnose/getDiagnoseBySignalOutput?id=${faultId}`, {observe: 'response'});
    }

    acknowledgeFaultError(listIds): Observable<any> {
        return this._httpClient.put(`${environment.apiUrl}/api/diagnose/acknowledgeFaultError`, listIds, {observe: 'response'});
    }
}

