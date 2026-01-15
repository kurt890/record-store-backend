import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RecordsListComponent } from './components/records-list/records-list.component';
import { RecordDetailComponent } from './components/record-detail/record-detail.component';
import { RecordFormComponent } from './components/record-form/record-form.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'records', 
    component: RecordsListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'records/:id', 
    component: RecordDetailComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'records-add', 
    component: RecordFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['clerk', 'manager', 'admin'] }
  },
  { 
    path: 'records-edit/:id', 
    component: RecordFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['manager', 'admin'] }
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
