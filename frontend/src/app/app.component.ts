import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { ToastService } from './core/services/toast.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Agenda Pro';
  isLanding = false;
  constructor(public toastService: ToastService, public router: Router, public auth: AuthService) {
    // Determine initial route without waiting for router events
    const initialPath = (typeof window !== 'undefined') ? window.location.pathname : this.router.url;
    this.isLanding = initialPath.startsWith('/landing') || initialPath.startsWith('/login');
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const p = e.urlAfterRedirects || '';
        this.isLanding = p.startsWith('/landing') || p.startsWith('/login');
      }
    });
  }
}
