import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleDisplay(): string {
    if (!this.currentUser) return '';
    
    switch(this.currentUser.role) {
      case 'clerk': return 'Salesperson';
      case 'manager': return 'Store Manager';
      case 'admin': return 'System Admin';
      default: return '';
    }
  }

  getPermissionsDisplay(): string {
    if (!this.currentUser) return '';
    
    switch(this.currentUser.role) {
      case 'clerk': return 'View + Add';
      case 'manager': return 'View + Add + Update';
      case 'admin': return 'Full CRUD';
      default: return '';
    }
  }
}
