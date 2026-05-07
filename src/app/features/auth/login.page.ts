import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  protected readonly form = this.fb.group({
    email: ['admin@bintalib.com', [Validators.required, Validators.email]],
    password: ['Admin@12345', [Validators.required]]
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly demoAccounts = [
    { label: 'Admin', email: 'admin@bintalib.com', password: 'Admin@12345' },
    { label: 'Branch', email: 'branch@bintalib.com', password: 'Branch@12345' },
    { label: 'Workshop', email: 'workshop@bintalib.com', password: 'Workshop@12345' }
  ];

  selectDemo(email: string, password: string): void {
    this.form.patchValue({ email, password });
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    if (!email || !password) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        const target = this.auth.role() === 'Admin' ? '/dashboard' : '/orders';
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Invalid email or password');
      }
    });
  }
}
