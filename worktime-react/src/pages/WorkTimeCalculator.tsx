import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TaskRow from '../components/TaskRow';
import TimeInput from '../components/TimeInput';
import type { Task } from '../types/config';
import { CONFIG } from '../types/config';
import { workTimeStorage } from '../utils/storage';
import { toMinutes, formatMinutes, formatCurrency } from '../utils/timeUtils';

const WorkTimeCalculator: React.FC = () => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [otherTask, setOtherTask] = useState<Task>({
    type: 'その他業務',
    minutes: 0,
    rate: CONFIG.DEFAULT_HOURLY_RATES['その他業務']
  });
  const [workDaysPerMonth] = useState(8);

  // 計算結果の状態
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(0);
  const [unassignedMinutes, setUnassignedMinutes] = useState(0);
  const [totalWage, setTotalWage] = useState(0);

  // 初期化時にローカルストレージから読み込み
  useEffect(() => {
    const saved = workTimeStorage.load();
    if (saved && saved.tasks.length > 0) {
      const regularTasks = saved.tasks.filter(task => task.type !== 'その他業務');
      const otherTaskData = saved.tasks.find(task => task.type === 'その他業務');
      
      setTasks(regularTasks);
      if (otherTaskData) {
        setOtherTask(otherTaskData);
      }
    } else {
      // デフォルトの業務行を追加
      setTasks([
        { type: '授業', minutes: 0, rate: CONFIG.DEFAULT_HOURLY_RATES['授業'] },
        { type: 'サポート', minutes: 0, rate: CONFIG.DEFAULT_HOURLY_RATES['サポート'] }
      ]);
    }
  }, []);

  // 計算処理
  const recalculate = useCallback(() => {
    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    
    if (isNaN(startMinutes) || isNaN(endMinutes)) {
      return;
    }

    // 総勤務時間の計算
    let totalMinutes = endMinutes - startMinutes;
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // 翌日にまたがる場合
    }

    // 各業務の合計時間
    const assignedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
    
    // 未割当時間の計算
    const unassigned = Math.max(0, totalMinutes - assignedMinutes);
    
    // その他業務の時間を更新
    const updatedOtherTask = { ...otherTask, minutes: unassigned };
    setOtherTask(updatedOtherTask);

    // 総給与の計算
    const regularWage = tasks.reduce((sum, task) => {
      return sum + (task.minutes / 60) * task.rate;
    }, 0);
    const otherWage = (unassigned / 60) * updatedOtherTask.rate;
    const total = regularWage + otherWage;

    setTotalWorkMinutes(totalMinutes);
    setUnassignedMinutes(unassigned);
    setTotalWage(total);
  }, [startTime, endTime, tasks, otherTask]);

  // 依存関係が変更されたら再計算
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // 設定を保存
  useEffect(() => {
    const settings = {
      tasks: [...tasks, otherTask],
      workDaysPerMonth
    };
    workTimeStorage.save(settings);
  }, [tasks, otherTask, workDaysPerMonth]);

  // 業務行の追加
  const addTask = () => {
    const newTask: Task = {
      type: '授業',
      minutes: 0,
      rate: CONFIG.DEFAULT_HOURLY_RATES['授業']
    };
    setTasks([...tasks, newTask]);
  };

  // 業務行の更新
  const updateTask = (index: number, updatedTask: Task) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  // 業務行の削除
  const deleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  // その他業務の更新
  const updateOtherTask = (updatedTask: Task) => {
    setOtherTask(updatedTask);
  };

  // 月給計算
  const monthlyWage = totalWage * workDaysPerMonth;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          BeEn分単位計算ツール
        </h1>

        <div className="text-center mb-6">
          <Link 
            to="/attendance" 
            className="text-primary hover:text-blue-700 underline"
          >
            リアルタイム打刻はこちらから
          </Link>
        </div>

        {/* 出勤・退勤時間入力 */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-6">
          <div className="hidden-mobile grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeInput
              label="出勤時間"
              value={startTime}
              onChange={setStartTime}
              hourId="start-hour"
              minuteId="start-minute"
              mobileId="start-time-mobile"
            />
            <TimeInput
              label="退勤時間"
              value={endTime}
              onChange={setEndTime}
              hourId="end-hour"
              minuteId="end-minute"
              mobileId="end-time-mobile"
            />
          </div>

          {/* スマートフォン用のレイアウト */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            <TimeInput
              label="出勤時間"
              value={startTime}
              onChange={setStartTime}
              hourId="start-hour-mobile"
              minuteId="start-minute-mobile"
              mobileId="start-time-mobile"
            />
            <TimeInput
              label="退勤時間"
              value={endTime}
              onChange={setEndTime}
              hourId="end-hour-mobile"
              minuteId="end-minute-mobile"
              mobileId="end-time-mobile"
            />
          </div>
        </div>

        {/* 業務別作業時間と時給 */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            業務別の作業時間と時給
          </h2>
          
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <TaskRow
                key={index}
                task={task}
                onUpdate={(updatedTask) => updateTask(index, updatedTask)}
                onDelete={() => deleteTask(index)}
              />
            ))}
            
            {/* その他業務行 */}
            <TaskRow
              task={otherTask}
              isOtherTask={true}
              onUpdate={updateOtherTask}
            />
          </div>

          <div className="mt-6">
            <button
              onClick={addTask}
              className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              業務を追加
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <div className="font-medium">総勤務時間:</div>
              <div className="font-bold">{formatMinutes(totalWorkMinutes)}</div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="font-medium">未割当時間:</div>
              <div className="font-medium">{formatMinutes(unassignedMinutes)}</div>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        <div className="bg-blue-50 p-5 rounded-lg text-blue-800 font-medium mb-6">
          本日の総給与: {formatCurrency(totalWage)}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月給計算</h3>
          <div className="text-lg">
            <span className="font-medium">月給 ({workDaysPerMonth}日勤務): </span>
            <span className="font-bold text-green-600">{formatCurrency(monthlyWage)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkTimeCalculator; 