import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthStore} from './auth.store';

@Injectable({
    providedIn: 'root'
})
export class ProjectGuard implements CanActivate {
    _authStore: AuthStore;

    constructor(private router: Router,
                private authStore: AuthStore) {
        this._authStore = authStore;
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (!this.authStore.getUsername()) {
            this.router.navigate(['/pages/auth/login']);
            return false;
        }
        if (!this.authStore.getProjectId()) {
            this.router.navigate(['/apps/home']);
            return false;
        }
        return !!(this._authStore.getUsername() && this._authStore.getProjectId());

    }
}
