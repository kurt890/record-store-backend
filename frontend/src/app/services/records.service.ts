import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Record, RecordFormData } from '../models/record.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecordsService {
  constructor(private http: HttpClient) {}

  getRecords(): Observable<Record[]> {
    return this.http.get<Record[]>(`${environment.apiUrl}/records`);
  }

  getRecord(id: number): Observable<Record> {
    return this.http.get<Record>(`${environment.apiUrl}/records/${id}`);
  }

  createRecord(record: RecordFormData): Observable<Record> {
    return this.http.post<Record>(`${environment.apiUrl}/records`, record);
  }

  updateRecord(id: number, record: RecordFormData): Observable<Record> {
    return this.http.put<Record>(`${environment.apiUrl}/records/${id}`, record);
  }

  deleteRecord(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/records/${id}`);
  }

  getFormats(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/formats`);
  }

  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/genres`);
  }
}
