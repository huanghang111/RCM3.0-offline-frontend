import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {now} from 'moment';
import {AuthStore} from './auth.store';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationProfileService {
    private _isLoginStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private authStore: AuthStore) {
        // this._isLoginStatus.next(this._isUserExisted());
    }

    get isLoggedIn(): Observable<boolean> {
        return this._isLoginStatus.asObservable();
    }

    isUserLoggedIn() {
        if (!(this.authStore.getExpiredTime() === null)) {
            const currentDate = now();
            const tokenDate = this.authStore.getExpiredTime();
            // console.log(tokenDate - currentDate);
            if ((tokenDate - currentDate) <= 0) {
                this.authStore.clearStorage();
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    public setUserProfile(userData: any): void {
        if (userData) {
            // this._localStorage.store('token', userData.tokenGenerated);
            // this._localStorage.store('user', userData);
            this._isLoginStatus.next(true);
        }
    }

    public getUserProfile(): any {
        // return this._localStorage.retrieve('user');
    }

    // public decodeTokenUser(): any {
    //     return this._isTokenExisted() ? jwtDecode(this._localStorage.retrieve('token')) : null;
    // }

    // private _isTokenExisted(): boolean {
    //     return this._localStorage.retrieve('token') ? true : false;
    // }

    // private _isUserExisted(): boolean {
    //     return this.getUserProfile() ? true : false;
    // }

}
