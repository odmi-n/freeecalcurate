// JavaScript code for shitfreee.html will go here
console.log("shitfreee.js loaded");

document.addEventListener('DOMContentLoaded', function() {
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    const locationElement = document.getElementById('current-location');
    const locationStatusElement = document.getElementById('location-status');
    
    // 新しいエレメント
    const checkInBtn = document.getElementById('check-in-btn');
    const checkpointBtn = document.getElementById('checkpoint-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    
    const timecard = document.getElementById('timecard');
    const checkInRecord = document.getElementById('check-in-record');
    const checkInTime = document.getElementById('check-in-time');
    const checkInLocation = document.getElementById('check-in-location');
    
    const checkpointList = document.getElementById('checkpoint-list');
    
    const checkOutRecord = document.getElementById('check-out-record');
    const checkOutTime = document.getElementById('check-out-time');
    const checkOutLocation = document.getElementById('check-out-location');
    
    const timerStatus = document.getElementById('timer-status');
    const elapsedTimeElement = document.getElementById('elapsed-time');
    
    // 勤怠データ
    let workData = {
        checkIn: null,
        checkInLocation: '',
        checkpoints: [],
        checkOut: null,
        checkOutLocation: '',
        isWorking: false,
        startTime: null,
        lastCheckpointTime: null,
        timer: null
    };
    
    // 都道府県の英語→日本語マッピング
    const prefectureMapping = {
        // 都道府県
        'hokkaido': '北海道',
        'aomori': '青森県',
        'iwate': '岩手県',
        'miyagi': '宮城県',
        'akita': '秋田県',
        'yamagata': '山形県',
        'fukushima': '福島県',
        'ibaraki': '茨城県',
        'tochigi': '栃木県',
        'gunma': '群馬県',
        'saitama': '埼玉県',
        'chiba': '千葉県',
        'tokyo': '東京都',
        'kanagawa': '神奈川県',
        'niigata': '新潟県',
        'toyama': '富山県',
        'ishikawa': '石川県',
        'fukui': '福井県',
        'yamanashi': '山梨県',
        'nagano': '長野県',
        'gifu': '岐阜県',
        'shizuoka': '静岡県',
        'aichi': '愛知県',
        'mie': '三重県',
        'shiga': '滋賀県',
        'kyoto': '京都府',
        'osaka': '大阪府',
        'hyogo': '兵庫県',
        'nara': '奈良県',
        'wakayama': '和歌山県',
        'tottori': '鳥取県',
        'shimane': '島根県',
        'okayama': '岡山県',
        'hiroshima': '広島県',
        'yamaguchi': '山口県',
        'tokushima': '徳島県',
        'kagawa': '香川県',
        'ehime': '愛媛県',
        'kochi': '高知県',
        'fukuoka': '福岡県',
        'saga': '佐賀県',
        'nagasaki': '長崎県',
        'kumamoto': '熊本県',
        'oita': '大分県',
        'miyazaki': '宮崎県',
        'kagoshima': '鹿児島県',
        'okinawa': '沖縄県',
        // 英語表記のバリエーション
        'tokyo prefecture': '東京都',
        'tokyo metropolis': '東京都',
        'kyoto prefecture': '京都府',
        'osaka prefecture': '大阪府',
        'hokkaido prefecture': '北海道',
        // 省略形
        'tokyo to': '東京都',
        'osaka fu': '大阪府',
        'kyoto fu': '京都府',
        // 英語での一般的な表記
        'tokyo': '東京都',
        'osaka': '大阪府',
        'kyoto': '京都府'
    };

    // 英語の都道府県名を日本語に変換する関数
    function translateRegion(region) {
        if (!region) return '';

        // 小文字に変換して比較
        const lowerRegion = region.toLowerCase();
        
        // 直接マッピングがある場合
        if (prefectureMapping[lowerRegion]) {
            return prefectureMapping[lowerRegion];
        }
        
        // Prefectureがついている場合の処理
        if (lowerRegion.includes('prefecture')) {
            const baseName = lowerRegion.replace(' prefecture', '');
            if (prefectureMapping[baseName]) {
                return prefectureMapping[baseName];
            }
        }
        
        // その他のケース
        for (const key in prefectureMapping) {
            if (lowerRegion.includes(key)) {
                return prefectureMapping[key];
            }
        }
        
        // 変換できない場合はそのまま返す
        return region;
    }

    function updateTime() {
        const now = new Date();

        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        
        // 曜日の配列（日本語）
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const dayOfWeek = weekdays[now.getDay()];

        // スクリーンショットと同じフォーマット: YYYY年MM月DD日 (曜)
        dateElement.textContent = `${year}年${month}月${day}日 (${dayOfWeek})`;

        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        // 時刻表示: HH:MM:SS
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        
        // 勤務中なら経過時間を更新
        if (workData.isWorking) {
            updateElapsedTime();
        }
    }
    
    // フォーマット済みの時刻を取得
    function getFormattedTime(date) {
        if (!date) return '';
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }
    
    // 経過時間（分）を計算
    function calculateElapsedMinutes(start, end) {
        if (!start || !end) return 0;
        
        const diff = end - start;
        return Math.floor(diff / 60000); // ミリ秒を分に変換
    }
    
    // 経過時間を更新
    function updateElapsedTime() {
        if (!workData.startTime) return;
        
        const now = new Date();
        const diffMs = now - workData.startTime;
        
        // 時間と分を計算
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        // 表示を更新
        elapsedTimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // 業務タイプの選択肢を設定（今はselect引数を使わないように修正）
    function setupTaskTypes() {
        if (!window.CONFIG || !window.CONFIG.TASK_TYPES) {
            console.error("CONFIG.TASK_TYPES is not defined");
            return;
        }
        
        console.log("業務タイプ設定の準備完了");
    }
    
    // 業務タイプの選択肢を設定したセレクトボックスを作成
    function createTaskTypeSelect(index) {
        if (!window.CONFIG || !window.CONFIG.TASK_TYPES) {
            console.error("CONFIG.TASK_TYPES is not defined");
            return document.createElement('div');
        }
        
        const selectContainer = document.createElement('div');
        selectContainer.className = 'mt-2 ml-6';
        
        const select = document.createElement('select');
        select.className = 'w-full p-1 rounded bg-gray-700 text-white border border-gray-600 text-sm';
        select.dataset.checkpointIndex = index;
        select.id = `task-select-${index}`;
        
        // 選択肢を追加
        window.CONFIG.TASK_TYPES.forEach(taskType => {
            const option = document.createElement('option');
            option.value = taskType;
            option.textContent = taskType;
            select.appendChild(option);
        });
        
        // 業務タイプが変更されたときのイベントハンドラ
        select.addEventListener('change', function() {
            const checkpointId = this.dataset.checkpointIndex;
            const taskType = this.value;
            
            // 出勤時の場合は特別に処理
            if (checkpointId === 'check-in') {
                // 表示を更新
                const taskInfoElement = document.getElementById(`task-info-check-in`);
                if (taskInfoElement) {
                    taskInfoElement.innerHTML = `<span>業務: ${taskType}</span>`;
                }
                console.log(`出勤時の業務タイプを更新: ${taskType}`);
                return;
            }
            
            // 通常のチェックポイントの場合
            const checkpointIndex = parseInt(checkpointId) - 1;
            if (workData.checkpoints[checkpointIndex]) {
                workData.checkpoints[checkpointIndex].taskType = taskType;
                
                // 表示も更新
                const taskInfoElement = document.getElementById(`task-info-${checkpointId}`);
                if (taskInfoElement) {
                    taskInfoElement.textContent = `業務: ${taskType}`;
                }
                
                console.log(`チェックポイント ${checkpointId} の業務タイプを更新: ${taskType}`);
            }
        });
        
        // ラベル
        const label = document.createElement('label');
        label.className = 'block text-white text-left text-sm mb-1';
        label.textContent = '業務:';
        
        selectContainer.appendChild(label);
        selectContainer.appendChild(select);
        
        return selectContainer;
    }

    // シンプルな位置情報表示（実装の簡素化）
    function getLocation() {
        // デモ用：固定の位置情報を表示
        // 実際のアプリでは、サーバーサイドで処理するのが適切
        const defaultLocations = [
            "東京都 千代田区",
            "東京都 新宿区",
            "東京都 渋谷区",
            "大阪府 大阪市",
            "愛知県 名古屋市",
            "福岡県 福岡市",
            "北海道 札幌市",
            "宮城県 仙台市"
        ];
        
        if (locationStatusElement) {
            locationStatusElement.textContent = '位置情報取得中...';
        }

        // 現在時刻をシードにして擬似的にランダムな位置を選択
        // デモ用なので、同じ時間帯では同じ位置が表示される
        const date = new Date();
        const hourSeed = date.getHours();
        const locationIndex = hourSeed % defaultLocations.length;
        
        return new Promise((resolve) => {
            // シンプルに固定の日本語位置情報を表示
            setTimeout(() => {
                const location = defaultLocations[locationIndex];
                locationElement.textContent = location;
                
                if (locationStatusElement) {
                    locationStatusElement.textContent = '位置情報取得完了';
                }
                
                console.log("位置情報表示:", location);
                resolve(location);
            }, 500); // 短い遅延を入れて読み込み感を出す
        });
    }

    // 実際の位置情報取得を試みる関数（本番環境用）
    function getRealLocation() {
        if (!navigator.geolocation) {
            console.log("Geolocation API is not supported");
            return getLocation(); // フォールバック
        }
        
        if (locationStatusElement) {
            locationStatusElement.textContent = '位置情報取得中...';
        }
        
        return new Promise((resolve) => {
            try {
                navigator.geolocation.getCurrentPosition(
                    // 成功時
                    position => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        
                        console.log("位置情報取得成功:", latitude, longitude);
                        
                        // 実際の環境では緯度経度から住所を取得する処理を入れる
                        // この例ではデモのためデフォルト位置を表示
                        getLocation().then(resolve);
                    },
                    // エラー時
                    error => {
                        console.error('位置情報の取得に失敗しました:', error);
                        getLocation().then(resolve); // フォールバック
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 300000
                    }
                );
            } catch (error) {
                console.error("位置情報APIの呼び出しエラー:", error);
                getLocation().then(resolve); // フォールバック
            }
        });
    }
    
    // 出勤処理
    function handleCheckIn() {
        if (workData.isWorking) {
            alert('既に出勤済みです');
            return;
        }
        
        // 位置情報取得
        getRealLocation().then(location => {
            const now = new Date();
            
            // 勤怠データを更新
            workData.checkIn = now;
            workData.checkInLocation = location;
            workData.isWorking = true;
            workData.startTime = now;
            
            // タイムカード表示
            checkInTime.textContent = getFormattedTime(now);
            checkInLocation.textContent = location;
            checkInRecord.classList.remove('hidden');
            timecard.classList.remove('hidden');
            
            // タイマー表示
            timerStatus.classList.remove('hidden');
            updateElapsedTime();
            
            // 出勤時の業務選択を追加（出勤チェックポイント）
            const defaultTaskType = window.CONFIG && window.CONFIG.TASK_TYPES ? 
                window.CONFIG.TASK_TYPES[0] : 'その他業務';
            
            // 出勤時チェックポイントデータ
            const checkInCheckpoint = {
                time: now,
                location: location,
                taskType: defaultTaskType,
                elapsedMinutes: 0,
                isCheckIn: true
            };
            
            // チェックポイント表示を追加（出勤時）
            const checkInTaskSelect = createTaskTypeSelect('check-in');
            const checkInTaskContainer = document.createElement('div');
            checkInTaskContainer.className = 'mt-2 ml-6';
            checkInTaskContainer.innerHTML = `
                <div id="task-info-check-in" class="text-gray-300 text-sm flex justify-between mt-1">
                    <span>業務: ${defaultTaskType}</span>
                </div>
            `;
            
            // 業務選択要素を追加
            checkInRecord.appendChild(checkInTaskSelect);
            checkInRecord.appendChild(checkInTaskContainer);
            
            // ボタンの有効/無効状態を切り替え
            checkInBtn.disabled = true;
            checkInBtn.classList.add('opacity-50');
            checkpointBtn.disabled = false;
            checkpointBtn.classList.remove('opacity-50');
            checkOutBtn.disabled = false;
            checkOutBtn.classList.remove('opacity-50');
            
            console.log("出勤処理完了:", now, location);
            
            // ステータスメッセージを更新
            locationStatusElement.textContent = '出勤打刻完了';
        });
    }
    
    // チェックポイント追加処理
    function handleCheckpoint() {
        if (!workData.isWorking) {
            alert('まだ出勤処理が行われていません');
            return;
        }
        
        // 位置情報取得
        getRealLocation().then(location => {
            const now = new Date();
            
            // 前回のチェックポイントからの経過時間を計算（分）
            // 最初のチェックポイントの場合は出勤時間から計算
            const startTimeForCalculation = workData.lastCheckpointTime || workData.checkIn;
            const elapsedMinutes = calculateElapsedMinutes(startTimeForCalculation, now);
            
            // デフォルト業務タイプ（出勤時と同じ業務タイプをデフォルトに）
            const checkInTaskSelect = document.getElementById('task-select-check-in');
            const defaultTaskType = checkInTaskSelect && checkInTaskSelect.value ? 
                checkInTaskSelect.value : 
                (window.CONFIG && window.CONFIG.TASK_TYPES ? window.CONFIG.TASK_TYPES[0] : 'その他業務');
            
            // チェックポイントデータ
            const checkpoint = {
                time: now,
                location: location,
                taskType: defaultTaskType,
                elapsedMinutes: elapsedMinutes
            };
            
            // 勤怠データを更新
            workData.checkpoints.push(checkpoint);
            workData.lastCheckpointTime = now;
            
            // チェックポイント表示を追加
            const checkpointIndex = workData.checkpoints.length;
            addCheckpointToList(checkpoint, checkpointIndex);
            
            console.log("チェックポイント追加:", checkpoint);
            
            // ステータスメッセージを更新
            locationStatusElement.textContent = 'チェックポイント記録完了';
        });
    }
    
    // チェックポイントリストに追加
    function addCheckpointToList(checkpoint, index) {
        const checkpointElement = document.createElement('div');
        checkpointElement.className = 'mb-4 border-t border-gray-700 pt-2';
        
        // 時間とチェックポイント番号の行
        const headerLine = document.createElement('div');
        headerLine.className = 'flex justify-between items-center';
        
        const titleSpan = document.createElement('div');
        titleSpan.innerHTML = `<i class="fas fa-map-marker-alt text-yellow-400 mr-2"></i>チェックポイント ${index}`;
        
        const timeSpan = document.createElement('div');
        timeSpan.className = 'font-semibold';
        timeSpan.textContent = getFormattedTime(checkpoint.time);
        
        headerLine.appendChild(titleSpan);
        headerLine.appendChild(timeSpan);
        
        // 位置情報の行
        const locationLine = document.createElement('div');
        locationLine.className = 'text-gray-400 text-sm ml-6';
        locationLine.textContent = checkpoint.location;
        
        // 業務タイプ選択フォーム
        const taskSelect = createTaskTypeSelect(index);
        
        // 経過時間の行
        const elapsedTimeLine = document.createElement('div');
        elapsedTimeLine.className = 'text-gray-300 text-sm ml-6 flex justify-between mt-1';
        elapsedTimeLine.innerHTML = `
            <span id="task-info-${index}">業務: ${checkpoint.taskType}</span>
            <span>経過時間: ${checkpoint.elapsedMinutes}分</span>
        `;
        
        // 全ての要素を追加
        checkpointElement.appendChild(headerLine);
        checkpointElement.appendChild(locationLine);
        checkpointElement.appendChild(taskSelect);
        checkpointElement.appendChild(elapsedTimeLine);
        
        // リストに追加
        checkpointList.appendChild(checkpointElement);
    }
    
    // 各業務タイプごとの時間を計算
    function calculateTaskTypeTimes() {
        // 業務タイプごとの合計時間を初期化
        const taskTypeTimes = {};
        
        // CONFIG.TASK_TYPESが定義されていれば、全業務タイプを初期化
        if (window.CONFIG && window.CONFIG.TASK_TYPES) {
            window.CONFIG.TASK_TYPES.forEach(taskType => {
                taskTypeTimes[taskType] = 0;
            });
        }
        
        // 出勤チェックポイントの業務タイプを取得
        let checkInTaskType = '未設定';
        const checkInTaskSelect = document.getElementById('task-select-check-in');
        if (checkInTaskSelect) {
            checkInTaskType = checkInTaskSelect.value;
        }
        
        // 最初のチェックポイントまでの時間を計算
        let lastTime = workData.checkIn;
        let totalMinutes = 0;
        
        // チェックポイントがある場合
        if (workData.checkpoints.length > 0) {
            // 出勤から最初のチェックポイントまでの時間
            const firstCheckpoint = workData.checkpoints[0];
            const minutesToFirstCheckpoint = calculateElapsedMinutes(lastTime, firstCheckpoint.time);
            
            // 出勤時の業務タイプに時間を加算
            if (!taskTypeTimes[checkInTaskType]) {
                taskTypeTimes[checkInTaskType] = 0;
            }
            taskTypeTimes[checkInTaskType] += minutesToFirstCheckpoint;
            totalMinutes += minutesToFirstCheckpoint;
            
            // 各チェックポイント間の時間を計算
            for (let i = 0; i < workData.checkpoints.length; i++) {
                const checkpoint = workData.checkpoints[i];
                const taskType = checkpoint.taskType || '未設定';
                
                // 最後のチェックポイントでなければ、次のチェックポイントまでの時間を計算
                if (i < workData.checkpoints.length - 1) {
                    const nextCheckpoint = workData.checkpoints[i + 1];
                    const minutes = calculateElapsedMinutes(checkpoint.time, nextCheckpoint.time);
                    
                    // 業務タイプごとの時間を加算
                    if (!taskTypeTimes[taskType]) {
                        taskTypeTimes[taskType] = 0;
                    }
                    taskTypeTimes[taskType] += minutes;
                    totalMinutes += minutes;
                } else {
                    // 最後のチェックポイントから退勤までの時間
                    const minutes = calculateElapsedMinutes(checkpoint.time, workData.checkOut);
                    
                    // 業務タイプごとの時間を加算
                    if (!taskTypeTimes[taskType]) {
                        taskTypeTimes[taskType] = 0;
                    }
                    taskTypeTimes[taskType] += minutes;
                    totalMinutes += minutes;
                }
            }
        } else {
            // チェックポイントがない場合は、出勤から退勤までの時間を計算
            const minutes = calculateElapsedMinutes(lastTime, workData.checkOut);
            
            // 出勤時の業務タイプに時間を加算
            if (!taskTypeTimes[checkInTaskType]) {
                taskTypeTimes[checkInTaskType] = 0;
            }
            taskTypeTimes[checkInTaskType] += minutes;
            totalMinutes += minutes;
        }
        
        return { taskTypeTimes, totalMinutes };
    }
    
    // 業務時間の集計を表示
    function displayTaskSummary() {
        const { taskTypeTimes, totalMinutes } = calculateTaskTypeTimes();
        
        // 業務時間集計表示エリアを作成
        const summaryElement = document.createElement('div');
        summaryElement.className = 'mt-6 pt-4 border-t-2 border-gray-600';
        
        // タイトル
        const titleElement = document.createElement('h3');
        titleElement.className = 'text-lg font-bold text-white mb-3';
        titleElement.textContent = '本日の業務時間';
        summaryElement.appendChild(titleElement);
        
        // 各業務タイプの時間を表示
        const taskTypesDiv = document.createElement('div');
        taskTypesDiv.className = 'text-sm text-gray-300 ml-3 mb-3';

        // 選択されたすべての業務タイプを取得
        const selectedTaskTypes = new Set();
        
        // 出勤時の業務タイプを追加
        const checkInTaskSelect = document.getElementById('task-select-check-in');
        if (checkInTaskSelect) {
            selectedTaskTypes.add(checkInTaskSelect.value);
        }
        
        // チェックポイントの業務タイプを追加
        workData.checkpoints.forEach(checkpoint => {
            if (checkpoint.taskType) {
                selectedTaskTypes.add(checkpoint.taskType);
            }
        });
        
        // CONFIG.TASK_TYPESから選択されたタイプのみをフィルタリング
        const configTaskTypes = window.CONFIG && window.CONFIG.TASK_TYPES ? 
            window.CONFIG.TASK_TYPES.filter(type => selectedTaskTypes.has(type)) : 
            Array.from(selectedTaskTypes);
        
        // 選択された業務タイプを時間の長い順にソート
        const sortedTaskTypes = configTaskTypes.sort((a, b) => {
            return (taskTypeTimes[b] || 0) - (taskTypeTimes[a] || 0);
        });
        
        // 選択されたすべての業務タイプを表示（時間が0分でも表示）
        sortedTaskTypes.forEach(taskType => {
            const minutes = taskTypeTimes[taskType] || 0;
            const taskRow = document.createElement('div');
            taskRow.className = 'flex justify-between mb-2 px-1';
            taskRow.innerHTML = `
                <span>${taskType}</span>
                <span>${minutes}分</span>
            `;
            taskTypesDiv.appendChild(taskRow);
        });
        
        // 業務タイプが選択されていない場合のメッセージ
        if (sortedTaskTypes.length === 0) {
            const noTaskRow = document.createElement('div');
            noTaskRow.className = 'text-center text-gray-500 mb-2';
            noTaskRow.textContent = '選択された業務タイプはありません';
            taskTypesDiv.appendChild(noTaskRow);
        }
        
        summaryElement.appendChild(taskTypesDiv);
        
        // 合計時間
        const totalElement = document.createElement('div');
        totalElement.className = 'flex justify-between text-white font-bold mt-3 pt-3 border-t border-gray-700 px-2';
        
        // 時間と分に変換
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        totalElement.innerHTML = `
            <span>合計</span>
            <span>${hours}時間${minutes}分（${totalMinutes}分）</span>
        `;
        
        summaryElement.appendChild(totalElement);
        
        // チェックポイントリストの後に追加
        checkpointList.parentNode.appendChild(summaryElement);
    }
    
    // 退勤処理
    function handleCheckOut() {
        if (!workData.isWorking) {
            alert('まだ出勤処理が行われていません');
            return;
        }
        
        // 位置情報取得
        getRealLocation().then(location => {
            const now = new Date();
            
            // 前回のチェックポイントからの経過時間を計算（分）
            let elapsedMinutes = 0;
            if (workData.lastCheckpointTime) {
                elapsedMinutes = calculateElapsedMinutes(workData.lastCheckpointTime, now);
            } else if (workData.checkIn) {
                elapsedMinutes = calculateElapsedMinutes(workData.checkIn, now);
            }
            
            // 勤怠データを更新
            workData.checkOut = now;
            workData.checkOutLocation = location;
            workData.isWorking = false;
            
            // 最後のチェックポイントがなければ、暗黙的にチェックポイントを追加
            if (workData.checkpoints.length === 0) {
                handleCheckpoint();
            } else {
                // 最後のチェックポイントから退勤までの情報を表示
                const finalCheckpoint = document.createElement('div');
                finalCheckpoint.className = 'mb-3 border-t border-gray-700 pt-2';
                finalCheckpoint.innerHTML = `
                    <div class="text-gray-300 text-sm flex justify-between">
                        <span>最終チェックポイントから</span>
                        <span>経過時間: ${elapsedMinutes}分</span>
                    </div>
                `;
                checkpointList.appendChild(finalCheckpoint);
            }
            
            // 退勤情報を表示
            checkOutTime.textContent = getFormattedTime(now);
            checkOutLocation.textContent = location;
            checkOutRecord.classList.remove('hidden');
            
            // 業務時間の集計を表示
            displayTaskSummary();
            
            // ボタンの有効/無効状態を切り替え
            checkInBtn.disabled = false;
            checkInBtn.classList.remove('opacity-50');
            checkpointBtn.disabled = true;
            checkpointBtn.classList.add('opacity-50');
            checkOutBtn.disabled = true;
            checkOutBtn.classList.add('opacity-50');
            
            console.log("退勤処理完了:", now, location);
            
            // ステータスメッセージを更新
            locationStatusElement.textContent = '退勤打刻完了';
            
            // タイマーをクリア
            timerStatus.classList.add('hidden');
        });
    }
    
    // ボタンにイベントリスナーを追加
    function setupEventListeners() {
        checkInBtn.addEventListener('click', handleCheckIn);
        checkpointBtn.addEventListener('click', handleCheckpoint);
        checkOutBtn.addEventListener('click', handleCheckOut);
        
        // 初期状態ではチェックポイントと退勤を無効化
        checkpointBtn.disabled = true;
        checkpointBtn.classList.add('opacity-50');
        checkOutBtn.disabled = true;
        checkOutBtn.classList.add('opacity-50');
    }

    updateTime(); // 初期表示
    setInterval(updateTime, 1000); // 1秒ごとに更新
    setupTaskTypes(); // 業務タイプ選択肢の設定
    setupEventListeners(); // イベントリスナーの設定
    
    // 初回ロード時に位置情報取得を試みる
    setTimeout(() => {
        getRealLocation(); // 実際の位置情報取得を試みる
    }, 1000);
    
    // デバッグ用にコンソール出力
    console.log("Time and location scripts initialized");
}); 