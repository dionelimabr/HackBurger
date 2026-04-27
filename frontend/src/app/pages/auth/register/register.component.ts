import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService, Lang } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showConfirm = false;
  termsAccepted = false;

  typedText = '';
  showCursor = true;
  burgerPops: { id: number; x: number }[] = [];
  lang: Lang = 'pt';

  private typeInterval: any;
  private cursorInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    const text = 'Crie sua conta e descubra o que está escondido no cardápio. O melhor está reservado para você.';
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
      }, 55);
    }, 700);
  }

  ngOnDestroy() {
    clearInterval(this.typeInterval);
    clearInterval(this.cursorInterval);
  }

  toggleLang() { this.i18n.toggle(); }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        this.loading = false;
      }
    });
  }
}
