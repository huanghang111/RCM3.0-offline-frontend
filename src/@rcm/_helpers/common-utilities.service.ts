import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {AuthStore} from '../_authentication/auth.store';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class CommonUtilitiesService {

    constructor(
        private datePipe: DatePipe,
        private _httpClient: HttpClient,
        private authStore: AuthStore,
        private _matSnackBar: MatSnackBar
    ) {
    }

    convertFullISODate(date: any): string {
        return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSzzzz');
    }

    exportFile(link: string, type: string, requestBody: any, fileName: string) {
        return this._httpClient.post(link, requestBody, {responseType: 'arraybuffer'})
            .toPromise()
            .then(response => {
                const blob = new Blob([response], {type: type});
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                } else {
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.setAttribute('style', 'display:none;');
                    anchor.download = fileName;
                    document.body.appendChild(anchor);
                    anchor.href = downloadUrl;
                    anchor.click();
                }
            });
    }

    exportFileGetMethod(link: string, type: string, fileName: string) {
        return this._httpClient.get(link, {responseType: 'arraybuffer'})
            .toPromise()
            .then(response => {
                const blob = new Blob([response], {type: type});
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                } else {
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.setAttribute('style', 'display:none;');
                    anchor.download = fileName;
                    document.body.appendChild(anchor);
                    anchor.href = downloadUrl;
                    anchor.click();
                }
            });
    }

    documentDownload(documentInput: any): Promise<any> {
        const link = documentInput.url;
        const docName = documentInput.name;
        const docType = documentInput.type;
        return this.exportFileGetMethod(link, docType, docName)
            .catch(error => {
                console.log(error);
                if (error.status === 404) {
                    this._matSnackBar.open(`No data was found!!!`, 'NOT FOUND', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            });
    }


}
