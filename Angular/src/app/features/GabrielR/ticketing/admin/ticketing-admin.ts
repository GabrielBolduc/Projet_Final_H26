import { Component, computed, inject, resource, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms'; 
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { FestivalService } from '../../../../core/services/festival.service';
import { PackageFilters, PackageService, PackageSort } from '../../../../core/services/package.service';
import { Package } from '../../../../core/models/package';

@Component({
  selector: 'app-admin-ticketing',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatProgressBarModule, CurrencyPipe, DatePipe, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, FormsModule,
    TranslateModule
  ],
  templateUrl: './ticketing-admin.html',
  styleUrls: ['./ticketing-admin.css']
})
export class AdminTicketingComponent {
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<unknown>;

  private packageService = inject(PackageService);
  private festivalService = inject(FestivalService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  searchQuery = signal('');
  sortOption = signal<PackageSort>('date_asc');

  ongoingFestivalResource = resource({
    loader: () => firstValueFrom(this.festivalService.getFestivals('ongoing'))
  });

  currentFestivalId = computed<number | undefined>(() => this.ongoingFestivalResource.value()?.[0]?.id);

  activePackagesResource = resource<Package[], PackageFilters>({
    params: () => {
      const festivalId = this.currentFestivalId();

      return {
        festivalId,
        status: festivalId ? undefined : 'ongoing',
        q: this.searchQuery(),
        sort: this.sortOption()
      };
    },
    loader: ({ params }) => firstValueFrom(this.packageService.getPackages(params))
  });

  archivedPackagesResource = resource<Package[], PackageFilters>({
    params: () => ({
      status: 'completed',
      q: this.searchQuery(),
      sort: this.sortOption()
    }),
    loader: ({ params }) => firstValueFrom(this.packageService.getPackages(params))
  });

  activePackages = computed(() => this.activePackagesResource.value() ?? []);
  archivedPackages = computed(() => this.archivedPackagesResource.value() ?? []);
  isLoading = computed(() =>
    this.ongoingFestivalResource.isLoading() ||
    this.activePackagesResource.isLoading() ||
    this.archivedPackagesResource.isLoading()
  );

  openForm(pkg?: Package) {
    if (pkg && pkg.id) {
      this.router.navigate(['packages', pkg.id, 'edit'])
    } else {
      this.router.navigate(['packages/new']);
    }
  }

  async deletePackage(pkg: Package): Promise<void> {
    if (!pkg.id) {
      return;
    }

    const dialogRef = this.dialog.open(this.confirmDialogTemplate, {
      width: '420px',
      data: { title: pkg.title }
    });

    const shouldDelete = await firstValueFrom(dialogRef.afterClosed());
    if (!shouldDelete) {
      return;
    }

    try {
      await firstValueFrom(this.packageService.deletePackage(pkg.id));
      this.activePackagesResource.reload();
    } catch (err: any) {
      const msg = err.message || this.translate.instant('TICKETING_ADMIN.DELETE_ERROR');
      alert(msg);
    }
  }
}
