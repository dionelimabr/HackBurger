import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product: any;
  @Output() addToCart = new EventEmitter<any>();

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }
}
