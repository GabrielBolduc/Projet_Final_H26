import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UnitsService } from '@core/services/units.service';
import { Unit } from '@core/models/unit';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressBarModule, TranslateModule
  ],
  templateUrl: './units.html',
  styleUrl: './units.css',
})
export class Units implements OnInit {
  private service = inject(UnitsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  accommodationId = signal<number | null>(null);
  units = signal<Unit[]>([]);
  searchQuery = signal('');
  sortOption = signal('all');

  filteredUnits = computed(() => {
    let list = [...this.units()].filter(u => 
      u.type.toLowerCase().includes(this.searchQuery().trim().toLowerCase())
    );

    if (this.sortOption() === 'qty_asc') {
      list.sort((a, b) => a.quantity - b.quantity);
    } else if (this.sortOption() === 'qty_desc') {
      list.sort((a, b) => b.quantity - a.quantity);
    }
    
    return list;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.accommodationId.set(+id);
      this.loadUnits(+id);
    }
  }

  loadUnits(id: number) {
    this.service.getUnitsByAccommodation(id).subscribe(res => {
      if (res.status === 'success') this.units.set(res.data);
    });
  }

  openForm(unit?: Unit) {
    if (unit) {
      this.router.navigate(['/units', unit.id], { queryParams: { edit: 'true' } });
    } else {
      this.router.navigate(['/units/new', this.accommodationId()]);
    }
  }

  deleteUnit(unit: Unit): void {
    if (!unit.id) {
      return;
    }

    if (confirm('Are you sure you want to delete this unit?')) {
      this.service.deleteUnit(unit.id).subscribe(() => {
        this.units.set(this.units().filter(u => u.id !== unit.id));
      });
    }
  }

  formatType(rawType: string): string {
    const shortType = rawType.split('::').pop() ?? rawType;
    return shortType.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
