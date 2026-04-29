import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle } from
'../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../../services/mockApi';
export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  useEffect(() => {
    const fetchLeaders = async () => {
      const data = await api.dashboard.getLeaderboard();
      setLeaders(data);
    };
    fetchLeaders();
    // Simulate real-time Socket.io updates
    const interval = setInterval(() => {
      setLeaders((prev) => {
        const newLeaders = [...prev];
        // Randomly bump someone's score slightly
        const idx = Math.floor(Math.random() * newLeaders.length);
        if (newLeaders[idx].score < 100) {
          newLeaders[idx] = {
            ...newLeaders[idx],
            score: newLeaders[idx].score + 1
          };
        }
        return newLeaders.sort((a, b) => b.score - a.score);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Company Leaderboard
        </CardTitle>
        <CardDescription>Top Eco-Scores this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaders.map((user, index) =>
          <div
            key={user.id}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${user.isCurrentUser ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-secondary/50'}`}>
            
              <div className="flex items-center gap-3">
                <div className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {user.name}
                    {user.isCurrentUser &&
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 px-1 py-0">
                    
                        You
                      </Badge>
                  }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    {user.score}
                  </p>
                </div>
                {user.trend === 'up' &&
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              }
                {user.trend === 'down' &&
              <TrendingDown className="w-4 h-4 text-destructive" />
              }
                {user.trend === 'same' &&
              <Minus className="w-4 h-4 text-muted-foreground" />
              }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>);

}