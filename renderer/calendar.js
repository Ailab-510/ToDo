(function () {

    // ── 状態 ──────────────────────────────────────────────
    let calYear, calMonth;
    let selStart   = null;  // 選択中の開始日 (YYYY-MM-DD)
    let selEnd     = null;  // 選択中の終了日 (YYYY-MM-DD)
    let hoverDate  = null;  // ホバー中の日付
    let pickingEnd = false; // 開始日選択済みで終了日待ちかどうか

    // ── DOM 要素 ──────────────────────────────────────────
    const btn      = document.getElementById('date-picker-btn');
    const popup    = document.getElementById('date-picker-popup');
    const titleEl  = document.getElementById('calendar-title');
    const gridEl   = document.getElementById('calendar-grid');
    const prevBtn  = document.getElementById('cal-prev');
    const nextBtn  = document.getElementById('cal-next');
    const clearBtn = document.getElementById('cal-clear');

    // ── ユーティリティ ────────────────────────────────────

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function toStr(y, m, d) {
        return `${y}-${pad(m + 1)}-${pad(d)}`;
    }

    function todayStr() {
        const t = new Date();
        return toStr(t.getFullYear(), t.getMonth(), t.getDate());
    }

    // M/D 形式に変換（ボタン表示用）
    function fmt(ds) {
        if (!ds) return '';
        const [, m, d] = ds.split('-');
        return `${parseInt(m)}/${parseInt(d)}`;
    }

    // ── カレンダーの描画 ──────────────────────────────────

    function render() {
        titleEl.textContent = `${calYear}年${calMonth + 1}月`;
        gridEl.innerHTML = '';

        // 曜日ヘッダー
        ['日','月','火','水','木','金','土'].forEach(day => {
            const h = document.createElement('div');
            h.className = 'cal-weekday';
            h.textContent = day;
            gridEl.appendChild(h);
        });

        // 月の1日が何曜日か調べて空白セルを入れる
        const firstWeekday = new Date(calYear, calMonth, 1).getDay();
        for (let i = 0; i < firstWeekday; i++) {
            const empty = document.createElement('div');
            gridEl.appendChild(empty);
        }

        // 日付セルを作る
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const today = todayStr();

        for (let d = 1; d <= daysInMonth; d++) {
            const ds = toStr(calYear, calMonth, d);
            const cell = document.createElement('div');
            cell.className = 'cal-day';
            cell.textContent = d;
            cell.dataset.date = ds;

            if (ds === today) cell.classList.add('is-today');

            // クリック
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                onDayClick(ds);
            });

            // ホバー開始（終了日選択待ちの時だけ範囲プレビューを表示）
            cell.addEventListener('mouseenter', () => {
                if (pickingEnd) {
                    hoverDate = ds;
                    updateRangeClasses();
                }
            });

            gridEl.appendChild(cell);
        }

        // グリッドからマウスが出たらプレビューを消す
        gridEl.addEventListener('mouseleave', () => {
            hoverDate = null;
            updateRangeClasses();
        });

        updateRangeClasses();
    }

    // 範囲のCSSクラスだけを更新（DOM再作成しない）
    function updateRangeClasses() {
        const effectiveEnd = (pickingEnd && hoverDate) ? hoverDate : selEnd;

        gridEl.querySelectorAll('.cal-day').forEach(cell => {
            const ds = cell.dataset.date;

            cell.classList.remove('range-start', 'range-end', 'in-range', 'is-hover');

            if (selStart && effectiveEnd) {
                const lo = selStart <= effectiveEnd ? selStart : effectiveEnd;
                const hi = selStart <= effectiveEnd ? effectiveEnd : selStart;

                if (ds === lo)                     cell.classList.add('range-start');
                else if (ds === hi)                cell.classList.add('range-end');
                else if (ds > lo && ds < hi)       cell.classList.add('in-range');

            } else if (ds === selStart) {
                cell.classList.add('range-start');
            }

            // ホバー中の単独ハイライト
            if (ds === hoverDate && !selStart) {
                cell.classList.add('is-hover');
            }
        });
    }

    // ── 日付クリックの処理 ────────────────────────────────

    function onDayClick(ds) {
        if (!selStart || !pickingEnd) {
            // 開始日を選択
            selStart  = ds;
            selEnd    = null;
            pickingEnd = true;

        } else {
            // 終了日を選択
            if (ds === selStart) {
                // 同じ日 → 1日だけのタスク
                selEnd = ds;
            } else if (ds < selStart) {
                // 開始より前をクリック → 入れ替え
                selEnd   = selStart;
                selStart = ds;
            } else {
                selEnd = ds;
            }
            pickingEnd = false;

            updateBtn();
            updateRangeClasses();

            // 少し待ってからポップアップを閉じる
            setTimeout(closePopup, 200);
            return;
        }

        updateBtn();
        updateRangeClasses();
    }

    // ── ボタンの表示を更新 ────────────────────────────────

    function updateBtn() {
        if (selStart && selEnd && selStart !== selEnd) {
            btn.textContent = `${fmt(selStart)} 〜 ${fmt(selEnd)}`;
        } else if (selStart) {
            btn.textContent = fmt(selStart);
        } else {
            btn.textContent = '期限を選択';
        }
    }

    // ── ポップアップの開閉 ────────────────────────────────

    function openPopup() {
        popup.classList.remove('hidden');
    }

    function closePopup() {
        popup.classList.add('hidden');
        hoverDate  = null;
        pickingEnd = false;
    }

    // ── クリア ────────────────────────────────────────────

    function clear() {
        selStart   = null;
        selEnd     = null;
        hoverDate  = null;
        pickingEnd = false;
        updateBtn();
        updateRangeClasses();
    }

    // ── イベントリスナー ──────────────────────────────────

    // 日付ボタンをクリック → カレンダーを開閉
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.contains('hidden') ? openPopup() : closePopup();
    });

    // ポップアップ内のクリックは外に伝えない
    popup.addEventListener('click', (e) => e.stopPropagation());

    // ポップアップ外をクリック → 閉じる
    document.addEventListener('click', closePopup);

    // 前の月へ
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        render();
    });

    // 次の月へ
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        render();
    });

    // クリアボタン
    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clear();
    });

    // ── 外部からの公開API ─────────────────────────────────
    // script.js からこれを呼んで日付を取得・リセットする

    window.calendarPicker = {

        // 開始日を返す（1日のみのタスクはnull）
        getStartDate: () => {
            if (selStart && selEnd && selStart !== selEnd) return selStart;
            return null;
        },

        // 終了日（または1日タスクの日付）を返す
        getEndDate: () => selEnd || selStart || null,

        // リセット
        clear,
    };

    // ── 初期化 ────────────────────────────────────────────
    const now = new Date();
    calYear  = now.getFullYear();
    calMonth = now.getMonth();
    render();

})();
