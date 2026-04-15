import { type PlayerState, getRank, type Rank } from '@/lib/game-system';
import { Trophy, Target, Flame, RotateCcw, Coins, Calendar } from 'lucide-react';

const RANK_COLORS: Record<Rank, string> = {
  E: 'text-rank-e', D: 'text-rank-d', C: 'text-rank-c',
  B: 'text-rank-b', A: 'text-rank-a', S: 'text-rank-s',
};

interface ProfileTabProps {
  player: PlayerState;
  onReset: () => void;
  onNameChange: (name: string) => void;
}

export default function ProfileTab({ player, onReset, onNameChange }: ProfileTabProps) {
  const rank = getRank(player.level);

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Hunter Card */}
      <div className="status-window rounded-lg p-5 text-center">
        <div className="w-20 h-20 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center glow-primary">
          <span className={`font-display text-3xl font-black ${RANK_COLORS[rank]}`}>{rank}</span>
        </div>
        <input
          type="text"
          value={player.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-transparent text-center font-display text-xl font-bold focus:outline-none focus:text-primary w-full"
        />
        <p className="text-muted-foreground text-xs mt-1">Rank {rank} Hunter • Level {player.level}</p>
      </div>

      {/* Achievements */}
      <div className="status-window rounded-lg p-5">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, value: player.totalQuestsCompleted, label: 'Quests Done', color: 'text-glow-warning' },
            { icon: Target, value: player.level, label: 'Level', color: 'text-primary' },
            { icon: Flame, value: player.bestStreak, label: 'Best Streak', color: 'text-glow-danger' },
            { icon: Coins, value: player.coins, label: 'Coins', color: 'text-glow-warning' },
            { icon: Calendar, value: player.dailyQuestsCompleted, label: 'Daily Done', color: 'text-glow-success' },
            { icon: RotateCcw, value: player.weeklyQuestsCompleted || 0, label: 'Weekly Done', color: 'text-accent' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center">
                <div className={`w-10 h-10 rounded-lg bg-secondary mx-auto mb-1 flex items-center justify-center ${item.color}`}>
                  <Icon size={18} />
                </div>
                <p className="font-display text-lg font-bold">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
      >
        <RotateCcw size={14} />
        Reset Progress
      </button>
    </div>
  );
}
