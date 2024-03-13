import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import 'rxjs/add/operator/delay';
import * as uuid from 'uuid';

import { environment } from '../../../environments/environment';
import { of, EMPTY, Observable } from 'rxjs';
import { ParamMap, Router, UrlTree } from '@angular/router';
import { UserInfo } from '../../models/user-info.model';
import { QueuePositionService } from './queue-position.service';
import { StreamManagerService } from './stream-manager.service';
import { StaffService } from './staff.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private authUrl = 'http://studentnet.cs.manchester.ac.uk/authenticate/';
    public queuePosService: QueuePositionService;
    public staffService: StaffService;

    constructor(private http: HttpClient,
        @Inject('LOCALSTORAGE') private localStorage: Storage,
        private router: Router) {
    }

    set redirectUrl(url: string) { this.localStorage.setItem('redirectUrl', url); }
    get redirectUrl(): string { return this.localStorage.getItem('redirectUrl'); }

    login(userName: string, fullName: string, category: string): Observable<boolean> {
        return of(true).pipe(map(() => {
            this.saveUserToLocalStorage({
                userName,
                fullName,
                category,
                authenticated: Date.now(),
                expiration: moment().add(1, 'days').toDate()
            });
            return true;
        }));
    }
        
    requestCASlogin() {
        const csTicket: string = uuid.v4();
        this.localStorage.setItem('csTicket', csTicket);

        window.location.href = `${this.authUrl}?url=http://${window.location.host}&csticket=${csTicket}&version=2&command=validate`;
    }

    checkLoginDetailsValid(givenParams: ParamMap): Observable<boolean> {
        if (givenParams.get('csticket') != this.localStorage.getItem('csTicket'))
            return of(false);

        let givenParamMap = {};
        for (let key of givenParams.keys) {
            givenParamMap[key] = givenParams.get(key);
        }

        console.log("Param Map:")
        console.log(givenParamMap);

        return this.http.get('/login-proxy', {
            params: {url: `http://${window.location.host}`, ...givenParamMap, version:'2', command: 'confirm'}, 
            responseType: 'text'})
                .pipe(map((res: string) => res == 'true'));
    }

    recordAuthenticatedUser(givenParams: ParamMap): void{
        this.saveUserToLocalStorage({
            userName: givenParams.get('username'),
            fullName: givenParams.get('fullname'),
            category: givenParams.get('usercategory'),
            authenticated: Date.now(),
            expiration: moment().add(1, 'days').toDate()
        });
        console.log('Finished recording user');
    }

    saveUserToLocalStorage(user: UserInfo): void {
        this.localStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.localStorage.removeItem('currentUser');
        if (this.queuePosService) {
            this.queuePosService.stopQueueListener();
        }
    }

    getUser(): UserInfo {
        return JSON.parse(this.localStorage.getItem('currentUser')); 
    }

    getCurrentUser(): any {
        return JSON.parse(this.localStorage.getItem('currentUser')); 
    }

    passwordResetRequest(email: string) {
        return of(true).delay(1000);
    }

    changePassword(email: string, currentPwd: string, newPwd: string) {
        return of(true).delay(1000);
    }

    passwordReset(email: string, token: string, password: string, confirmPassword: string): any {
        return of(true).delay(1000);
    }

}
