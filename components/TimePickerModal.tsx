'use client';

import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate: Date;
  postCaption?: string;
}

export function TimePickerModal({ isOpen, onClose, onConfirm, initialDate, postCaption }: TimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [hour, setHour] = useState(initialDate.getHours());
  const [minute, setMinute] = useState(initialDate.getMinutes());

  useEffect(() => {
    setSelectedDate(initialDate);
    setHour(initialDate.getHours());
    setMinute(initialDate.getMinutes());
  }, [initialDate]);

  // よく使う時間帯
  const quickTimes = [
    { label: '朝9時', hour: 9, minute: 0 },
    { label: '昼12時', hour: 12, minute: 0 },
    { label: '夕方18時', hour: 18, minute: 0 },
    { label: '夜21時', hour: 21, minute: 0 },
  ];

  const handleQuickTime = (h: number, m: number) => {
    setHour(h);
    setMinute(m);
  };

  const handleConfirm = () => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour, minute, 0, 0);
    onConfirm(newDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">投稿時刻を設定</h2>
          </div>
          <p className="text-sm text-gray-600">
            {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          {postCaption && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              {postCaption}
            </p>
          )}
        </div>

        {/* Quick Time Buttons */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            クイック選択
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickTimes.map((qt) => (
              <button
                key={qt.label}
                onClick={() => handleQuickTime(qt.hour, qt.minute)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  hour === qt.hour && minute === qt.minute
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Picker */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            時刻を指定
          </label>
          <div className="flex items-center gap-3">
            {/* Hour */}
            <div className="flex-1">
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg font-semibold"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 text-center mt-1">時</p>
            </div>

            <span className="text-2xl font-bold text-gray-400">:</span>

            {/* Minute */}
            <div className="flex-1">
              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg font-semibold"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 text-center mt-1">分</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">投稿予定時刻</p>
          <p className="text-lg font-bold text-gray-900">
            {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' '}
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            この時刻に設定
          </button>
        </div>
      </div>
    </div>
  );
}
