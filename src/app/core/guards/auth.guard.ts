import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import * as moment from 'moment';
import { UserInfo } from '../../models/user-info.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
        private notificationService: NotificationService,
        private authService: AuthenticationService) { }

    canActivate(next?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): true|UrlTree|Observable<UrlTree|boolean> {
        const user : UserInfo = this.authService.getUser();

        if (user && user.expiration) {
            if (moment() < moment(user.expiration)) {
                return true;
            } else {
                this.notificationService.openSnackBar('Your session has expired');
            }
        }

        this.authService.redirectUrl = state.url;

        const queryParams = next.queryParamMap;
        console.log('Initial query params:');
        console.log(queryParams);
        if (queryParams.has('csticket')) {
            console.log("Checking log in details");

            return this.authService.checkLoginDetailsValid(queryParams).pipe(tap((res) => console.log(`valid: ${res}`)),map((valid: boolean) => {
                if (valid) {
                    console.log("Recording user!");
                    this.authService.recordAuthenticatedUser(queryParams);
                    return this.router.parseUrl('dashboard');
                }
                else { return false; }
            }))
        }
        else {
            console.log("No ticket found");
            return this.router.parseUrl('auth/login');
        }
    }
}
