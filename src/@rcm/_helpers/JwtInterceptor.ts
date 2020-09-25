import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthStore } from '../_authentication/auth.store';
import 'rxjs/add/operator/do';
import { NavigationStart, Router } from '@angular/router';
import { HttpCancelService } from 'app/main/apps/services/http-cancel.service';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class JwtInterceptor implements HttpInterceptor {

    constructor(private authStore: AuthStore,
        private router: Router,
        private httpCancelService: HttpCancelService) {
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                // Cancel pending calls after navigation
                this.httpCancelService.cancelPendingRequests();
            }
        });
    }

    count: number = 0;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //exclude a http service that gets i18n file (ngx-translate)
        if (!req.url.includes('/assets/i18n/')) {
            if (this.authStore.getAuthToken()) {
                req = req.clone({
                    setHeaders: {
                        Authorization: this.authStore.getAuthToken()
                    }
                });
            }
            
            //exclude api from showing spinner
            if (!req.url.includes('/api/signalData/getDataByName') && !req.url.includes('/api/signalError/latestErrorMinusDay')) {
                this.showSpinner();
                this.count++;
            }

            return next.handle(req).pipe(takeUntil(this.httpCancelService.onCancelPendingRequests())).do((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    return next.handle(req);
                }
            }, (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (this.count > 0) {
                        this.count--;
                    }
                    this.hideSpinner();
                    if (err.status === 401) {
                        this.authStore.clearStorage();
                        this.router.navigate(['/pages/auth/login']);
                    } else if (err.status === 403) {
                        this.router.navigate(['/apps/home']);
                    }
                }
            }, () => {
                if (this.count > 0) {
                    this.count--;
                }
                if (this.count == 0) {
                    this.hideSpinner();
                }
            });
        } else if(!req.url.includes('/assets/i18n/null.json')){
            return next.handle(req);
        }
    }

    showSpinner() {
        const element: HTMLElement = <HTMLElement>document.querySelector('.loading-spinner');
        if (element) {
            element.hidden = false;
        }
    }

    hideSpinner() {
        const element: HTMLElement = <HTMLElement>document.querySelector(".loading-spinner");
        if (element) {
            element.hidden = true;
        }
    }
}
