import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DocsLayoutComponent } from './docs-layout/docs-layout.component';
import { DocsPageComponent } from './docs-page/docs-page.component';

const routes: Routes = [
  {
    path: '',
    component: DocsLayoutComponent,
    children: [
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: ':slug', component: DocsPageComponent },
    ],
  },
];

@NgModule({
  declarations: [DocsLayoutComponent, DocsPageComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class DocsModule {}
