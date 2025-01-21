const sqlite3 = require("sqlite3").verbose();

// Buat atau sambungkan ke database
const db = new sqlite3.Database("./penggajian.db", (err) => {
  if (err) {
    console.error("Error saat menghubungkan database:", err.message);
  } else {
    console.log("Terhubung ke database SQLite.");
  }
});

  // Buat tabel penggajian jika belum ada
  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS penggajian (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tanggal_gajian DATE,
        nama_karyawan TEXT,
        hari_kerja INTEGER,
        gaji_per_hari REAL,
        lembur_mingguan TEXT,
        jam_lembur INTEGER,
        upah_lembur_per_jam REAL,
        kasbon REAL,
        kasbon_motor REAL,
        gaji REAL
      )
    `,
      (err) => {
        if (err) {
          console.error("Error saat membuat tabel penggajian:", err.message);
        } else {
          console.log("Tabel penggajian berhasil dibuat.");
        }
      }
    );

    // Buat tabel karyawan jika belum ada
    db.run(
      `
      CREATE TABLE IF NOT EXISTS karyawan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT,
        gaji_harian REAL,
        upah_lembur REAL,
        kasbon REAL,
        medical REAL
      )
    `,
      (err) => {
        if (err) {
          console.error("Error saat membuat tabel karyawan:", err.message);
        } else {
          console.log("Tabel karyawan berhasil dibuat.");
        }
      }
    );
  });

