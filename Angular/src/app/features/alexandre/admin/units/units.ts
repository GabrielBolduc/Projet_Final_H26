import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UnitsService } from '@core/services/units.service';
import { AccommodationsService } from '@core/services/accommodations.service';
import { Unit } from '@core/models/unit';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule, 
    TranslateModule
  ],
  templateUrl: './units.html',
  styleUrl: './units.css',
})
export class Units implements OnInit {
  private service = inject(UnitsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accService = inject(AccommodationsService);

  accommodationId = signal<number | null>(null);
  parentCategory = signal<number | string | null>(null);
  units = signal<Unit[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numericId = Number(id);
      this.accommodationId.set(numericId);
      this.loadUnits(numericId);
      this.fetchParentCategory(numericId);
    }
  }

  private fetchParentCategory(accId: number) {
    this.accService.getAccommodation(accId).subscribe(acc => {
      this.parentCategory.set(acc.category);
    });
  }

  loadUnits(id: number): void {
    this.service.getUnitsByAccommodation(id).subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.units.set([...res.data]);
        }
      },
      error: (err) => {
        console.error('Error loading units:', err);
      }
    });
  }

  openForm(unit?: Unit): void {
    if (unit && unit.id) {
      this.router.navigate(['/units-form', unit.id], { queryParams: { edit: 'true' } });
    } else {
      this.router.navigate(['/units-form/new', this.accommodationId()]);
    }
  }

  deleteUnit(unit: Unit): void {
    if (unit.id && confirm('Are you sure you want to delete this unit?')) {
      this.service.deleteUnit(unit.id).subscribe({
        next: () => {
          this.units.update(prevUnits => prevUnits.filter(u => u.id !== unit.id));
        },
        error: (err) => {
          console.error('Delete failed:', err);
        }
      });
    }
  }

  formatType(type: string | null | undefined): string {
    if (!type) return 'Unknown';
    return type.split('::').pop() || type;
  }

  formatWaterKey(water: string | null | undefined): string {
    if (!water) return 'NONE';
    const mapping: Record<string, string> = {
      'no_water': 'NONE',
      'undrinkable': 'UNDRINKABLE',
      'drinkable': 'DRINKABLE'
    };
    return mapping[water] || water.toUpperCase();
  }
}
