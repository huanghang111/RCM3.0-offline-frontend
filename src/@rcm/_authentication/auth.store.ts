import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthStore {

    constructor() {
    }

    setAuthToken(data: any) {
        window.localStorage.setItem('token', data);
        window.localStorage.setItem('auth_token', `Bearer ${data}`);
    }

    setUsername(data: any) {
        window.localStorage.setItem('username', data);
    }

    setExpiredTime(data: any) {
        window.localStorage.setItem('expired_time', data);
    }

    setRole(data: any) {
        window.localStorage.setItem('rcm_role', JSON.stringify(data));
    }

    getAuthToken(): string {
        return window.localStorage.getItem('auth_token');
    }

    getToken(): string {
        return window.localStorage.getItem('token');
    }

    getUsername(): string {
        return window.localStorage.getItem('username');
    }

    getExpiredTime(): number {
        return Number(JSON.parse(window.localStorage.getItem('expired_time')));
    }

    getRoles(): any {
        return JSON.parse(window.localStorage.getItem('rcm_role')) || null;
    }

    isAdmin(): boolean {
        return this.getRoles() === 'ROLE_ADMIN';
    }

    isRexroth(): boolean {
        return this.getRoles() === 'ROLE_REXROTH';
    }

    isUser(): boolean {
        return this.getRoles() === 'ROLE_USER';
    }

    setSelectedProject(projectId: string, projectName: string) {
        window.localStorage.setItem('projectId', projectId);
        window.localStorage.setItem('projectName', projectName);
    }

    getProjectId(): string {
        return window.localStorage.getItem('projectId');
    }

    getProjectName(): string {
        return window.localStorage.getItem('projectName');
    }

    removeSelectedProject() {
        if (this.getProjectId()) {
            window.localStorage.removeItem('projectId');
            window.localStorage.removeItem('projectName');
        }
    }

    clearStorage() {
        let currentLang = this.getLang();//keep the current language
        window.localStorage.clear();
        this.setLang(currentLang);
    }

    // setFullScreen(value: string) {
    //     window.localStorage.setItem('fullScreen', value);
    // }

    // getFullScreen(): boolean {
    //     return window.localStorage.getItem('fullScreen') === 'true';
    // }

    setLang(lang: string) {
        window.localStorage.setItem('lang', lang);
    }

    getLang(): string {
        return window.localStorage.getItem('lang') ? window.localStorage.getItem('lang') : "cn";
    }
}