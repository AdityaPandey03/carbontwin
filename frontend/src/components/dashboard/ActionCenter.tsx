import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, Bot, Loader2, Zap } from 'lucide-react';
import { api } from '../../services/mockApi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  id: string;
  text: string;
  potentialSavingsKg: number;
  potentialSavingsInr: number;
  category: string;
  status?: string;
  confidence?: number;
  priority?: number;
}

export function ActionCenter() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.suggestions.getDaily().then((data: Suggestion[]) => {
      setSuggestions(data);
      setLoading(false);
    });
  }, []);

  const handleAction = async (id: string, action: 'accept' | 'dismiss') => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    if (action === 'accept') {
      toast.success('Action accepted', { description: 'Your eco-score will update on the next refresh.' });
    }
    await api.suggestions.actionSuggestion(id, action);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            AI Coach Suggestions
          </CardTitle>
          <CardDescription>Pattern-detected actions, ranked by impact</CardDescription>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {suggestions.length} pending
        </Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>All caught up. Great job today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {suggestions.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {s.category}
                        </Badge>
                        {s.priority != null && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                            <Zap className="w-3 h-3" /> {s.priority}
                          </span>
                        )}
                        {s.confidence != null && (
                          <span className="text-[11px] text-muted-foreground">
                            confidence {Math.round(s.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-emerald-400">
                          Save ₹{s.potentialSavingsInr.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.potentialSavingsKg} kg CO₂
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-4">{s.text}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAction(s.id, 'accept')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleAction(s.id, 'dismiss')}
                      >
                        <X className="w-4 h-4 mr-1" /> Dismiss
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
