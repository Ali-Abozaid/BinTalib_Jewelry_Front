import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type AppLanguage = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class UiLanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly languageSignal = signal<AppLanguage>('en');

  readonly language = this.languageSignal.asReadonly();
  readonly isArabic = computed(() => this.languageSignal() === 'ar');

  constructor() {
    effect(() => {
      const lang = this.languageSignal();
      this.document.documentElement.lang = lang;
      this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    });
  }

  toggleLanguage(): void {
    this.languageSignal.update((lang) => (lang === 'en' ? 'ar' : 'en'));
  }
}
