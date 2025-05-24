import React from 'react';
import type { Task } from '../types/config';
import { CONFIG } from '../types/config';

interface TaskRowProps {
  task: Task;
  isOtherTask?: boolean;
  onUpdate: (updatedTask: Task) => void;
  onDelete?: () => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ 
  task, 
  isOtherTask = false, 
  onUpdate, 
  onDelete 
}) => {
  const isDisabledTask = CONFIG.DISABLED_HOURLY_RATE_TASKS.includes(task.type);

  const handleTypeChange = (newType: string) => {
    const isNewDisabledTask = CONFIG.DISABLED_HOURLY_RATE_TASKS.includes(newType);
    const newRate = isNewDisabledTask ? 0 : (CONFIG.DEFAULT_HOURLY_RATES[newType] || 800);
    
    onUpdate({
      ...task,
      type: newType,
      rate: newRate
    });
  };

  const handleMinutesChange = (minutes: number) => {
    onUpdate({
      ...task,
      minutes: Math.max(0, minutes)
    });
  };

  const handleRateChange = (rate: number) => {
    onUpdate({
      ...task,
      rate: Math.max(0, rate)
    });
  };

  return (
    <div className={`task-row grid grid-cols-1 md:grid-cols-3 gap-5 border-b pb-5 ${
      isOtherTask ? 'other-task-row bg-gray-50' : ''
    }`}>
      <div className="task-type-container">
        <label className="block text-sm font-medium text-gray-700 mb-2">業務タイプ</label>
        {isOtherTask ? (
          <div className="px-4 py-3 text-gray-700 font-medium">その他業務</div>
        ) : (
          <div className="flex items-center">
            <select
              className="task-type w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              style={{ minWidth: '200px' }}
              value={task.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {CONFIG.TASK_TYPES.map((taskType) => (
                <option key={taskType} value={taskType}>
                  {taskType}
                </option>
              ))}
            </select>
            {onDelete && (
              <button
                className="delete-task ml-3 text-red-500 hover:text-red-700 p-2"
                onClick={onDelete}
                type="button"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="task-minutes-container">
        <label className="block text-sm font-medium text-gray-700 mb-2">時間</label>
        <div className="input-with-unit">
          <input
            type="number"
            className={`task-minutes w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              isOtherTask ? 'bg-gray-100' : ''
            }`}
            min="0"
            step="5"
            value={task.minutes}
            readOnly={isOtherTask}
            onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
          />
          <span className="unit">分</span>
        </div>
      </div>
      
      <div className="hourly-rate-container">
        <label className="block text-sm font-medium text-gray-700 mb-2">時給</label>
        <div className="input-with-unit">
          <input
            type="number"
            className={`task-rate w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              isDisabledTask ? 'bg-gray-100' : ''
            }`}
            min="0"
            value={task.rate}
            readOnly={isDisabledTask}
            onChange={(e) => handleRateChange(parseInt(e.target.value) || 0)}
          />
          <span className="unit">円</span>
        </div>
      </div>
    </div>
  );
};

export default TaskRow; 