# Personal Progress Dashboard

## สิ่งที่มี
- Dashboard
- Daily Check-in
- Goals
- Project Tracker
- บันทึกข้อมูลในเครื่องทันที
- รองรับ Google Sheets ผ่าน Google Apps Script
- อัปเดตหน้าเว็บทันทีหลังบันทึก
- สรุป 7 วัน, streak, ชั่วโมง Coding, เวลาออกกำลังกาย และน้ำหนักล่าสุด

## เชื่อม Google Sheets
1. สร้าง Google Sheet
2. Extensions > Apps Script
3. เปิดไฟล์ `google-apps-script.gs` แล้วคัดลอกโค้ดไปวาง
4. Deploy > New deployment > Web app
5. Execute as: Me
6. Who has access: Anyone
7. Copy Web App URL
8. เปิด `app.js`
9. เปลี่ยน:
   APPS_SCRIPT_URL:""
   เป็น URL ที่ได้
10. เปิด `index.html`

หมายเหตุ: เวอร์ชันนี้ใช้ Google Sheets เป็นฐานข้อมูลสำหรับ Daily Check-in และเก็บสำเนาใน browser ด้วย LocalStorage เพื่อให้ใช้งานต่อได้แม้การเชื่อมต่อ Sheets มีปัญหา

## โครงสร้าง
- index.html
- style.css
- app.js
- google-apps-script.gs
