# ♞ Chess Arena 

Trò chơi **Chess Arena** (Cờ Vua) được viết lại hoàn toàn bằng **HTML5 Canvas, CSS3 và Vanilla JavaScript (ES6+)** với giao diện hiện đại phong cách Esports, tích hợp thư viện quản lý luật cờ `chess.js`, thuật toán Trí tuệ nhân tạo (AI Minimax + Alpha-Beta Pruning + Quiescence Search) ngay trên trình duyệt, cùng nhiều tính năng tùy biến linh hoạt và âm thanh sinh động.

![Status](https://img.shields.io/badge/status-active-success.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Chess.js](https://img.shields.io/badge/chess.js-0.10.3-orange.svg)

---

## ✨ Tính năng nổi bật

- **Giao diện hiện đại & Đồng bộ (Modern UI & Glassmorphism)**: Bố cục trực quan với hiệu ứng ánh sáng nền tinh tế, hỗ trợ Canvas siêu nét trên màn hình Retina (DPR) và tương thích hoàn hảo trên cả máy tính lẫn thiết bị di động.
- **Trí tuệ nhân tạo (CPU AI thông minh)**:
  - **3 Cấp độ chơi**: *Dễ* (ưu tiên bắt quân ngẫu nhiên), *Trung bình* (độ sâu tìm kiếm 2 lớp), và *Khó* (độ sâu 3 lớp sử dụng thuật toán cắt tỉa Alpha-Beta và bắt quân tĩnh Quiescence).
  - Tùy chỉnh độ trễ phản hồi của máy tính mượt mà.
- **Tùy biến bàn cờ và quân cờ sâu rộng (Settings Modal)**:
  - **5 bộ màu bàn cờ**: *Xanh thép (Mặc định), Xanh lá, Gỗ cổ điển, Tím, Đêm*.
  - **Tùy chỉnh trực quan**: Bật/tắt toạ độ a-h / 1-8, hiển thị nước đi hợp lệ (chấm xanh/vòng tròn), tô sáng nước đi vừa thực hiện, điều chỉnh kích thước quân cờ và độ dày viền quân Trắng/Đen.
- **Tiện ích trận đấu**:
  - **Đồng hồ bấm giờ**: Đa dạng các mốc thời gian (*3 phút, 5 phút, 10 phút, 15 phút, Không giới hạn*) với hiệu ứng đồng hồ đang chạy trực quan.
  - **Lịch sử nước đi chuẩn SAN**: Tự động ghi lại các nước đi theo chuẩn quốc tế, tự động cuộn theo thời gian thực.
  - **Hoàn tác nước đi (Undo)**: Cho phép lùi lại bước đi khi chơi với máy.
  - **Âm thanh tương tác**: Hiệu ứng âm thanh khi di chuyển quân và ăn quân được tạo trực tiếp bằng Web Audio API không cần tải tệp ngoài.
  - **Tự động phong cấp**: Hỗ trợ phong cấp nhanh thành Hậu hoặc mở bảng chọn quân (Xe, Tượng, Mã, Hậu).

---

## 🛠️ Cấu trúc mã nguồn

```text
├── index.html        # Khung giao diện chính, bảng điều khiển, modal cài đặt và phong cấp
├── style.css         # Tệp định dạng, biến màu CSS, hiệu ứng glassmorphism và responsive
└── script.js         # Logic trò chơi, tích hợp chess.js, thuật toán AI Minimax và quản lý DOM
```

---

## 🚀 Hướng dẫn cài đặt và trải nghiệm

1. Tải toàn bộ mã nguồn gồm 3 tệp: `index.html`, `style.css`, và `script.js` vào cùng một thư mục.
2. Mở tệp `index.html` trực tiếp bằng bất kỳ trình duyệt web hiện đại nào (Chrome, Firefox, Edge, Safari).
3. Hoặc chạy thông qua một máy chủ cục bộ (Live Server trong VS Code) để có trải nghiệm mượt mà nhất.
