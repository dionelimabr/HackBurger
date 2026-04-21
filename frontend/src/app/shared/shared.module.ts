import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CurrencyBrlPipe } from './pipes/currency-brl.pipe';

@NgModule({
  declarations: [
    CurrencyBrlPipe
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
