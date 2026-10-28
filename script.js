/* ChessArena - bản tối ưu (chess.js 0.10.x - 0.13.x: in_check, game_over, in_checkmate...) */
// Bảng màu đồng bộ với style.css (nền xanh đêm + điểm nhấn xanh ngọc #4ee0b0)
const COL = {
    bg: '#0a1020', panel: '#131d31', panel_dark: '#0d1627',
    text: '#f1f5fb', muted: '#8a9cb6', accent: '#4ee0b0',
    light: '#dce6ec',            // ô sáng: xám xanh nhạt
    dark: '#5b8a9a',             // ô tối: xanh thép
    last_light: '#b9ecd6',       // nước vừa đi (ô sáng): ngọc nhạt
    last_dark: '#58bd98',        // nước vừa đi (ô tối): ngọc đậm
    selection: '#ffd166',        // ô đang chọn
    check: '#ff6b6b',            // vua bị chiếu
    legal: 'rgba(14, 96, 76, .72)', // chấm/vòng nước đi hợp lệ
    button: '#1c2b45', button2: '#27a283',
    pieceWhite: '#ffffff', pieceWhiteShade: '#1b2a3d',
    pieceBlack: '#0f1828', pieceBlackShade: '#d3e4ee'
};

// Các bảng màu bàn cờ để chọn trong Cài đặt
const THEMES = {
    steel:    { light: '#dce6ec', dark: '#5b8a9a', last_light: '#b9ecd6', last_dark: '#58bd98' },
    green:    { light: '#eeeed2', dark: '#769656', last_light: '#f5f682', last_dark: '#bbcb44' },
    wood:     { light: '#f0d9b5', dark: '#b58863', last_light: '#f4e58a', last_dark: '#d9b44a' },
    purple:   { light: '#e8e4f3', dark: '#8b78b8', last_light: '#f1e39a', last_dark: '#b8a45a' },
    midnight: { light: '#9fb0c8', dark: '#3a4c6b', last_light: '#8fe0c4', last_dark: '#3f9b82' }
};

const STORAGE_KEY = 'chessArena.settings.v1';
const DEFAULTS = {
    theme: 'steel',
    pieceSize: 48,        // cỡ quân (px)
    whiteStroke: 7,       // độ dày viền quân Trắng
    blackStroke: 3.5,     // độ dày viền quân Đen
    showLegal: true,      // chấm nước đi hợp lệ
    showLast: true,       // tô sáng nước vừa đi
    showCoords: true,     // toạ độ a-h / 1-8
    autoQueen: false,     // tự phong Hậu
    cpuDelay: 250,        // ms CPU chờ trước khi đi
    volume: 0.6,
    sound: true,
    level: 'Trung bình',
    mode: '10 phút'
};

const SYMBOLS = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
};

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const MATE = 100000;

// Bảng điểm vị trí (nhìn từ phía Trắng, hàng 8 ở trên cùng)
const PST = {
    p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
        0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
        -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
        -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
        -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
        0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
        20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
};

const FILES = 'abcdefgh';

class ChessArena {
    constructor() {
        this.CELL = 70;
        this.PAD = 24;
        this.SIZE = this.PAD * 2 + this.CELL * 8;

        this.settings = this.loadSettings();
        this.board = new Chess();
        this.humanColor = 'w';      // online: gán theo màu server cấp
        this.net = null;            // online: đối tượng mạng (xem gợi ý), null = chơi với CPU

        this.selected = null;
        this.dragOrigin = null;
        this.dragging = false;
        this.pointer = null;
        this.lastMove = null;
        this.waiting = false;       // CPU đang nghĩ
        this.promoting = false;     // đang mở hộp thoại phong cấp
        this.promotionResolve = null;
        this.afterCpu = null;
        this.gameId = 0;
        this.ended = false;
        this.flip = false;
        this.audioCtx = null;

        this.clockStart = performance.now();
        this.remaining = { w: 600, b: 600 };

        // cache DOM
        const $ = (id) => document.getElementById(id);
        this.el = {
            status: $('statusVar'), history: $('historyText'),
            humanClock: $('humanClock'), cpuClock: $('cpuClock'),
            level: $('levelSelect'), mode: $('modeSelect'),
            sound: $('soundCheck'), promo: $('promotionModal')
        };

        this.canvas = $('chessCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.initListeners();
        this.initSettings();
        this.newGame();
        this.tickInterval = setInterval(() => this.tick(), 250);
    }

    /* ---------- Khởi tạo ---------- */
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.SIZE * dpr;
        this.canvas.height = this.SIZE * dpr;
        if (!this.canvas.style.width) {
            this.canvas.style.width = this.SIZE + 'px';
            this.canvas.style.height = this.SIZE + 'px';
        }
        this.canvas.style.touchAction = 'none';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ---------- Cài đặt ---------- */
    loadSettings() {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { /* bỏ qua */ }
        const s = { ...DEFAULTS };
        for (const k in DEFAULTS) {
            if (k in saved && typeof saved[k] === typeof DEFAULTS[k]) s[k] = saved[k];
        }
        return s;
    }

    saveSettings() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch (_) { /* bỏ qua */ }
    }

    applyTheme() {
        Object.assign(COL, THEMES[this.settings.theme] || THEMES.steel);
    }

    formatSetting(key, v) {
        if (key === 'pieceSize') return `${v}px`;
        if (key === 'whiteStroke' || key === 'blackStroke') return Number(v).toFixed(1);
        if (key === 'cpuDelay') return `${v} ms`;
        if (key === 'volume') return `${Math.round(v * 100)}%`;
        return String(v);
    }

    initSettings() {
        const modal = document.getElementById('settingsModal');
        const open = () => modal.classList.remove('hidden');
        const close = () => modal.classList.add('hidden');
        document.getElementById('settingsBtn').addEventListener('click', open);
        document.getElementById('settingsClose').addEventListener('click', close);
        modal.addEventListener('pointerdown', (e) => { if (e.target === modal) close(); });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });

        const inputs = document.querySelectorAll('[data-setting]');
        const showValue = (key) => {
            const out = document.querySelector(`output[data-for="${key}"]`);
            if (out) out.textContent = this.formatSetting(key, this.settings[key]);
        };
        const sync = () => inputs.forEach((el) => {
            const key = el.dataset.setting;
            if (el.type === 'checkbox') el.checked = !!this.settings[key];
            else {
                el.value = this.settings[key];
                if (el.value === '') el.value = DEFAULTS[key]; // giá trị cũ không còn trong danh sách
            }
            showValue(key);
        });

        inputs.forEach((el) => {
            const key = el.dataset.setting;
            el.addEventListener('input', () => {
                this.settings[key] =
                    el.type === 'checkbox' ? el.checked :
                    el.type === 'range' ? parseFloat(el.value) : el.value;
                showValue(key);
                this.saveSettings();
                this.applyTheme();
                this.draw();
            });
        });

        document.getElementById('settingsReset').addEventListener('click', () => {
            this.settings = { ...DEFAULTS };
            this.saveSettings();
            this.applyTheme();
            sync();
            this.newGame();
        });

        sync();
        this.applyTheme();
    }

    initListeners() {
        // Pointer Events: chuột + cảm ứng
        this.canvas.addEventListener('pointerdown', (e) => this.press(e));
        this.canvas.addEventListener('pointermove', (e) => this.motion(e));
        window.addEventListener('pointerup', (e) => this.release(e));
        window.addEventListener('pointercancel', () => this.cancelDrag());

        const $ = (id) => document.getElementById(id);
        this.el.level.addEventListener('change', () => this.newGame());
        this.el.mode.addEventListener('change', () => this.newGame());
        $('undoBtn').addEventListener('click', () => this.undo());
        $('newGameBtn').addEventListener('click', () => this.newGame());
        $('rotateBtn').addEventListener('click', () => this.rotate());

        document.querySelectorAll('.promo-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.resolvePromotion(e.currentTarget.dataset.piece));
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.promoting) this.resolvePromotion(null);
        });
    }

    /* ---------- Đồng hồ ---------- */
    getSeconds() {
        const mode = this.el.mode.value;
        if (mode === 'Không giới hạn') return null;
        const n = parseInt(mode, 10);
        return Number.isFinite(n) ? n * 60 : null;
    }

    fmt(value) {
        if (value === null) return '∞';
        value = Math.max(0, Math.ceil(value));
        return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    }

    syncTime() {
        const now = performance.now();
        const elapsed = Math.max(0, (now - this.clockStart) / 1000);
        this.clockStart = now;
        if (this.getSeconds() === null || this.ended) return;
        const turn = this.board.turn();
        this.remaining[turn] = Math.max(0, this.remaining[turn] - elapsed);
        if (this.remaining[turn] <= 0) {
            this.finish(turn === this.humanColor ? 'Bạn hết giờ — CPU thắng!' : 'CPU hết giờ — Bạn thắng!');
        }
    }

    tick() {
        this.syncTime();
        const unlimited = this.getSeconds() === null;
        const turn = this.board.turn();
        const hc = this.humanColor, cc = hc === 'w' ? 'b' : 'w';
        this.el.humanClock.textContent = this.fmt(unlimited ? null : this.remaining[hc]);
        this.el.cpuClock.textContent = this.fmt(unlimited ? null : this.remaining[cc]);
        this.el.humanClock.className = 'clock-display' + (turn === hc && !this.ended ? ' active-clock' : '');
        this.el.cpuClock.className = 'clock-display' + (turn === cc && !this.ended ? ' active-clock' : '');
    }

    /* ---------- Toạ độ ---------- */
    // ô -> [cột, hàng] trên màn hình
    getSquareCoords(sq) {
        const file = sq.charCodeAt(0) - 97;
        const rank = parseInt(sq[1], 10) - 1;
        return this.flip ? [7 - file, rank] : [file, 7 - rank];
    }

    // pixel logic -> ô cờ (đã bù scale CSS)
    squareAt(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (this.SIZE / rect.width);
        const y = (clientY - rect.top) * (this.SIZE / rect.height);
        const c = Math.floor((x - this.PAD) / this.CELL);
        const r = Math.floor((y - this.PAD) / this.CELL);
        if (c < 0 || c > 7 || r < 0 || r > 7) return null;
        const file = this.flip ? 7 - c : c;
        const rank = this.flip ? r : 7 - r;
        return FILES[file] + (rank + 1);
    }

    pointerXY(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.SIZE / rect.width),
            y: (e.clientY - rect.top) * (this.SIZE / rect.height)
        };
    }

    /* ---------- Vẽ ---------- */
    draw() {
        const cv = this.ctx;
        const p = this.PAD, s = this.CELL;
        cv.clearRect(0, 0, this.SIZE, this.SIZE);

        // tính 1 lần thay vì 64 lần
        const kingInCheck = this.board.in_check() ? this.findKingSquare(this.board.turn()) : null;
        const last = this.lastMove;

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const sq = FILES[file] + (rank + 1);
                const [cx, cy] = this.getSquareCoords(sq);
                const x = p + cx * s, y = p + cy * s;

                const isLight = (file + rank) % 2 !== 0;
                let color = isLight ? COL.light : COL.dark;
                if (this.settings.showLast && last && (sq === last.from || sq === last.to)) color = isLight ? COL.last_light : COL.last_dark;
                if (sq === this.selected) color = COL.selection;
                if (sq === kingInCheck) color = COL.check;

                cv.fillStyle = color;
                cv.fillRect(x, y, s, s);

                const piece = this.board.get(sq);
                if (piece && !(this.dragging && sq === this.dragOrigin)) {
                    this.paintPiece(x + s / 2, y + s / 2, piece);
                }
            }
        }

        // gợi ý nước đi hợp lệ
        if (this.settings.showLegal && this.selected !== null && this.canAct()) {
            const targets = new Set(this.board.moves({ square: this.selected, verbose: true }).map((m) => m.to));
            for (const sq of targets) {
                const [cx, cy] = this.getSquareCoords(sq);
                const px = p + (cx + 0.5) * s, py = p + (cy + 0.5) * s;
                cv.beginPath();
                if (this.board.get(sq)) {
                    cv.strokeStyle = COL.legal;
                    cv.lineWidth = 4;
                    cv.arc(px, py, 27, 0, 2 * Math.PI);
                    cv.stroke();
                } else {
                    cv.fillStyle = COL.legal;
                    cv.arc(px, py, 7, 0, 2 * Math.PI);
                    cv.fill();
                }
            }
        }

        // quân đang kéo
        if (this.dragging && this.dragOrigin !== null && this.pointer) {
            const piece = this.board.get(this.dragOrigin);
            if (piece) this.paintPiece(this.pointer.x, this.pointer.y, piece);
        }

        // toạ độ
        cv.fillStyle = COL.muted;
        cv.font = 'bold 10px "Segoe UI", sans-serif';
        cv.textAlign = 'left';
        cv.textBaseline = 'alphabetic';
        for (let i = 0; this.settings.showCoords && i < 8; i++) {
            const f = this.flip ? FILES[7 - i] : FILES[i];
            const rank = this.flip ? i + 1 : 8 - i;
            cv.fillText(f, p + (i + 0.5) * s - 4, p + 8 * s + 15);
            cv.fillText(String(rank), p - 16, p + (i + 0.5) * s + 4);
        }
    }

    paintPiece(x, y, piece) {
        const white = piece.color === 'w';
        // Dùng bộ ký tự đặc (filled) cho cả hai bên: quân Trắng không còn bị "rỗng ruột" mảnh khảnh.
        // \uFE0E ép hiển thị dạng chữ, tránh bị thay bằng emoji trên iOS/Android.
        const glyph = SYMBOLS[piece.type] + '\uFE0E';
        const cv = this.ctx;
        cv.font = `${this.settings.pieceSize}px "Segoe UI Symbol", "Noto Sans Symbols 2", "Apple Symbols", sans-serif`;
        cv.textAlign = 'center';
        cv.textBaseline = 'middle';
        cv.lineJoin = 'round';

        // bóng đổ
        cv.fillStyle = 'rgba(0, 0, 0, .28)';
        cv.fillText(glyph, x + 1.5, y + 3);

        // viền dày (stroke nằm giữa mép nên phần ngoài ~2px lộ ra)
        cv.lineWidth = white ? this.settings.whiteStroke : this.settings.blackStroke;
        cv.strokeStyle = white ? COL.pieceWhiteShade : COL.pieceBlackShade;
        cv.strokeText(glyph, x, y);

        // thân quân
        cv.fillStyle = white ? COL.pieceWhite : COL.pieceBlack;
        cv.fillText(glyph, x, y);
    }

    findKingSquare(color) {
        const b = this.board.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (p && p.type === 'k' && p.color === color) return FILES[c] + (8 - r);
            }
        }
        return null;
    }

    /* ---------- Nhập liệu ---------- */
    canAct() {
        return !this.waiting && !this.ended && !this.promoting && this.board.turn() === this.humanColor;
    }

    async press(e) {
        if (!this.canAct()) return;
        const sq = this.squareAt(e.clientX, e.clientY);
        if (!sq) return;

        if (this.selected !== null && sq !== this.selected) {
            if (await this.tryMove(this.selected, sq)) return; // phải await!
        }
        const piece = this.board.get(sq);
        if (piece && piece.color === this.humanColor) {
            this.selected = sq;
            this.dragOrigin = sq;
            this.pointer = this.pointerXY(e);
        } else {
            this.selected = null;
            this.dragOrigin = null;
        }
        this.dragging = false;
        this.draw();
    }

    motion(e) {
        if (this.dragOrigin === null || !this.canAct()) return;
        this.pointer = this.pointerXY(e);
        this.dragging = true;
        this.draw();
    }

    cancelDrag() {
        this.dragging = false;
        this.dragOrigin = null;
        this.pointer = null;
        this.draw();
    }

    async release(e) {
        if (!this.dragging) {
            this.dragOrigin = null;
            return;
        }
        const src = this.dragOrigin;
        const dst = this.squareAt(e.clientX, e.clientY);
        this.dragging = false;
        this.dragOrigin = null;
        this.pointer = null;
        this.draw(); // trả quân về chỗ cũ trước, tránh "ma" nếu nước đi sai
        if (dst && dst !== src) await this.tryMove(src, dst);
    }

    /* ---------- Phong cấp ---------- */
    pickPromotion() {
        return new Promise((resolve) => {
            this.promoting = true;
            this.promotionResolve = resolve;
            this.el.promo.classList.remove('hidden');
        });
    }

    resolvePromotion(piece) {
        this.el.promo.classList.add('hidden');
        this.promoting = false;
        const resolve = this.promotionResolve;
        this.promotionResolve = null;
        if (resolve) resolve(piece);
    }

    /* ---------- Thực hiện nước đi ---------- */
    async tryMove(src, dst) {
        if (!this.canAct()) return false;
        // kiểm tra hợp lệ TRƯỚC khi hỏi phong cấp
        const candidates = this.board.moves({ square: src, verbose: true }).filter((m) => m.to === dst);
        if (candidates.length === 0) return false;

        let promotion;
        if (candidates[0].promotion && this.settings.autoQueen) {
            promotion = 'q';
        } else if (candidates[0].promotion) {
            const session = this.gameId;
            promotion = await this.pickPromotion();
            if (!promotion || session !== this.gameId) return false;
        }

        const result = this.applyMove({ from: src, to: dst, promotion });
        if (!result) return false;

        this.selected = null;
        this.draw();

        if (this.net) this.net.sendMove(result);          // online
        else if (!this.ended) this.scheduleCpu();          // offline
        return true;
    }

    // Nước đi từ đối thủ online (server đã xác thực)
    applyRemoteMove(move) {
        const result = this.applyMove(move);
        this.draw();
        return !!result;
    }

    // Điểm duy nhất thay đổi bàn cờ -> đảm bảo trừ giờ đúng người
    applyMove(moveObj) {
        this.syncTime();                 // trừ giờ của người VỪA đi, trước khi đổi lượt
        if (this.ended) return null;
        const move = this.board.move(moveObj);
        if (!move) return null;

        this.lastMove = { from: move.from, to: move.to };
        this.clockStart = performance.now();
        this.beep(move.captured !== undefined);
        this.showHistory();

        if (this.board.game_over()) {
            this.finish(this.outcomeText());
        } else if (this.board.in_check()) {
            this.setStatus('Chiếu! ' + (this.board.turn() === this.humanColor ? 'Bạn phải đỡ chiếu.' : 'Đối thủ bị chiếu.'));
        } else {
            this.setStatus(this.board.turn() === this.humanColor ? 'Đến lượt bạn' : 'Đến lượt đối thủ');
        }
        return move;
    }

    setStatus(text) {
        this.el.status.textContent = text;
    }

    beep(capture = false) {
        if (!this.el.sound.checked || this.settings.volume <= 0) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!this.audioCtx) this.audioCtx = new AC();   // tái sử dụng, tránh rò rỉ
            const ctx = this.audioCtx;
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = capture ? 600 : 400;
            gain.gain.setValueAtTime(0.3 * this.settings.volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (_) { /* AudioContext bị chặn */ }
    }

    /* ---------- AI (negamax + alpha-beta + quiescence) ---------- */
    // Điểm theo góc nhìn của bên đang đi
    evaluate() {
        const b = this.board.board();
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (!p) continue;
                const white = p.color === 'w';
                const idx = (white ? r : 7 - r) * 8 + c;
                const v = VALUES[p.type] + PST[p.type][idx];
                score += white ? v : -v;
            }
        }
        return this.board.turn() === 'w' ? score : -score;
    }

    orderMoves(moves) {
        const score = (m) =>
            (m.captured ? 10 * VALUES[m.captured] - VALUES[m.piece] : 0) + (m.promotion ? 800 : 0);
        return moves.sort((a, b) => score(b) - score(a));
    }

    quiesce(alpha, beta, qd) {
        const stand = this.evaluate();
        if (qd <= 0 || stand >= beta) return stand >= beta ? beta : stand;
        if (stand > alpha) alpha = stand;
        const caps = this.orderMoves(this.board.moves({ verbose: true }).filter((m) => m.captured || m.promotion));
        for (const m of caps) {
            this.board.move(m);
            const score = -this.quiesce(-beta, -alpha, qd - 1);
            this.board.undo();
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }

    search(depth, alpha, beta, ply) {
        if (this.board.in_draw() || this.board.in_stalemate()) return 0;
        if (depth <= 0) return this.quiesce(alpha, beta, 4);

        const moves = this.board.moves({ verbose: true });
        if (moves.length === 0) return this.board.in_check() ? -MATE + ply : 0; // chiếu hết nhanh điểm cao hơn

        for (const m of this.orderMoves(moves)) {
            this.board.move(m);
            const score = -this.search(depth - 1, -beta, -alpha, ply + 1);
            this.board.undo();
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }

    cpuChoice() {
        const moves = this.board.moves({ verbose: true });
        if (moves.length === 0) return null;
        const level = this.el.level.value;
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        if (level === 'Dễ') {
            const caps = moves.filter((m) => m.captured);
            return caps.length && Math.random() < 0.7 ? rand(caps) : rand(moves);
        }

        const depth = level === 'Trung bình' ? 2 : 3;
        let best = -Infinity, choices = [];
        for (const m of this.orderMoves(moves)) {
            this.board.move(m);
            const score = -this.search(depth - 1, -Infinity, Infinity, 1);
            this.board.undo();
            if (score > best) { best = score; choices = [m]; }
            else if (score === best) choices.push(m);
        }
        return rand(choices);
    }

    scheduleCpu() {
        this.waiting = true;
        this.setStatus('CPU đang tính toán…');
        const session = this.gameId;
        this.afterCpu = setTimeout(() => this.cpuTurn(session), this.settings.cpuDelay);
    }

    cpuTurn(session) {
        this.afterCpu = null;
        if (session !== this.gameId || this.ended || this.board.turn() === this.humanColor) {
            this.waiting = false;
            return;
        }
        const move = this.cpuChoice();
        if (session === this.gameId && move) this.applyMove(move);
        this.waiting = false;
        this.draw();
    }

    /* ---------- Lịch sử & kết quả ---------- */
    showHistory() {
        const h = this.board.history();   // nguồn dữ liệu duy nhất -> không còn lệch với sanMoves
        const rows = [];
        for (let n = 0; n < h.length; n += 2) {
            rows.push(`${String(n / 2 + 1).padStart(3, ' ')}.  ${h[n].padEnd(9, ' ')} ${h[n + 1] || ''}`);
        }
        this.el.history.value = rows.join('\n');
        this.el.history.scrollTop = this.el.history.scrollHeight;
    }

    outcomeText() {
        const b = this.board;
        if (b.in_checkmate()) {
            return b.turn() === this.humanColor ? 'CPU thắng — chiếu hết!' : 'Bạn thắng — chiếu hết!';
        }
        if (b.in_stalemate()) return 'Hòa — hết nước đi (pat).';
        if (b.in_threefold_repetition()) return 'Hòa — lặp lại thế cờ 3 lần.';
        if (b.insufficient_material()) return 'Hòa — không đủ quân chiếu hết.';
        return 'Hòa — luật 50 nước.';
    }

    finish(description) {
        if (this.ended) return;
        this.ended = true;
        this.waiting = false;
        this.setStatus(description);
        this.draw();
    }

    /* ---------- Điều khiển ván ---------- */
    cancelCpu() {
        this.gameId++;
        if (this.afterCpu !== null) {
            clearTimeout(this.afterCpu);
            this.afterCpu = null;
        }
        this.waiting = false;
        if (this.promoting) this.resolvePromotion(null);
    }

    undo() {
        if (this.net) return; // online: không hoàn tác
        this.syncTime();
        this.cancelCpu();
        if (this.board.history().length === 0) {
            this.setStatus('Chưa có nước đi để hoàn tác.');
            return;
        }
        this.board.undo();
        if (this.board.turn() !== this.humanColor && this.board.history().length > 0) this.board.undo();

        this.ended = false;
        const h = this.board.history({ verbose: true });
        const lm = h[h.length - 1];
        this.lastMove = lm ? { from: lm.from, to: lm.to } : null;
        this.selected = this.dragOrigin = null;
        this.dragging = false;
        this.clockStart = performance.now();
        this.setStatus('Đã hoàn tác — đến lượt bạn');
        this.showHistory();
        this.draw();
    }

    newGame() {
        this.cancelCpu();
        this.board.reset();
        this.selected = this.dragOrigin = this.lastMove = null;
        this.dragging = false;
        this.pointer = null;
        this.ended = false;
        const secs = this.getSeconds();
        const t = secs === null ? 600 : secs;
        this.remaining = { w: t, b: t };
        this.clockStart = performance.now();
        this.setStatus('Ván mới — đến lượt bạn (Trắng)');
        const lbl = document.getElementById('botLevelLabel');
        if (lbl) lbl.textContent = this.el.level.value;
        this.showHistory();
        this.draw();
        this.tick();
    }

    rotate() {
        this.flip = !this.flip;
        this.selected = null;
        this.draw();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.arena = new ChessArena();
});
