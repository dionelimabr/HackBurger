import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CurrencyBrlPipe } from './pipes/currency-brl.pipe';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification.component';
import { SearchPaletteComponent } from './components/search-palette/search-palette.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CurrencyBrlPipe,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    ToastNotificationComponent,
    SearchPaletteComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    CurrencyBrlPipe,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    ToastNotificationComponent,
    SearchPaletteComponent
  ]
})
export class SharedModule { }
