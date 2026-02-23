import { Component, inject, OnInit, signal, computed, resource } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms'; 
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {firstValueFrom} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

import { PackageService } from '../../../../core/services/package.service';
import { Package } from '../../../../core/models/package';

@Component({
  selector: 'app-admin-ticketing',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatProgressBarModule, CurrencyPipe, DatePipe, 
    MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule,
    TranslateModule
  ],
  templateUrl: './ticketing-admin.html',
  styleUrls: ['./ticketing-admin.css']
})
export class AdminTicketingComponent {
  private packageService = inject(PackageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  packagesResource = resource({
    loader: () => firstValueFrom(this.packageService.getPackages())
  });

  packages = computed(() => this.packagesResource.value() ?? []);
  isLoading = computed(() => this.packagesResource.isLoading());

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

  openForm(pkg?: Package) {
    if (pkg && pkg.id) {
      this.router.navigate(['packages', pkg.id, 'edit'])
    } else {
      this.router.navigate(['packages/new']);
    }
  }

  deletePackage(pkg: Package) {
    const confirmMessage = this.translate.instant('TICKETING_ADMIN.DELETE_CONFIRM', { title: pkg.title });
    
    if(confirm(confirmMessage)) {
      this.packageService.deletePackage(pkg.id!).subscribe({
        next: () => this.packagesResource.reload(),
        error: (err) => {
          const msg = err.message || this.translate.instant('TICKETING_ADMIN.DELETE_ERROR');
          alert(msg);
        }
      });
    }
  }
}