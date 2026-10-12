# ScanPro - Professional Document Scanner & PDF Studio

Ứng dụng quét tài liệu chạy hoàn toàn trên trình duyệt (PWA), không cần server, không cần build.

## Chạy thử trên máy tính
Camera và service worker cần HTTPS hoặc localhost, không mở trực tiếp bằng file://
```
cd scanpro-pwa
python3 -m http.server 8080
```
Mở http://localhost:8080

## Triển khai bằng GitHub Pages
1. Đẩy toàn bộ nội dung thư mục này lên một repo (index.html nằm ở thư mục gốc).
2. Settings > Pages > Deploy from a branch > main > / (root).
3. Mở https://<tài-khoản>.github.io/<tên-repo>/ trên điện thoại, chọn "Thêm vào màn hình chính".

## Cấu trúc
- index.html, manifest.webmanifest, sw.js, icons/: vỏ PWA
- css/style.css: giao diện sáng/tối
- js/util.js: tiện ích, icon, toast, bỏ dấu tiếng Việt
- js/storage.js: IndexedDB
- js/scanner-engine.js: phát hiện vùng giấy, chỉnh phối cảnh, bộ lọc, kiểm tra chất lượng
- js/pdf.js: tạo PDF (có lớp chữ OCR vô hình)
- js/ocr.js: OCR tiếng Việt + Anh (Tesseract.js 5.1.1), xem văn bản
- js/documents.js, home.js, camera.js, review.js, export.js, crop.js, viewer.js: giao diện
- js/main.js: khởi động, đăng ký service worker, nút cài đặt

## Về OCR
- Thư viện và mô hình tiếng Việt được tải từ CDN (jsDelivr, projectnaptha) vào lần dùng OCR đầu tiên, sau đó được cache. Chỉ tải mô hình, không gửi tài liệu đi đâu.
- Độ chính xác phụ thuộc chất lượng ảnh; luôn kiểm tra lại số liệu và dấu.

## Chưa có (đang hoàn thiện)
Nhập PDF, Công cụ PDF (gộp/tách/nén/watermark/chữ ký/redact), thư mục, chế độ CCCD/Sách, nhận dạng văn bản hành chính, phân tích AI.
