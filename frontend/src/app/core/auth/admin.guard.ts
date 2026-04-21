import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        if (user && user.role === 'admin') return true;
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
