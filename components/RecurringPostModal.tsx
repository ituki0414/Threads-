'use client';

import { useState } from 'react';
import { X, Calendar, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // 1 = 毎日/毎週/毎月, 2 = 2日ごと/2週ごと/2ヶ月ごと
  daysOfWeek?: number[]; // 0=日曜, 1=月曜, ..., 6=土曜 (weekly only)
  endDate: Date;
  count: number; // 生成する投稿数
}

interface RecurringPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: RecurringConfig) => void;
  initialDate: Date;
}

export function RecurringPostModal({ isOpen, onClose, onConfirm, initialDate }: RecurringPostModalProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([new Date(initialDate).getDay()]);
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date(initialDate);
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [count, setCount] = useState(4);

  if (!isOpen) return null;

  const handleDayToggle = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleConfirm = () => {
    onConfirm({
      frequency,
      interval,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      endDate,
      count,
    });
    onClose();
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Repeat className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">繰り返し投稿</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* 頻度 */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">繰り返しの頻度</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFrequency('daily')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  frequency === 'daily'
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                毎日
              </button>
              <button
                onClick={() => setFrequency('weekly')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  frequency === 'weekly'
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                毎週
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  frequency === 'monthly'
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                毎月
              </button>
            </div>
          </div>

          {/* 間隔 */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {frequency === 'daily' ? '何日' : frequency === 'weekly' ? '何週' : '何ヶ月'}ごと
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
            />
          </div>

          {/* 曜日選択 (weekly only) */}
          {frequency === 'weekly' && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">曜日を選択</label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayToggle(index)}
                    className={`aspect-square rounded-lg border-2 font-medium transition-all ${
                      daysOfWeek.includes(index)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/50 text-foreground'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 投稿数 */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">作成する投稿数</label>
            <input
              type="number"
              min="1"
              max="30"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">最大30件まで</p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              プレビュー
            </p>
            <p className="text-sm text-blue-700">
              {frequency === 'daily' && `${interval}日ごとに`}
              {frequency === 'weekly' && `${interval}週間ごと、${daysOfWeek.map(d => dayNames[d]).join('・')}曜日に`}
              {frequency === 'monthly' && `${interval}ヶ月ごとに`}
              {count}件の投稿を作成します
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={frequency === 'weekly' && daysOfWeek.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Repeat className="w-4 h-4 mr-2" />
            {count}件の投稿を作成
          </Button>
        </div>
      </Card>
    </div>
  );
}
