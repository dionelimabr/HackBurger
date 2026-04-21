import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap, EMPTY, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeaderboardEntry {
  user_id: number;
  name: string;
  avatar_url: string | null;
  points: number;
  challenges_completed: number;
  rank: number;
}

export interface CompleteResponse {
  alreadyCompleted: boolean;
  earned: number;
  totalPoints: number;
}

export interface ScoreEvent {
  earned: number;
  totalPoints: number;
  challengeKey: string;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private apiUrl = `${environment.apiUrl}/scores`;

  /** Fires whenever a challenge is newly completed; navbar listens for confetti. */
  private readonly scoredSubject = new Subject<ScoreEvent>();
  readonly scored$ = this.scoredSubject.asObservable();

  /** Requests the leaderboard modal to open. */
  private readonly openSubject = new Subject<void>();
  readonly open$ = this.openSubject.asObservable();

  openLeaderboard(): void { this.openSubject.next(); }

  constructor(private http: HttpClient) {}

  leaderboard(): Observable<{ data: LeaderboardEntry[] }> {
    return this.http.get<{ data: LeaderboardEntry[] }>(`${this.apiUrl}/leaderboard`);
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  catalog(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalog`);
  }

  complete(challengeKey: string): Observable<{ data: CompleteResponse }> {
    return this.http.post<{ data: CompleteResponse }>(`${this.apiUrl}/complete`, { challengeKey }).pipe(
      tap((res) => {
        if (res?.data && !res.data.alreadyCompleted && res.data.earned > 0) {
          this.scoredSubject.next({
            earned: res.data.earned,
            totalPoints: res.data.totalPoints,
            challengeKey,
          });
        }
      }),
    );
  }

  /** Fire-and-forget completion for auto-triggered challenges. Swallows 401/404. */
  tryComplete(challengeKey: string): void {
    this.complete(challengeKey).pipe(catchError(() => EMPTY)).subscribe();
  }
}
