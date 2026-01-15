import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Redirect to records if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/records']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      this.loading = false;
      return;
    }

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (user: any) => {
          // Get return URL from query params or default to '/records'
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/records';
          this.router.navigate([returnUrl]);
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Invalid email or password.';
          this.loading = false;
        }
      });
  }
}
