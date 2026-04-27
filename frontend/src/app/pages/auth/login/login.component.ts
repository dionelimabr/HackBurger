import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService, Lang } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials = { email: '', password: '' };
  errorMessage = '';
  showPassword = false;
  loading = false;

  typedText = '';
  showCursor = true;
  burgerPops: { id: number; x: number }[] = [];

  lang: Lang = 'pt';

  private typeInterval: any;
  private cursorInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    const text = 'A gente sabe qual é o seu ponto fraco. Faça login e peça o seu favorito.';
    let i = 0;

    this.i18n.lang$.subscribe(l => this.lang = l);
    this.cursorInterval = setInterval(() => { this.showCursor = !this.showCursor; }, 530);

    setTimeout(() => {
      this.typeInterval = setInterval(() => {
        if (i >= text.length) { clearInterval(this.typeInterval); return; }
        const char = text[i++];
        this.typedText += char;
        if (char === ' ' || i === text.length) {
          const id = Date.now() + Math.random();
          const x = 10 + Math.random() * 80;
          this.burgerPops = [...this.burgerPops, { id, x }];
          setTimeout(() => { this.burgerPops = this.burgerPops.filter(b => b.id !== id); }, 1000);
        }
      }, 62);
    }, 700);
  }

  ngOnDestroy() {
    clearInterval(this.typeInterval);
    clearInterval(this.cursorInterval);
  }

  toggleLang() { this.i18n.toggle(); }

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
