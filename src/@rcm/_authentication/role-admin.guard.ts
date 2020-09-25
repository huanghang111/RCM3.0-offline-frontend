import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthStore} from './auth.store';
import {ADMIN, REXROTH} from '../_helpers/constant/role';

@Injectable({
    providedIn: 'root'
})
export class RoleAdminGuard implements CanActivate {

    constructor(private router: Router,
                private authStore: AuthStore) {
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        const currentRole: string = this.authStore.getRoles();
        if (currentRole === REXROTH || currentRole === ADMIN) {
            return true;
        }

        this.router.navigate(['/apps/home']);
        return false;
    }
}
