import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DeveloperComponent } from './developer.component';

const routes: Routes = [{ path: '', component: DeveloperComponent }];

@NgModule({
  declarations: [DeveloperComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class DeveloperModule {}
