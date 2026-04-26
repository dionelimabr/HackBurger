import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ScoreBoardComponent } from './score-board.component';

@NgModule({
  declarations: [ScoreBoardComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([{ path: '', component: ScoreBoardComponent }]),
  ],
})
export class ScoreBoardModule {}
