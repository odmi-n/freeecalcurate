import React, { useEffect, useState } from 'react';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  hourId: string;
  minuteId: string;
  mobileId: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  hourId,
  minuteId,
  mobileId
}) => {
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');

  // 時間と分の選択肢を生成
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  const minutes = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  );

  // value からhour, minuteを分離
  useEffect(() => {
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(':');
      setHour(h);
      setMinute(m);
    }
  }, [value]);

  // hour, minute から time string を生成
  const updateTime = (newHour: string, newMinute: string) => {
    const timeString = `${newHour}:${newMinute}`;
    onChange(timeString);
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, minute);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(hour, newMinute);
  };

  const handleMobileTimeChange = (timeValue: string) => {
    onChange(timeValue);
  };

  return (
    <div>
      <label htmlFor={hourId} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* PC用のレイアウト */}
      <div className="hidden-mobile grid grid-cols-2 gap-2">
        <select
          id={hourId}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <select
          id={minuteId}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* スマートフォン用のレイアウト */}
      <div className="md:hidden">
        <input
          type="time"
          id={mobileId}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm"
          value={value}
          onChange={(e) => handleMobileTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TimeInput; 