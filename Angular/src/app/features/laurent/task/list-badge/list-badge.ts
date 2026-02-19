import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Task } from '@core/models/task';

@Component({
  selector: 'app-list-badge',
  imports: [MatCardModule, RouterLink],
  templateUrl: './list-badge.html',
  styleUrl: './list-badge.css',
})
export class ListBadgeComponent {

  task = input.required<Task>();

  detailsClick = output<number>()

  handleClick() {
      this.detailsClick.emit(this.task().id)
  }

}
