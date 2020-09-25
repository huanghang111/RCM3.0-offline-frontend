import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationProfileService} from './authentication-profile.services';
import {AuthStore} from './auth.store';
import {REXROTH} from '../_helpers/constant/role';

@Injectable({
    providedIn: 'root'
})
export class RoleRexrothGuard implements CanActivate {

    constructor(private router: Router,
                private authStore: AuthStore,
                private authService: AuthenticationProfileService) {
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        const currentRole: string = this.authStore.getRoles();
        if (currentRole === REXROTH) {
            return true;
        }

        this.router.navigate(['/apps/home']);
        return false;
    }
}
