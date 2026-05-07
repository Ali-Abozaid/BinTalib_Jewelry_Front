import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, LoginRequest, LoginResponse } from './auth.models';

const TOKEN_KEY = 'bintalib.token';
const USER_KEY = 'bintalib.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/Auth`;

  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<CurrentUser | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly role = computed(() => this.userSignal()?.role ?? null);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap((response) => this.persist(response))
    );
  }

  refreshMe(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.base}/me`).pipe(
      tap((user) => {
        this.userSignal.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  hasRole(role: 'Admin' | 'Branch' | 'Workshop'): boolean {
    return this.user()?.role === role;
  }

  private persist(response: LoginResponse): void {
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  private readToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): CurrentUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }
}
