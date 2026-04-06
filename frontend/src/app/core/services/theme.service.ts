import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'ocean' | 'corporate';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme_mode';

  getTheme(): ThemeMode {
    const saved = (localStorage.getItem(this.key) as ThemeMode) || 'corporate';
    this.apply(saved);
    return saved;
  }

  setTheme(mode: ThemeMode) {
    localStorage.setItem(this.key, mode);
    this.apply(mode);
  }

  private apply(mode: ThemeMode) {
    const root = document.documentElement;
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (mode === 'ocean') {
      root.setAttribute('data-theme', 'ocean');
    } else if (mode === 'corporate') {
      root.setAttribute('data-theme', 'corporate');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}
