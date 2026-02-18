import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms'; 

import { PackageService } from '../../../core/services/package.service';
import { Package } from '../../../core/models/package';
import { PackageFormComponent } from './package-form/package-form.component';

@Component({
  selector: 'app-admin-ticketing',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatProgressBarModule, CurrencyPipe, DatePipe, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule
  ],
  templateUrl: './ticketing.html',
  styleUrls: ['./ticketing.css']
})
export class AdminTicketingComponent implements OnInit {
  private packageService = inject(PackageService);
  private dialog = inject(MatDialog);

  packages = signal<Package[]>([]);
  searchQuery = signal<string>('');
  sortOption = signal<string>('all'); 

  // Filtrage et Tri
  filteredPackages = computed(() => {
    let list = this.packages().filter(p => 
      p.title.toLowerCase().includes(this.searchQuery().toLowerCase())
    );

    if (this.sortOption() === 'qty_asc') {
      list.sort((a, b) => a.quota - b.quota);
    } else if (this.sortOption() === 'qty_desc') {
      list.sort((a, b) => b.quota - a.quota);
    }
    return list;
  });

  ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.packageService.getPackages().subscribe({
      next: (data) => this.packages.set(data),
      error: (err) => console.error('Erreur chargement packages:', err)
    });
  }

  openForm(pkg?: Package) {
    const dialogRef = this.dialog.open(PackageFormComponent, {
      data: pkg,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { file, ...packageData } = result;
        
        if (pkg?.id) {
          // UPDATE
          this.packageService.updatePackage(pkg.id, packageData, file).subscribe({
            next: () => {
              this.loadPackages();
            },
            error: (err) => alert(err.message || 'Erreur lors de la modification')
          });
        } else {
          // CREATE
          this.packageService.createPackage(packageData, file).subscribe({
            next: () => this.loadPackages(),
            error: (err) => alert(err.message || 'Erreur lors de la création')
          });
        }
      }
    });
  }

  deletePackage(pkg: Package) {
    if(confirm(`Supprimer ${pkg.title} ?`)) {
      this.packageService.deletePackage(pkg.id!).subscribe({
        next: () => this.loadPackages(),
        error: (err) => {
          // renvoie l'objet erreur complet (message + errors)
          const msg = err.message || 'Impossible de supprimer ce forfait.';
          alert(msg);
        }
      });
    }
  }
}