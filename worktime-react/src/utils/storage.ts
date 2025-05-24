import type { WorkTimeSettings, CheckRecord } from '../types/config';

// 業務時間設定の保存・読み込み
export const workTimeStorage = {
  save: (settings: WorkTimeSettings): void => {
    localStorage.setItem('workTimeSettings', JSON.stringify(settings));
  },
  
  load: (): WorkTimeSettings | null => {
    const stored = localStorage.getItem('workTimeSettings');
    return stored ? JSON.parse(stored) : null;
  }
};

// 打刻記録の保存・読み込み
export const attendanceStorage = {
  save: (records: CheckRecord[]): void => {
    const today = new Date().toDateString();
    localStorage.setItem(`attendance_${today}`, JSON.stringify(records));
  },
  
  load: (date?: Date): CheckRecord[] => {
    const targetDate = date ? date.toDateString() : new Date().toDateString();
    const stored = localStorage.getItem(`attendance_${targetDate}`);
    return stored ? JSON.parse(stored) : [];
  },
  
  clear: (date?: Date): void => {
    const targetDate = date ? date.toDateString() : new Date().toDateString();
    localStorage.removeItem(`attendance_${targetDate}`);
  }
}; 