import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {AuthenticationProfileService} from '@rcm/_authentication/authentication-profile.services';
import {AuthStore} from '@rcm/_authentication/auth.store';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ErrorService {

    constructor(
        private _httpClient: HttpClient,
        private authService: AuthenticationProfileService,
        private authStore: AuthStore,
        private router: Router
    ) {
    }

    getListLatestError(page: number, size: number): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/latestError?page=${page - 1}&size=${size}&projectId=${this.authStore.getProjectId()}`);
    }

    getLatestRecord(signalName: string, level: string): Observable<any>{
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/latestErrorByNameAndLevel?name=${signalName}&level=${level}`);
    }

    totalLatestError(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/totalLatestError?projectId=${this.authStore.getProjectId()}`);
    }

    acknowledgeLatestError(listErrorId): Observable<any> {
        return this._httpClient.put(`${environment.apiUrl}/api/signalError/ackListError`, listErrorId, {observe: 'response'});
    }

    exportLastestData(names: any, thresholdIds: any) {
        if (this.authService.isUserLoggedIn()) {
            return this._httpClient.get(`${environment.apiUrl}/api/signalError/exportLastestData?projectId=${this.authStore.getProjectId()}&signalNames=${names}&thresholdIds=${thresholdIds}`,
                {responseType: 'arraybuffer'}).toPromise()
                .then(response => {
                    const blob = new Blob([response], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, 'exported_latestError.xlsx');
                    } else {
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('style', 'display:none;');
                        document.body.appendChild(a);
                        a.href = downloadUrl;
                        a.download = 'exported_latestError.xlsx';
                        a.click();
                    }
                });
        } else {
            this.authStore.clearStorage();
            this.router.navigate(['/pages/auth/login']);
        }
    }

    exportHistoryDataByTime(names: any, dateFrom: string, dateTo: string, orderBy: string) {
        if (this.authService.isUserLoggedIn()) {
            return this._httpClient.get(`${environment.apiUrl}/api/signalError/exportHistoryDataByTime?dateFrom=${dateFrom}&dateTo=${dateTo}&signalNames=${names}&orderBy=${orderBy}&projectId=${this.authStore.getProjectId()}`,
                {responseType: 'arraybuffer'}).toPromise()
                .then(response => {
                    const blob = new Blob([response], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, 'exported_historyErrorByTime.xlsx');
                    } else {
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('style', 'display:none;');
                        document.body.appendChild(a);
                        a.href = downloadUrl;
                        a.download = 'exported_historyErrorByTime.xlsx';
                        a.click();
                    }
                });
        } else {
            this.authStore.clearStorage();
            this.router.navigate(['/pages/auth/login']);
        }

    }

    exportHistoryDataBySignal(names: any, dateFrom: string, dateTo: string) {
        if (this.authService.isUserLoggedIn()) {
            return this._httpClient.get(`${environment.apiUrl}/api/signalError/exportHistoryDataBySignal?signalNames=${names}&dateFrom=${dateFrom}&dateTo=${dateTo}&projectId=${this.authStore.getProjectId()}`,
                {responseType: 'arraybuffer'}).toPromise()
                .then(response => {
                    const blob = new Blob([response], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, 'exported_historyErrorBySignal.xlsx');
                    } else {
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('style', 'display:none;');
                        document.body.appendChild(a);
                        a.href = downloadUrl;
                        a.download = 'exported_historyErrorBySignal.xlsx';
                        a.click();
                    }
                });
        } else {
            this.authStore.clearStorage();
            this.router.navigate(['/pages/auth/login']);
        }
    }

    getHistoryBySignal(names: string[], dateFrom: string, dateTo: string, page: number, size: number): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/getAllErrorPage?signalNames=${names}&dateFrom=${dateFrom}&dateTo=${dateTo}&page=${page - 1}&size=${size}&projectId=${this.authStore.getProjectId()}`);
    }

    getSignalErrors(signalName: string, dateFrom: string, dateTo: string, page: number, size: number): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/getHistoryByNameSingle?name=${signalName}&dateFrom=${dateFrom}&dateTo=${dateTo}&page=${page - 1}&size=${size}&projectId=${this.authStore.getProjectId()}`);
    }

    getHistoryByTimeAsc(names: any, dateFrom: string, dateTo: string, page: number, size: number): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/getHistoryByTimeAsc?signalNames=${names}&dateFrom=${dateFrom}&dateTo=${dateTo}&page=${page - 1}&size=${size}&projectId=${this.authStore.getProjectId()}`);
    }

    getHistoryByTimeDesc(names: any, dateFrom: string, dateTo: string, page: number, size: number): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/getHistoryByTimeDesc?signalNames=${names}&dateFrom=${dateFrom}&dateTo=${dateTo}&page=${page - 1}&size=${size}&projectId=${this.authStore.getProjectId()}`);
    }

    getSignalIdList(dateFrom: string, dateTo: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/getIdListByTime?dateFrom=${dateFrom}&dateTo=${dateTo}&projectId=${this.authStore.getProjectId()}`);
    }

    getDataForPieChart(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalError/getDataForPieChart?projectId=${this.authStore.getProjectId()}`);
    }
}
