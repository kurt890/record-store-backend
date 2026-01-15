import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../../services/records.service';
import { AuthService } from '../../services/auth.service';
import { Record } from '../../models/record.model';

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.css']
})
export class RecordFormComponent implements OnInit {
  recordForm: FormGroup;
  isEditMode: boolean = false;
  recordId: number | null = null;
  loading: boolean = false;
  errorMessage: string = '';
  formats: string[] = [];
  genres: string[] = [];

  constructor(
    private fb: FormBuilder,
    private recordsService: RecordsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.recordForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      format: ['', Validators.required],
      genre: ['', Validators.required],
      releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQty: ['', [Validators.required, Validators.min(0)]],
      customerId: ['', [Validators.pattern(/^[0-9]+[A-Za-z]$/)]],
      customerFirstName: [''],
      customerLastName: [''],
      customerContact: ['', [Validators.pattern(/^[0-9]{8,}$/)]],
      customerEmail: ['', Validators.email]
    });
  }

  ngOnInit(): void {
    // Load formats and genres
    this.recordsService.getFormats().subscribe({
      next: (data: string[]) => {
        this.formats = data;
      },
      error: (error: any) => {
        console.error('Error loading formats:', error);
      }
    });

    this.recordsService.getGenres().subscribe({
      next: (data: string[]) => {
        this.genres = data;
      },
      error: (error: any) => {
        console.error('Error loading genres:', error);
      }
    });

    // Check if we're in edit mode
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.recordId = +id;
      this.loadRecord(this.recordId);
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.recordsService.getRecord(id).subscribe({
      next: (data: Record) => {
        this.recordForm.patchValue(data);
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load record.';
        this.loading = false;
        console.error('Error loading record:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    // Check permissions
    if (!this.isEditMode && !this.authService.canAdd()) {
      this.errorMessage = 'You do not have permission to add records.';
      return;
    }

    if (this.isEditMode && !this.authService.canUpdate()) {
      this.errorMessage = 'You do not have permission to update records.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.recordForm.value;

    if (this.isEditMode && this.recordId) {
      this.recordsService.updateRecord(this.recordId, formData).subscribe({
        next: () => {
          this.router.navigate(['/records', this.recordId]);
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to update record.';
          this.loading = false;
          console.error('Error updating record:', error);
        }
      });
    } else {
      this.recordsService.createRecord(formData).subscribe({
        next: (record: Record) => {
          this.router.navigate(['/records', record.id]);
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to create record.';
          this.loading = false;
          console.error('Error creating record:', error);
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.recordId) {
      this.router.navigate(['/records', this.recordId]);
    } else {
      this.router.navigate(['/records']);
    }
  }
}
