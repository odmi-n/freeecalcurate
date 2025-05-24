export interface Config {
  TASK_TYPES: string[];
  DEFAULT_HOURLY_RATES: Record<string, number>;
  DISABLED_HOURLY_RATE_TASKS: string[];
}

export interface Task {
  type: string;
  minutes: number;
  rate: number;
}

export interface WorkTimeSettings {
  tasks: Task[];
  workDaysPerMonth: number;
}

export interface CheckRecord {
  type: 'check-in' | 'check-out' | 'checkpoint';
  time: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export const CONFIG: Config = {
  TASK_TYPES: [
    '授業',
    'サポート',
    '授業前後の業務',
    '開発：ワオラボサイト',
    '開発：ワオラボスプレッセンス',
    '開発：ワオラボ以外',
    '私用外出・私用休憩',
    'その他業務'
  ],
  DEFAULT_HOURLY_RATES: {
    '授業': 2400,
    'サポート': 1200,
    '授業前後の業務': 1200,
    '開発：ワオラボサイト': 1200,
    '開発：ワオラボスプレッセンス': 1200,
    '開発：ワオラボ以外': 1200,
    '私用外出・私用休憩': 0,
    'その他業務': 1200
  },
  DISABLED_HOURLY_RATE_TASKS: [
    '私用外出・私用休憩'
  ]
}; 