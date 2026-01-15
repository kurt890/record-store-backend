import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RecordsListComponent } from './components/records-list/records-list.component';
import { RecordDetailComponent } from './components/record-detail/record-detail.component';
import { RecordFormComponent } from './components/record-form/record-form.component';

import { AuthService } from './services/auth.service';
import { RecordsService } from './services/records.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { CustomerIdFormatPipe } from './pipes/customer-id-format.pipe';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RecordsListComponent,
    RecordDetailComponent,
    RecordFormComponent,
    CustomerIdFormatPipe,
    CurrencyFormatPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    RecordsService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
