import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';

@Injectable()
export class SignalService {

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     * @param authStore
     */
    constructor(
        private _httpClient: HttpClient,
        private authStore: AuthStore
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    //INTENSIVE SIGNAL SERVICE//
    getIntensiveSignals(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getSignalIntensives`,
            {params: {projectId: this.authStore.getProjectId()}});
    }

    getArrayIntensiveSignalDataForChart(signalName: string, date): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getArraySignalItensiveDataForChart?signalName=${signalName}&timestamp=${date}`);
    }

    getIntensiveSignalTimestampList(signalName: string, dateFrom: string, dateTo: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getSignalItensiveTimestampList`, {
            params: {
                signalName: signalName,
                dateFrom: dateFrom,
                dateTo: dateTo,
            }
        });
    }

    //END INTENSIVE //

    //SIGNAL POINTS SERVICE// 
    getSignalPoints(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getSignalPoints?projectId=${this.authStore.getProjectId()}`);
    }

    getSignalPointsDashboardEdit(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/getListSignalPoints?projectId=${this.authStore.getProjectId()}`);
    }

    getSignalPointByNames(signalNames): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getSignalPointByNames?signalNames=${signalNames}&projectId=${this.authStore.getProjectId()}`);
    }

    getSignalPointDataForChart(signalName: string, dateFrom: string, dateTo: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getSignalPointData?signalName=${signalName}&dateFrom=${dateFrom}&dateTo=${dateTo}`);
    }

    getArraySignalPointDataForChart(signalName: string[], dateFrom: string, dateTo: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getArraySignalPointData`,
            {
                params: {
                    signalName: signalName,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    projectId: this.authStore.getProjectId(),
                    // isGetRealtime: isGetRealtime
                }
            });
    }

    getSignalForSignalPointInfo(signalName: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/getSignalSPI?signalName=${signalName}&projectId=${this.authStore.getProjectId()}`);
    }

    getSignalByName(signalName: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/getSignalByName?signalName=${signalName}&projectId=${this.authStore.getProjectId()}`);
    }

    getDataByName(signalName: string): Observable<any>{
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getDataByName?name=${signalName}`);
    }

    //END SIGNAL POINTS

    //BAR CHART DATA 
    getDataForBarChart(signalName: string[]): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signalData/getDataForBarChart`, {params: {signalName: signalName}});
    }

    //end bar//

    getSignalExport() {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/exportPage?projectId=${this.authStore.getProjectId()}`);
    }

    exportSignalConfig(projectID: string) {
        const url = `${environment.apiUrl}/api/signal/exportConfig?projectId=${projectID}`;
        return this._httpClient.post(url, null, {responseType: 'arraybuffer'});
    }
}
