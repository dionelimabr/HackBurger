import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { ProfileComponent } from './pages/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CatalogComponent,
    CartComponent,
    LoginComponent,
    RegisterComponent,
    ProductDetailComponent,
    CheckoutComponent,
    OrderTrackingComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
