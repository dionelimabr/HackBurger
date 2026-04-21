import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  cartItemCount = 0;
  isAuthenticated = false;

  constructor(private authService: AuthService, private cartService: CartService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        this.cartService.getCart().subscribe((res: any) => {
           // mock count of items in array
           this.cartItemCount = res.data?.items?.length || 0;
        });
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
