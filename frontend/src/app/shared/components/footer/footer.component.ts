import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="columns">
          <div>
            <h3>HackBurger</h3>
            <p>Hambúrgueres artesanais entregues rápido, do jeito que você pediu.</p>
          </div>
          <div>
            <h4>Atendimento</h4>
            <p>Seg a Dom · 18h às 23h</p>
            <p>contato&#64;hackburger.com</p>
          </div>
          <div>
            <h4>Links</h4>
            <p><a routerLink="/catalog">Cardápio</a></p>
            <p><a routerLink="/profile">Minha conta</a></p>
          </div>
        </div>
        <div class="bottom">
          <span>© {{ year }} HackBurger. Todos os direitos reservados.</span>
          <div class="bottom-links">
            <a routerLink="/docs" class="foot-link" title="Documentação técnica">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span>Documentação</span>
            </a>
            <a routerLink="/dev" class="foot-link dev-link" title="Sobre o desenvolvedor">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <span>Desenvolvedor</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    @import '../../../../styles/variables';

    .footer {
      background-color: $bg-dark;
      color: $text-light;
      padding: 3rem 5% 1.5rem;
      border-top: 1px solid rgba(255,255,255,.06);

      .footer-content {
        max-width: 1200px;
        margin: 0 auto;

        .columns {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;

          @media (max-width: $bp-tablet) { grid-template-columns: 1fr; }

          h3 { color: $secondary-color; font-size: 1.2rem; margin-bottom: .75rem; }
          h4 { font-size: .95rem; margin-bottom: .5rem; color: $text-light; }
          p  { margin: .25rem 0; color: rgba($text-light, .65); font-size: .9rem; }
          a  { color: rgba($text-light,.75); text-decoration: none; &:hover { color: $secondary-color; } }
        }

        .bottom {
          border-top: 1px solid rgba(255,255,255,.06);
          padding-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: rgba($text-light,.5);
          font-size: .8rem;

          @media (max-width: 600px) {
            flex-direction: column;
            text-align: center;
          }

          .bottom-links { display: inline-flex; gap: .5rem; flex-wrap: wrap; }

          .foot-link {
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            padding: .4rem .75rem;
            border: 1px solid rgba($text-light,.15);
            border-radius: 6px;
            color: rgba($text-light,.85);
            font-weight: 600;
            font-size: .8rem;
            text-decoration: none;
            transition: background .15s, border-color .15s, color .15s, box-shadow .2s;

            &:hover {
              background: rgba($secondary-color, .12);
              border-color: $secondary-color;
              color: $secondary-color;
            }

            &.dev-link {
              background: linear-gradient(135deg, rgba(34,211,238,.1), rgba(139,92,246,.1));
              border-color: rgba(139,92,246,.35);
              color: #c4b5fd;

              &:hover {
                background: linear-gradient(135deg, rgba(34,211,238,.2), rgba(139,92,246,.2));
                border-color: #22d3ee;
                color: #22d3ee;
                box-shadow: 0 0 16px rgba(34,211,238,.25);
              }
            }
          }
        }
      }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
