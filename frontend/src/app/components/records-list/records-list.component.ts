import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecordsService } from '../../services/records.service';
import { AuthService } from '../../services/auth.service';
import { Record } from '../../models/record.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-records-list',
  templateUrl: './records-list.component.html',
  styleUrls: ['./records-list.component.css']
})
export class RecordsListComponent implements OnInit {
  records: Record[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    public authService: AuthService,
    private recordsService: RecordsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.recordsService.getRecords().subscribe({
      next: (data: Record[]) => {
        this.records = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load records.';
        this.loading = false;
        console.error('Error loading records:', error);
      }
    });
  }

  viewRecord(id: number): void {
    this.router.navigate(['/records', id]);
  }

  editRecord(id: number): void {
    if (this.authService.canUpdate()) {
      this.router.navigate(['/records-edit', id]);
    }
  }

  deleteRecord(id: number): void {
    if (!this.authService.canDelete()) {
      alert('You do not have permission to delete records.');
      return;
    }

    if (confirm('Are you sure you want to delete this record?')) {
      this.recordsService.deleteRecord(id).subscribe({
        next: () => {
          this.loadRecords();
        },
        error: (error: any) => {
          alert('Failed to delete record.');
          console.error('Error deleting record:', error);
        }
      });
    }
  }

  getGenreColor(genre: string): string {
    const colors: { [key: string]: string } = {
      'Rock': '#e74c3c',
      'Pop': '#3498db',
      'Jazz': '#f39c12',
      'Hip-Hop': '#9b59b6',
      'Classical': '#1abc9c',
      'Electronic': '#e67e22',
      'Alternative': '#34495e',
      'Reggae': '#16a085'
    };
    return colors[genre] || '#95a5a6';
  }

  exportToExcel(): void {
    const data = this.records.map(record => ({
      'ID': record.id,
      'Title': record.title,
      'Artist': record.artist,
      'Format': record.format,
      'Genre': record.genre,
      'Release Year': record.releaseYear,
      'Price': record.price,
      'Stock': record.stockQty,
      'Customer ID': record.customerId || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Apply color coding by genre
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = 1; row <= range.e.r; row++) {
      const genreCell = ws[XLSX.utils.encode_cell({ r: row, c: 4 })];
      if (genreCell && genreCell.v) {
        const color = this.getGenreColor(genreCell.v.toString()).replace('#', '');
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = {
            fill: { fgColor: { rgb: color } }
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'records-export.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Records List', 14, 20);
    
    const tableData = this.records.map(record => [
      record.id.toString(),
      record.title,
      record.artist,
      record.format,
      record.genre,
      record.releaseYear.toString(),
      `$${record.price.toFixed(2)}`,
      record.stockQty.toString()
    ]);

    autoTable(doc, {
      head: [['ID', 'Title', 'Artist', 'Format', 'Genre', 'Year', 'Price', 'Stock']],
      body: tableData,
      startY: 30,
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const genre = this.records[data.row.index].genre;
          const color = this.getGenreColor(genre);
          const rgb = this.hexToRgb(color);
          data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
        }
      }
    });

    doc.save('records-export.pdf');
  }

  hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}
