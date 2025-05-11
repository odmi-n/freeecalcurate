// JavaScript code for shitfreee.html will go here
console.log("shitfreee.js loaded");

document.addEventListener('DOMContentLoaded', function() {
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');

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
    }

    updateTime(); // 初期表示
    setInterval(updateTime, 1000); // 1秒ごとに更新
}); 