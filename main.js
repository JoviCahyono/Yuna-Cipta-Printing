const { app, BrowserWindow, ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Buat atau sambungkan ke database
const db = new sqlite3.Database("./penggajian.db", (err) => {
  if (err) {
    console.error("Error saat menghubungkan database:", err.message);
  } else {
    console.log("Terhubung ke database SQLite.");
  }
});

// Handler untuk membuat jendela utama
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.setResizable(true);

  const { width, height } = mainWindow.getBounds();
  mainWindow.setSize(width * 0.8, height * 0.8);

  // Muat halaman utama
  mainWindow.loadFile("dashboard.html");

  mainWindow.maximize();

  // Buka DevTools jika diperlukan
  // mainWindow.webContents.openDevTools();
}

let loginWindow; // Window login

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, "login.js"), // Pastikan menggunakan login.js untuk login.html
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loginWindow.loadFile("login.html");
}

app.whenReady().then(() => {
  createLoginWindow(); // Membuka window login

  ipcMain.on("login-success", () => {
    if (loginWindow) {
      loginWindow.close(); // Menutup window login hanya jika loginWindow ada
      loginWindow = null; // Menandai bahwa loginWindow telah ditutup
    }
    createMainWindow(); // Membuka window utama setelah login sukses
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); // Memastikan jendela utama terbuka jika tidak ada jendela yang terbuka
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Menutup database saat aplikasi keluar
app.on("before-quit", () => {
  db.close((err) => {
    if (err) {
      console.error("Error saat menutup database:", err.message);
    } else {
      console.log("Database ditutup dengan aman.");
    }
  });
});

// Fungsi untuk mengambil data dari kedua tabel dan mengonversinya ke format JSON
const updateDataJson = () => {
  return new Promise((resolve, reject) => {
    // Mengambil data dari tabel penggajian
    db.all("SELECT * FROM penggajian", (err, penggajianData) => {
      if (err) {
        return reject(err);
      }

      // Mengambil data dari tabel karyawan
      db.all("SELECT * FROM karyawan", (err, karyawanData) => {
        if (err) {
          return reject(err);
        }

        // Gabungkan data ke dalam satu objek JSON
        const data = {
          penggajian: penggajianData,
          karyawan: karyawanData,
        };

        // Simpan data ke file JSON untuk update
        fs.writeFile("./data.json", JSON.stringify(data, null, 2), (err) => {
          if (err) {
            return reject(err);
          }
          console.log("Data JSON berhasil diperbarui.");
        });

        resolve(data); // Kembalikan data dalam format JSON
      });
    });
  });
};

// Menangani event untuk mengambil data JSON
ipcMain.handle("get-data-json", async () => {
  try {
    const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
    return data; // Mengembalikan data JSON ke frontend
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return {};
  }
});

// Update data JSON setiap 1 menit
setInterval(() => {
  updateDataJson(); // Panggil fungsi untuk memperbarui data
}, 1 * 60 * 1000); // 1 menit

// Inisialisasi database: buat tabel jika belum ada
db.serialize(() => {
  // Tabel penggajian
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
        console.log("Tabel penggajian berhasil dibuat atau sudah ada.");
      }
    }
  );

  // Tabel karyawan
  db.run(
    `
    CREATE TABLE IF NOT EXISTS karyawan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      gaji_harian REAL NOT NULL,
      upah_lembur REAL NOT NULL,
      kasbon REAL NOT NULL,
      medical REAL NOT NULL
    )
  `,
    (err) => {
      if (err) {
        console.error("Error saat membuat tabel karyawan:", err.message);
      } else {
        console.log("Tabel karyawan berhasil dibuat atau sudah ada.");
      }
    }
  );
});

// ====================== DASHBOARD ======================

// ====================== HANDLER PENGGAJIAN ======================

// Menangani event 'tambahData' dari renderer process
ipcMain.on("tambahData", (event, data) => {
  const {
    tanggal,
    nama,
    hariKerja,
    gajiPerHari,
    lembur,
    jamLembur,
    upahLembur,
    kasbon,
    kasbonMotor,
    totalGaji,
  } = data;

  const insertQuery = `
    INSERT INTO penggajian (tanggal_gajian, nama_karyawan, hari_kerja, gaji_per_hari, lembur_mingguan, jam_lembur, upah_lembur_per_jam, kasbon, kasbon_motor, gaji)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertQuery,
    [
      tanggal,
      nama,
      hariKerja,
      gajiPerHari,
      lembur,
      jamLembur,
      upahLembur,
      kasbon,
      kasbonMotor,
      totalGaji,
    ],
    function (err) {
      if (err) {
        console.error("Error saat menyimpan data ke database:", err.message);
        event.reply("dataTersimpanGagal", err.message);
      } else {
        console.log("Data penggajian berhasil disimpan ke database.");
        // Kirim kembali data yang baru dimasukkan ke renderer untuk ditampilkan
        const savedData = {
          id: this.lastID,
          ...data,
        };
        event.sender.send("dataTersimpan", savedData);
      }
    }
  );
});

// Menangani event untuk memuat semua data penggajian saat aplikasi dimulai
ipcMain.on("muatData", (event) => {
  const query = "SELECT * FROM penggajian";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error saat memuat data penggajian:", err.message);
      event.reply("muatDataGagal", err.message);
      return;
    }
    // Kirim data yang dimuat ke renderer
    event.sender.send("dataDimuat", rows);
  });
});

// Menangani event 'hapusData' dari renderer process
ipcMain.on("hapusData", (event, rowId) => {
  const deleteQuery = `DELETE FROM penggajian WHERE id = ?`;

  db.run(deleteQuery, [rowId], function (err) {
    if (err) {
      console.error("Error saat menghapus data penggajian:", err.message);
      event.reply("hapusDataGagal", err.message);
    } else {
      console.log("Data penggajian berhasil dihapus dari database.");
      event.reply("dataDihapus", rowId);
    }
  });
});

// ====================== HANDLER KARYAWAN ======================

// Handler untuk menambah karyawan
ipcMain.on("addEmployee", (event, employeeData) => {
  const { nama, gajiHarian, upahLembur, kasbon, medical } = employeeData;
  const insertQuery = `
    INSERT INTO karyawan (nama, gaji_harian, upah_lembur, kasbon, medical)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    insertQuery,
    [nama, gajiHarian, upahLembur, kasbon, medical],
    function (err) {
      if (err) {
        console.error("Error saat menyimpan data karyawan:", err.message);
        event.reply("employeeAddedGagal", err.message);
      } else {
        // Kirim kembali data dengan ID yang baru dibuat
        const newEmployee = {
          id: this.lastID,
          ...employeeData,
        };
        console.log("Data karyawan berhasil disimpan ke database.");
        event.reply("employeeAdded", newEmployee);
      }
    }
  );
});

// Handler untuk memuat data karyawan
ipcMain.on("loadEmployees", (event) => {
  const query = "SELECT * FROM karyawan ORDER BY nama";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error saat memuat data karyawan:", err.message);
      event.reply("employeesLoadedGagal", err.message);
      return;
    }
    event.reply("employeesLoaded", rows);
  });
});

// Handler untuk menghapus karyawan
ipcMain.on("hapusKaryawan", (event, id) => {
  const query = "DELETE FROM karyawan WHERE id = ?";
  db.run(query, [id], function (err) {
    if (err) {
      console.error("Error saat menghapus karyawan:", err.message);
      event.reply("hapusKaryawanGagal", err.message);
      return;
    }
    console.log(`Karyawan dengan ID ${id} berhasil dihapus.`);
    event.reply("employeeDeleted", id);
  });
});

// Handler untuk mengupdate karyawan (opsional)
ipcMain.on("updateEmployee", (event, employee) => {
  const { id, nama, gajiHarian, upahLembur, kasbon, medical } = employee;
  const query = `
    UPDATE karyawan 
    SET nama = ?, gaji_harian = ?, upah_lembur = ?, kasbon = ?, medical = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [nama, gajiHarian, upahLembur, kasbon, medical, id],
    function (err) {
      if (err) {
        console.error("Error saat mengupdate karyawan:", err.message);
        event.reply("updateEmployeeGagal", err.message);
        return;
      }
      console.log(`Karyawan dengan ID ${id} berhasil diupdate.`);
      event.reply("employeeUpdated", employee);
    }
  );
});

// ========================== kasbon =================================
