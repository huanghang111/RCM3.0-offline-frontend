import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationProfileService} from './authentication-profile.services';

@Injectable({
    providedIn: 'root'
})

export class AuthenticateGuard implements CanActivate {

    constructor(private router: Router,
                private authService: AuthenticationProfileService) {
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (this.authService.isUserLoggedIn()) {
            return true;
        }

        this.router.navigate(['/pages/auth/login']);
        return false;
    }
}
