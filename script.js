// 入力を「1300 → 13:00」のように整形
function normalizeTime(str) {
  str = (str || '').trim();
  if (!str) return '';
  if (/^\d{1,2}:\d{2}$/.test(str)) return str; // 既に HH:MM 形式
  const digits = str.replace(/\D/g, '');
  if (digits.length === 3) {
    // 915 → 0915
    return digits.padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
  }
  if (digits.length === 4) {
    // 1300 → 13:00
    return digits.replace(/(\d{2})(\d{2})/, '$1:$2');
  }
  if (digits.length <= 2) {
    // 9 → 09:00
    return digits.padStart(2, '0') + ':00';
  }
  // 不正な入力
  return '';
}

// HH:MM → 分
function toMinutes(timeStr) {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// 分 → 時間表示
function formatMinutes(total) {
  const h = Math.floor(Math.abs(total) / 60);
  const m = Math.abs(total) % 60;
  return `${total < 0 ? '-' : ''}${h}時間${m}分`;
}

// 金額をフォーマット
function formatCurrency(amount) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

// ローカルストレージから設定を読み込む
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('workTimeSettings') || '{}');
  
  // 時給の設定を復元
  if (settings.hourlyRates) {
    const { lesson, support, other } = settings.hourlyRates;
    if (lesson) document.getElementById('lesson-rate').value = lesson;
    if (support) document.getElementById('support-rate').value = support;
    if (other) document.getElementById('other-rate').value = other;
  }
}

// ローカルストレージに設定を保存
function saveSettings() {
  const settings = {
    hourlyRates: {
      lesson: document.getElementById('lesson-rate').value,
      support: document.getElementById('support-rate').value,
      other: document.getElementById('other-rate').value
    }
  };
  
  localStorage.setItem('workTimeSettings', JSON.stringify(settings));
}

// 計算実行
function recalc() {
  const startInput = document.getElementById('start');
  const endInput = document.getElementById('end');
  
  // 画面表示用に時刻を整形（計算前）
  const normalizedStart = normalizeTime(startInput.value);
  const normalizedEnd = normalizeTime(endInput.value);
  
  // 整形した値を表示
  if (startInput.value !== normalizedStart) {
    startInput.value = normalizedStart;
  }
  
  if (endInput.value !== normalizedEnd) {
    endInput.value = normalizedEnd;
  }

  const startMin = toMinutes(normalizedStart);
  const endMin = toMinutes(normalizedEnd);

  if (isNaN(startMin) || isNaN(endMin)) {
    document.getElementById('result').textContent = '時刻を正しく入力してください';
    document.getElementById('wage-result').textContent = '';
    return;
  }

  let diff = endMin - startMin;
  if (diff < 0) diff += 24 * 60; // 翌日退勤

  const lesson = parseInt(document.getElementById('lesson').value) || 0;
  const support = parseInt(document.getElementById('support').value) || 0;
  const other = diff - (lesson + support);

  document.getElementById('other').value = other;

  // 時給の取得
  const lessonRate = parseInt(document.getElementById('lesson-rate').value) || 0;
  const supportRate = parseInt(document.getElementById('support-rate').value) || 0;
  const otherRate = parseInt(document.getElementById('other-rate').value) || 0;

  // 各業務の賃金計算（時給 × 時間）
  const lessonWage = (lesson / 60) * lessonRate;
  const supportWage = (support / 60) * supportRate;
  const otherWage = (other / 60) * otherRate;
  const totalWage = lessonWage + supportWage + otherWage;

  // 勤務時間の結果表示
  let html = `<div class="text-lg">勤務時間: ${formatMinutes(diff)}</div>`;
  if (other < 0) {
    html += '<div class="mt-2 p-3 bg-red-100 text-red-800 rounded border border-red-200">※授業＋サポートが勤務時間を超えています</div>';
  } else {
    html += `<div class="text-sm mt-1">その他業務: ${formatMinutes(other)}</div>`;
  }
  document.getElementById('result').innerHTML = html;
  
  // 賃金計算結果の表示
  let wageHtml = `
    <h3 class="text-xl font-semibold text-gray-800 mb-4">賃金計算</h3>
    <div class="space-y-2">
      <div class="flex justify-between items-center p-2 border-b">
        <div>授業</div>
        <div class="text-right">
          <div class="text-sm text-gray-600">${formatMinutes(lesson)} × ${lessonRate}円/時</div>
          <div class="font-medium">${formatCurrency(lessonWage)}</div>
        </div>
      </div>
      <div class="flex justify-between items-center p-2 border-b">
        <div>サポート</div>
        <div class="text-right">
          <div class="text-sm text-gray-600">${formatMinutes(support)} × ${supportRate}円/時</div>
          <div class="font-medium">${formatCurrency(supportWage)}</div>
        </div>
      </div>
      <div class="flex justify-between items-center p-2 border-b">
        <div>その他業務</div>
        <div class="text-right">
          <div class="text-sm text-gray-600">${formatMinutes(other)} × ${otherRate}円/時</div>
          <div class="font-medium">${formatCurrency(otherWage)}</div>
        </div>
      </div>
      <div class="flex justify-between items-center p-3 mt-4 bg-gray-50 rounded-md">
        <div class="font-bold text-lg">合計</div>
        <div class="font-bold text-lg text-primary">${formatCurrency(totalWage)}</div>
      </div>
    </div>
  `;
  document.getElementById('wage-result').innerHTML = wageHtml;
  
  // 設定をローカルストレージに保存
  saveSettings();
}

// 数字のみを入力できるようにする
function handleTimeInput(e) {
  const input = e.target;
  // 数字のみ許可（バックスペース等のキーも許可）
  const isNumeric = /^\d*$/.test(input.value);
  
  if (!isNumeric) {
    // 数字以外の文字を削除
    input.value = input.value.replace(/\D/g, '');
  }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
  // ローカルストレージから設定を読み込む
  loadSettings();
  
  const timeInputs = document.querySelectorAll('#start, #end');
  const numberInputs = document.querySelectorAll('input[type="number"]:not([readonly])');
  
  // 時間入力フィールドの設定
  timeInputs.forEach(input => {
    // 入力中は数字のみを許可し、フォーマットはしない
    input.addEventListener('input', handleTimeInput);
    // フォーカスが外れたときだけフォーマットして計算
    input.addEventListener('blur', recalc);
  });
  
  // 数値入力フィールドの設定（リアルタイム計算）
  numberInputs.forEach(input => {
    input.addEventListener('input', recalc);
    // 時給フィールドはフォーカスが外れたときに設定を保存
    if (input.id.includes('-rate')) {
      input.addEventListener('blur', saveSettings);
    }
  });
  
  // 初期計算
  recalc();
}); 