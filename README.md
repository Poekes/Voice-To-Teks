# Voice to Text (Suara ke Teks)

Aplikasi web sederhana untuk mengubah suara menjadi teks (transkripsi) secara otomatis dan *real-time* menggunakan **Web Speech API** bawaan dari browser, dibangun murni menggunakan HTML, CSS (Vanilla), dan JavaScript (Vanilla).

## Daftar Fitur

Aplikasi ini dilengkapi dengan berbagai fungsionalitas cerdas dan antarmuka premium:

| Fitur | Deskripsi |
| --- | --- |
| **Real-time Transcription** | Menerjemahkan suara Anda ke teks secara langsung tanpa jeda. |
| **Continuous Listening** | Terus mendengarkan dan menggabungkan teks tanpa menimpa teks sebelumnya. |
| **Salin Teks** | Menyalin seluruh teks hasil transkripsi langsung ke *clipboard* pengguna. |
| **Hapus Teks** | Menghapus dan mengosongkan seluruh riwayat teks dengan satu klik. |
| **Hapus Kata Terakhir** | Menghapus kata terakhir yang baru saja diucapkan dengan cepat (Undo). |
| **Klik Kata & Modal Interaktif** | Mengklik salah satu kata hasil transkripsi akan memunculkan dialog Modal. |
| **Edit Kata (Suara / Teks)** | Anda dapat mengedit kata terpilih dengan menyebutkannya ulang lewat mikrofon (opsi di dalam Modal) atau mengetiknya secara manual. |
| **Auto-Pause Recognition** | Otomatis menjeda perekaman utama saat Anda membuka modal agar tidak bertabrakan dengan rekaman pengeditan. |
| **Auto-Scroll** | Teks akan otomatis bergulir (scroll) ke bawah jika hasil transkripsi sudah memenuhi layar. |

## Persyaratan Sistem
Karena aplikasi ini memanfaatkan **Web Speech API**, sangat disarankan untuk menjalankannya melalui:
- **Browser yang didukung:** Google Chrome, Microsoft Edge, atau browser berbasis Chromium lainnya.
- **Server Lokal (Localhost):** Browser modern mengharuskan web diakses melalui HTTP/HTTPS agar fitur mikrofon berjalan optimal (tidak bisa sekadar mengklik file lewat skema `file://`).

## Cara Menjalankan secara Lokal

1. Buka terminal (Command Prompt/Bash).
2. Arahkan direktori (cd) ke dalam folder repositori ini.
3. Jalankan *local server*. Jika Anda menggunakan **Python 3**, Anda bisa mengetikkan perintah berikut:
   ```bash
   python3 -m http.server 8000
   ```
4. Buka browser web (disarankan Chrome) lalu navigasikan ke:
   ```text
   http://localhost:8000
   ```
5. Saat muncul pop-up izin browser, berikan izin/akses (*Allow*) kepada aplikasi untuk menggunakan Mikrofon Anda.
6. Klik tombol **"Mulai Bicara"** dan mulailah bersuara!
