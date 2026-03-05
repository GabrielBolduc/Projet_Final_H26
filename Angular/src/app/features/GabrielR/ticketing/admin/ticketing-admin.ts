import { Component, computed, effect, inject, OnInit, resource, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, 
    MatProgressBarModule, CurrencyPipe, DatePipe, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatDialogModule, MatSnackBarModule, FormsModule,
    TranslateModule
  ],
  templateUrl: './ticketing-admin.html',
  styleUrls: ['./ticketing-admin.css']
})
export class AdminTicketingComponent implements OnInit {
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<unknown>;

  private packageService = inject(PackageService);
  private festivalService = inject(FestivalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private initialQueryParams = this.route.snapshot.queryParams;
  private readonly allowedSortOptions: PackageSort[] = [ 'date_asc', 'date_desc', 'price_asc', 'price_desc' ];

  private initialized = false;

  searchQuery = signal(this.initialQueryParams['q'] ?? '');
  sortOption = signal<PackageSort>(this.parseInitialSort(this.initialQueryParams['sort']));
  soldOutOnly = signal(this.initialQueryParams['sold_out'] === 'true');

  ongoingFestivalResource = resource({
    loader: () => firstValueFrom(this.festivalService.getFestivals('ongoing'))
  });

  currentFestivalId = computed<number | undefined>(() => this.ongoingFestivalResource.value()?.[0]?.id);

  activePackagesResource = resource<Package[], PackageFilters | undefined>({
    params: () => {
      if (this.ongoingFestivalResource.isLoading()) {
        return undefined;
      }

      const festivalId = this.currentFestivalId();

      return {
        festivalId,
        status: festivalId ? undefined : 'ongoing',
        q: this.searchQuery(),
        sort: this.sortOption(),
        sold_out: this.soldOutOnly() ? 'true' : undefined
      };
    },
    loader: ({ params }) => {
      if (!params) {
        return Promise.resolve([]);
      }

      return firstValueFrom(this.packageService.getPackages(params));
    }
  });

  archivedPackagesResource = resource<Package[], PackageFilters>({
    params: () => ({
      status: 'completed',
      q: this.searchQuery(),
      sort: this.sortOption(),
      sold_out: this.soldOutOnly() ? 'true' : undefined
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

  constructor() {
    effect(() => {
      if (!this.initialized) return;

      const queryParams = {
        q: this.searchQuery() || null,
        sort: this.sortOption() === 'date_asc' ? null : this.sortOption(),
        sold_out: this.soldOutOnly() ? 'true' : null
      };

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  ngOnInit(): void {
    this.initialized = true;
  }

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
      await this.openTranslatedSnackBar('TICKETING_ADMIN.DELETE_SUCCESS', 3000);
      this.activePackagesResource.reload();
      this.archivedPackagesResource.reload();
    } catch {
      await this.openTranslatedSnackBar('TICKETING_ADMIN.DELETE_ERROR', 5000);
    }
  }

  private async openTranslatedSnackBar(messageKey: string, duration: number): Promise<void> {
    const labels = await firstValueFrom(this.translate.get([messageKey, 'COMMON.CLOSE']));
    const message = labels[messageKey] ?? this.translate.instant(messageKey);
    const closeLabel = labels['COMMON.CLOSE'] ?? this.translate.instant('COMMON.CLOSE');

    this.snackBar.open(
      message,
      closeLabel,
      { duration }
    );
  }

  private parseInitialSort(value: unknown): PackageSort {
    const sort = String(value ?? '').trim();
    if (this.allowedSortOptions.includes(sort as PackageSort)) {
      return sort as PackageSort;
    }

    return 'date_asc';
  }
}
