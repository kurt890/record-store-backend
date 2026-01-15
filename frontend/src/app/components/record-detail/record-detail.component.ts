import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../../services/records.service';
import { AuthService } from '../../services/auth.service';
import { Record } from '../../models/record.model';

@Component({
  selector: 'app-record-detail',
  templateUrl: './record-detail.component.html',
  styleUrls: ['./record-detail.component.css']
})
export class RecordDetailComponent implements OnInit {
  record: Record | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    public authService: AuthService,
    private recordsService: RecordsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadRecord(+id);
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.recordsService.getRecord(id).subscribe({
      next: (data: Record) => {
        this.record = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load record details.';
        this.loading = false;
        console.error('Error loading record:', error);
      }
    });
  }

  editRecord(): void {
    if (this.record && this.authService.canUpdate()) {
      this.router.navigate(['/records-edit', this.record.id]);
    }
  }

  deleteRecord(): void {
    if (!this.record || !this.authService.canDelete()) {
      alert('You do not have permission to delete records.');
      return;
    }

    if (confirm('Are you sure you want to delete this record?')) {
      this.recordsService.deleteRecord(this.record.id).subscribe({
        next: () => {
          this.router.navigate(['/records']);
        },
        error: (error: any) => {
          alert('Failed to delete record.');
          console.error('Error deleting record:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/records']);
  }
}
