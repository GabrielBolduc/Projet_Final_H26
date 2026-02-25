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
  units = signal<any[]>([]);
  searchQuery = signal('');
  sortOption = signal('all');

  filteredUnits = computed(() => {
    let list = [...this.units()].filter(u => 
      u.type.toLowerCase().includes(this.searchQuery().toLowerCase())
    );

    if (this.sortOption() === 'qty_asc') list.sort((a, b) => a.quantity - b.quantity);
    if (this.sortOption() === 'qty_desc') list.sort((a, b) => b.quantity - a.quantity);
    
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

  openForm(unit?: any) {
    if (unit) {
      this.router.navigate(['/units', unit.id], { queryParams: { edit: 'true' } });
    } else {
      this.router.navigate(['/units/new', this.accommodationId()]);
    }
  }

  deleteUnit(unit: any) {
    if (confirm('Are you sure you want to delete this unit?')) {
      this.service.deleteUnit(unit.id).subscribe((res) => {
        this.units.update(prevUnits => prevUnits.filter(u => u.id !== unit.id));
      });
    }
  }


  formatType(type: string): string {
    return type.split('::').pop() || type;
  }
}
