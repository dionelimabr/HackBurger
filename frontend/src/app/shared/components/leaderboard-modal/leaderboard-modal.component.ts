import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScoreService, LeaderboardEntry } from '../../../core/services/score.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-leaderboard-modal',
  templateUrl: './leaderboard-modal.component.html',
  styleUrls: ['./leaderboard-modal.component.scss'],
})
export class LeaderboardModalComponent implements OnInit, OnDestroy {
  open = false;
  loading = false;
  entries: LeaderboardEntry[] = [];
  error = '';

  myStats: { points: number; challengesCompleted: number; totalChallenges: number } | null = null;

  private subs = new Subscription();

  constructor(private scoreService: ScoreService) {}

  ngOnInit(): void {
    this.subs.add(this.scoreService.open$.subscribe(() => this.openModal()));
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  openModal(): void {
    this.open = true;
    this.load();
    // CTF: Score Board challenge — you found the hidden leaderboard.
    this.scoreService.tryComplete('scoreBoardChallenge');
  }

  close(): void { this.open = false; }

  trackById(_i: number, e: LeaderboardEntry) { return e.user_id; }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.scoreService.leaderboard().subscribe({
      next: (res) => {
        this.entries = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar o ranking.';
        this.loading = false;
      },
    });

    this.scoreService.me().subscribe({
      next: (res: any) => {
        this.myStats = res?.data
          ? {
              points: res.data.points,
              challengesCompleted: res.data.challengesCompleted,
              totalChallenges: res.data.totalChallenges,
            }
          : null;
      },
      error: () => { this.myStats = null; },
    });
  }

  avatarSrc(e: LeaderboardEntry): string {
    if (!e.avatar_url) return '';
    if (e.avatar_url.startsWith('http')) return e.avatar_url;
    const base = environment.apiUrl.replace(/\/api$/, '');
    return `${base}${e.avatar_url}`;
  }

  initial(name: string): string { return (name || '?').charAt(0).toUpperCase(); }

  podium(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  }
}
