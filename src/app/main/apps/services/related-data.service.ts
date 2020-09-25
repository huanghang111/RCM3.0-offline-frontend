import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';

@Injectable({
    providedIn: 'root'
})
export class RelatedDataService {

    constructor(private _httpClient: HttpClient,
                private authStore: AuthStore) {
    }

    getRelatedDataError(signalName: string, timestamp): Observable<any> {
        const url = `${environment.apiUrl}/api/relatedSignal/signalErrorRelated?signalName=${signalName}&timestamp=${timestamp}&projectId=${this.authStore.getProjectId()}`;
        return this._httpClient.get(url);
    }
}
