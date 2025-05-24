import React, { useState, useEffect } from 'react';
import type { CheckRecord } from '../types/config';
import { attendanceStorage } from '../utils/storage';
import { getLocation, getAddressFromCoordinates } from '../utils/location';
import { getCurrentTime, getCurrentDateFormatted } from '../utils/timeUtils';

const AttendanceTracker: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(getCurrentDateFormatted());
  const [records, setRecords] = useState<CheckRecord[]>([]);
  const [locationStatus, setLocationStatus] = useState('端末の位置情報利用が許可されていません。');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  // 時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDateFormatted());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 経過時間の計算
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - checkInTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckedIn, checkInTime]);

  // 記録の読み込み
  useEffect(() => {
    const loadedRecords = attendanceStorage.load();
    setRecords(loadedRecords);
    
    // 出勤状態の確認
    const hasCheckIn = loadedRecords.some(record => record.type === 'check-in');
    const hasCheckOut = loadedRecords.some(record => record.type === 'check-out');
    
    if (hasCheckIn && !hasCheckOut) {
      setIsCheckedIn(true);
      const checkInRecord = loadedRecords.find(record => record.type === 'check-in');
      if (checkInRecord) {
        const [hours, minutes] = checkInRecord.time.split(':').map(Number);
        const checkInDate = new Date();
        checkInDate.setHours(hours, minutes, 0, 0);
        setCheckInTime(checkInDate);
      }
    }
  }, []);

  // 位置情報の取得を試行
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('位置情報を取得中...');
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus(`位置情報が利用可能です`);
        },
        () => {
          setLocationStatus('位置情報の取得に失敗しました。');
        }
      );
    }
  }, []);

  // 記録を保存する共通関数
  const saveRecord = async (type: CheckRecord['type']) => {
    try {
      const location = await getLocation();
      const address = await getAddressFromCoordinates(location.latitude, location.longitude);
      
      const newRecord: CheckRecord = {
        type,
        time: getCurrentTime(),
        location: address,
        latitude: location.latitude,
        longitude: location.longitude
      };

      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      attendanceStorage.save(updatedRecords);

      if (type === 'check-in') {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
      } else if (type === 'check-out') {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setElapsedTime('00:00');
      }

    } catch (error) {
      // 位置情報が取得できない場合も記録
      const newRecord: CheckRecord = {
        type,
        time: getCurrentTime(),
        location: '位置情報なし'
      };

      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      attendanceStorage.save(updatedRecords);

      if (type === 'check-in') {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
      } else if (type === 'check-out') {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setElapsedTime('00:00');
      }
    }
  };

  // 出勤
  const handleCheckIn = () => {
    saveRecord('check-in');
  };

  // 退勤
  const handleCheckOut = () => {
    saveRecord('check-out');
  };

  // チェックポイント
  const handleCheckpoint = () => {
    saveRecord('checkpoint');
  };

  // 記録をクリア（デバッグ用）
  const clearRecords = () => {
    setRecords([]);
    attendanceStorage.clear();
    setIsCheckedIn(false);
    setCheckInTime(null);
    setElapsedTime('00:00');
  };

  // 記録をフィルタリング
  const checkInRecord = records.find(record => record.type === 'check-in');
  const checkOutRecord = records.find(record => record.type === 'check-out');
  const checkpointRecords = records.filter(record => record.type === 'checkpoint');

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow-md relative">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="w-32">
              <div className="text-sm text-gray-700">位置情報</div>
            </div>
            <div className="flex-1 text-center px-4">
              <div className="text-lg font-semibold text-gray-800">{currentDate}</div>
              <div className="text-3xl font-bold text-gray-900">{currentTime}</div>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="triangle-down"></div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow bg-gray-700 flex flex-col items-center pt-6 pb-4">
        <div className="text-center w-full max-w-4xl px-4">
          <h1 className="text-2xl font-bold text-white mb-6">リアルタイム打刻</h1>

          {/* ボタン群 */}
          <div className="flex flex-wrap justify-center items-center px-4 sm:px-0 sm:flex-nowrap sm:justify-center sm:space-x-4 mb-6">
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className={`font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center text-xl w-auto mb-4 sm:mb-0 order-1 sm:order-1 flex-1 sm:flex-none mr-2 sm:mr-0 ${
                isCheckedIn 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-teal-400 hover:bg-teal-500 text-white'
              }`}
            >
              <i className="fas fa-arrow-up mr-2 text-2xl"></i>
              <span className="whitespace-nowrap">出勤</span>
            </button>
            
            <button
              onClick={handleCheckpoint}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center text-xl w-full sm:w-auto mb-4 sm:mb-0 order-3 sm:order-2"
            >
              <i className="fas fa-map-marker-alt mr-2 text-2xl"></i>
              <span className="whitespace-nowrap">チェックポイント</span>
            </button>
            
            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
              className={`font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center text-xl w-auto mb-4 sm:mb-0 order-2 sm:order-3 flex-1 sm:flex-none ml-2 sm:ml-0 ${
                !isCheckedIn 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              <i className="fas fa-arrow-down mr-2 text-2xl"></i>
              <span className="whitespace-nowrap">退勤</span>
            </button>
          </div>

          {/* タイムカード表示 */}
          {records.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-5 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">タイムカード</h2>
              
              {/* 出勤記録 */}
              {checkInRecord && (
                <div className="text-white text-left mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <i className="fas fa-arrow-up text-teal-400 mr-2"></i>
                      <span>出勤</span>
                    </div>
                    <div className="font-semibold">{checkInRecord.time}</div>
                  </div>
                  <div className="text-gray-400 text-sm ml-6">{checkInRecord.location}</div>
                </div>
              )}
              
              {/* チェックポイント記録 */}
              {checkpointRecords.map((record, index) => (
                <div key={index} className="text-white text-left mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <i className="fas fa-map-marker-alt text-yellow-400 mr-2"></i>
                      <span>チェックポイント {index + 1}</span>
                    </div>
                    <div className="font-semibold">{record.time}</div>
                  </div>
                  <div className="text-gray-400 text-sm ml-6">{record.location}</div>
                </div>
              ))}
              
              {/* 退勤記録 */}
              {checkOutRecord && (
                <div className="text-white text-left my-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <i className="fas fa-arrow-down text-pink-500 mr-2"></i>
                      <span>退勤</span>
                    </div>
                    <div className="font-semibold">{checkOutRecord.time}</div>
                  </div>
                  <div className="text-gray-400 text-sm ml-6">{checkOutRecord.location}</div>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-400 mt-4 text-sm">{locationStatus}</p>
          
          {isCheckedIn && (
            <p className="text-white mt-2 text-lg">
              経過時間: <span className="font-bold">{elapsedTime}</span>
            </p>
          )}

          {/* デバッグ用クリアボタン */}
          {records.length > 0 && (
            <button
              onClick={clearRecords}
              className="mt-4 text-sm text-gray-400 hover:text-white underline"
            >
              記録をクリア
            </button>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-center py-4">
        <p className="text-xs text-gray-400">&copy; freee K.K.</p>
      </footer>
    </div>
  );
};

export default AttendanceTracker; 