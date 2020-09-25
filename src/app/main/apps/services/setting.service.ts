import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {map} from 'rxjs/operators';
import {DashboardModel, IProject} from '../menu/setting/setting.model';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonUtilitiesService} from '../../../../@rcm/_helpers/common-utilities.service';

type EntityResponseType = HttpResponse<IProject>;

@Injectable({
    providedIn: 'root'
})
export class SettingService {

    public data: any;

    constructor(
        private _httpClient: HttpClient,
        private authStore: AuthStore,
        private _matSnackBar: MatSnackBar,
        private commonUtil: CommonUtilitiesService
    ) {
    }

    // Project-setting services
    createProject(formData: FormData): Observable<any> {
        return this._httpClient
            .post(`${environment.apiUrl}/api/project`, formData, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    getAllProjects(): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/project/getAllProjects`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    deleteProjectById(id: string): Observable<any> {
        const data = {signalId: id};
        return this._httpClient
            .post(`${environment.apiUrl}/api/project/delete`, data);
    }

    getProjectById(projectId: string): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/project/getProjectById?projectId=${projectId}`, {observe: 'response'});
    }

    // Document setting services//
    createDocument(formData: FormData): Observable<any> {
        return this._httpClient
            .post(`${environment.apiUrl}/api/document`, formData, {observe: 'response'});
    }

    getAllDocuments(): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/document/getAllDocuments`, {observe: 'response'});
    }

    // End project service//

    deleteDocumentByTitle(title: string): Observable<any> {
        return this._httpClient
            .delete(`${environment.apiUrl}/api/document/${title}`, {observe: 'response'});
    }

    // Signal setting services//
    getSignals(page: any, pageSize: any, projectId: string): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/signal/getAll?page=${page - 1}&size=${pageSize}&projectID=${projectId}`);
    }

    getSignalsByTypeNotIn(type: any, page: any, pageSize: any): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/signal/getAllByTypeNotIn?page=${page - 1}&size=${pageSize}&dataType=${type}&projectId=${this.authStore.getProjectId()}`);
    }

    // End document service

    getMethodsByType(methodType: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/method/getMethodByType?methodType=${methodType}`);
    }

    updateCalculation(calculation): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/calculations?projectId=${this.authStore.getProjectId()}`, calculation);
    }

    updateDiagnoseCalculation(calculation): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/diagnose?projectId=${this.authStore.getProjectId()}`, calculation);
    }

    importFile(file: File, projectId: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        return this._httpClient
            .post(`${environment.apiUrl}/api/signal/doImport`, formData);
    }

    deleteSignal(signalName: string): Observable<any> {
        const data = {signalName: signalName, projectId: this.authStore.getProjectId()};
        return this._httpClient
            .post(`${environment.apiUrl}/api/signal/delete`, data);
    }

    update(formData: FormData): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/signal/editSignal`, formData, {observe: 'response'});
    }

    getListDataType(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/dataType/getListDataType`, {observe: 'response'});
    }

    getListSignalByDataType(dataType: string, signalId: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/getListSignalByType?dataType=${dataType}&signalId=${signalId}&projectId=${this.authStore.getProjectId()}`);
    }

    getThresholdById(thresholdId: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/threshold/getThresholdById/${thresholdId}`);
    }

    updatedRelatedSignalsForThreshold(formValues): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/threshold/related-signals?projectId=${this.authStore.getProjectId()}`, formValues, {observe: 'response'});
    }

    getAllSignalFault(page: any, pageSize: any): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/signal/getAllSignalFault?page=${page - 1}&size=${pageSize}&projectId=${this.authStore.getProjectId()}`);
    }

    getSignalFaultBySignalId(signalId): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/signal/getSignalFaultBySignalId?faultId=${signalId}&projectId=${this.authStore.getProjectId()}`, {observe: 'response'});
    }

    add(formData: FormData): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/signal`, formData, {observe: 'response'});
    }

    modifyHealthy(signalName: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/healthyInfo?projectId=${this.authStore.getProjectId()}&signalName=${signalName}`, {observe: 'response'});
    }

    getHealthyOfProject(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/api/healthyInfo/getHealthyOfProject?projectId=${this.authStore.getProjectId()}`, {observe: 'response'});
    }

    sendMessageTrigger(signalId: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/api/signalData/sendMessageTrigger?message=${signalId}`, {observe: 'response'});
    }

    downloadDocument(data: any) {
        const url = `${environment.apiUrl}/api/signal/downloadDocument?signalName=${data.signalName}&projectId=${this.authStore.getProjectId()}&docId=${data.docId}`;
        const docName = data.docName;
        const docType = data.docType;
        return this.commonUtil.exportFileGetMethod(url, docType, docName)
            .catch(error => {
                if (error.status === 404) {
                    this._matSnackBar.open(`No data was found!!!`, 'NOT FOUND', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            });
    }

    // End signal setting service//

    // Diagnose setting service
    createDiagnoseInstance(formData: FormData): Observable<any> {
        return this._httpClient
            .post(`${environment.apiUrl}/api/diagnose-instance/createDiagnoseInstance?projectId=${this.authStore.getProjectId()}`, formData, {observe: 'response'});
    }

    deleteDiagnoseInstanceById(id): Observable<any> {
        return this._httpClient
            .delete(`${environment.apiUrl}/api/diagnose-instance/deleteDiagnoseInstanceById?id=${id}`, {observe: 'response'});
    }

    // End signal setting service//

    createDiagnoseStep(formData: FormData): Observable<any> {
        return this._httpClient
            .post(`${environment.apiUrl}/api/diagnose-step/createDiagnoseStep`, formData, {observe: 'response'});
    }

    getDiagnoseInstanceById(id): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/diagnose-instance/getDiagnoseInstanceById?id=${id}`, {observe: 'response'});
    }

    getDiagnoseStepByDiagnoseInstanceId(diagnoseId): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/diagnose-step/getDiagnoseStepByDiagnoseInstanceId?diagnoseId=${diagnoseId}`, {observe: 'response'});
    }

    deleteDiagnoseStepById(id): Observable<any> {
        return this._httpClient
            .delete(`${environment.apiUrl}/api/diagnose-step/deleteDiagnoseStepById?id=${id}`, {observe: 'response'});
    }

    // Dashboard setting service
    editDashboardSlide(dashboardId, delayTime): Observable<any> {
        return this._httpClient
            .post(`${environment.apiUrl}/api/dashboard/editDashboardSlide?dashboardId=${dashboardId}&delayTime=${delayTime}`, {observe: 'response'});
    }

    getDashboardDataById(dashboardId: number): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/dashboard/${dashboardId}`);
    }

    getDashboardTemplateInfo(dayMinus: number): Observable<any> {
        return this._httpClient
        .get(`${environment.apiUrl}/api/signalError/latestErrorMinusDay?dayMinus=${dayMinus}&projectId=${this.authStore.getProjectId()}`);
    }

    // End diagnose setting service

    addDashboardData(dashboard: DashboardModel): Observable<any> {
        return this._httpClient
            .post(`${environment.apiUrl}/api/dashboard?projectId=${this.authStore.getProjectId()}`, dashboard, {observe: 'response'});
    }

    getDashboardCatalogData(): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/signal/getAllCatalogByProjectId?projectId=${this.authStore.getProjectId()}`);
    }

    getCatalogByNames(names): Observable<any> {
        return this._httpClient
            .get(`${environment.apiUrl}/api/signal/getCatalogByNames?names=${names}&projectId=${this.authStore.getProjectId()}`);
    }

    editDashboard(dashboard: DashboardModel): Observable<any> {
        return this._httpClient
            .put(`${environment.apiUrl}/api/dashboard`, dashboard, {observe: 'response'});
    }

    deleteDashboardById(dashboardId, projectId): Observable<any> {
        return this._httpClient
            .delete(`${environment.apiUrl}/api/dashboard?projectId=${projectId}&dashboardId=${dashboardId}`, {observe: 'response'});
    }

    protected convertDateFromClient(project: IProject): IProject {
        const copy: IProject = Object.assign({}, project, {
            time:
                project.time != null && project.time.isValid()
                    ? project.time.toJSON()
                    : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.time = res.body.time != null ? moment(res.body.time) : null;
        }
        return res;
    }

    // End dashboard setting service
}
