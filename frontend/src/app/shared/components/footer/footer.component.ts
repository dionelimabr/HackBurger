import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>👨‍🍳 "Absolutely delicious! I tried the spicy burger..."</p>
        <div class="stars">★★★★★</div>
        <p class="author">BY ABDUR RAHMAN</p>
      </div>
    </footer>
  `,
  styles: [`
    @import '../../../../styles/variables';
    
    .footer {
      background-color: $bg-dark;
      color: $text-light;
      padding: 4rem 2rem;
      text-align: center;
      background-image: url('/assets/images/branding/footer-bg.jpg'); // placeholder
      background-blend-mode: overlay;
      background-size: cover;

      .footer-content {
        max-width: 600px;
        margin: 0 auto;
        
        p { font-size: 1.2rem; font-style: italic; margin-bottom: 1rem; }
        .stars { color: $secondary-color; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .author { font-size: 0.9rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
      }
    }
  `]
})
export class FooterComponent {}
