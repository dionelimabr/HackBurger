import { Component } from '@angular/core';
import { ScoreService } from '../../../core/services/score.service';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="columns">
          <div>
            <h3>HackBurger</h3>
            <p>{{ 'footer.tagline' | t }}</p>
          </div>
          <div>
            <h4>{{ 'footer.support' | t }}</h4>
            <p>{{ 'footer.hours' | t }}</p>
            <p>contato&#64;hackburger.com</p>
          </div>
          <div>
            <h4>{{ 'footer.links' | t }}</h4>
            <p><a routerLink="/catalog">{{ 'footer.menu' | t }}</a></p>
            <p><a routerLink="/profile">{{ 'footer.account' | t }}</a></p>
          </div>
        </div>
        <div class="bottom">
          <span>© {{ year }} HackBurger. {{ 'footer.rights' | t }}</span>
          <div class="bottom-links">
            <a routerLink="/score-board" class="foot-link rank-link" title="Score Board CTF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              <span>Score Board</span>
              <kbd class="kbd-hint">⌘+M</kbd>
            </a>
            <a routerLink="/docs" class="foot-link" title="Documentação técnica">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span>{{ 'footer.docs' | t }}</span>
            </a>
            <a routerLink="/dev" class="foot-link" title="Sobre o desenvolvedor">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <span>{{ 'footer.developer' | t }}</span>
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
            background: transparent;
            color: rgba($text-light,.85);
            font-family: inherit;
            font-weight: 600;
            font-size: .8rem;
            text-decoration: none;
            cursor: pointer;
            transition: background .15s, border-color .15s, color .15s, box-shadow .2s;

            &:hover {
              background: rgba($secondary-color, .12);
              border-color: $secondary-color;
              color: $secondary-color;
            }

            .kbd-hint {
              margin-left: .15rem;
              padding: .08rem .35rem;
              font-family: 'JetBrains Mono', 'Fira Code', monospace;
              font-size: .65rem;
              font-weight: 500;
              background: rgba($text-light,.08);
              border: 1px solid rgba($text-light,.12);
              border-radius: 4px;
              color: rgba($text-light,.65);
            }
          }
        }
      }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
  constructor(private scoreService: ScoreService) {}
  openRanking(): void { this.scoreService.openLeaderboard(); }
}
