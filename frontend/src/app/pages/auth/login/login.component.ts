import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage = '';
  showPassword = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/catalog']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Credenciais inválidas';
        this.loading = false;
      }
    });
  }
}
