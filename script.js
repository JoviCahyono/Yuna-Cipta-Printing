function searchTable() {
  // Ambil nilai dari input pencarian
  var input = document.getElementById("searchInput");
  var filter = input.value.toLowerCase(); // Konversi menjadi huruf kecil untuk pencarian case-insensitive
  var table = document.querySelector("table");
  var rows = table.getElementsByTagName("tr"); // Ambil semua baris dalam tabel

  // Loop melalui semua baris dan sembunyikan yang tidak sesuai dengan pencarian
  for (var i = 1; i < rows.length; i++) {
    // Mulai dari 1 untuk melewati header tabel
    var cells = rows[i].getElementsByTagName("td");
    var matchFound = false;

    // Loop melalui setiap kolom di baris
    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j];
      if (cell) {
        if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
          matchFound = true; // Jika ditemukan kecocokan, tandai baris ini
          break;
        }
      }
    }

    // Tampilkan atau sembunyikan baris berdasarkan kecocokan
    if (matchFound) {
      rows[i].style.display = ""; // Tampilkan baris jika ada kecocokan
    } else {
      rows[i].style.display = "none"; // Sembunyikan baris jika tidak ada kecocokan
    }
  }
}

function sortByName(direction) {
  const table = document.querySelector("table");
  const rows = Array.from(table.rows).slice(1); // Ambil semua baris kecuali header

  rows.sort((rowA, rowB) => {
    const nameA = rowA.cells[1].textContent.trim(); // Nama Karyawan berada di kolom 1
    const nameB = rowB.cells[1].textContent.trim();

    // Urutkan berdasarkan nama
    let comparison = nameA.localeCompare(nameB);

    // Tentukan urutan (ascending atau descending)
    return direction === "asc" ? comparison : -comparison;
  });

  // Tambahkan baris yang sudah diurutkan ke dalam tabel
  rows.forEach((row) => table.appendChild(row));
}

// Mengaktifkan form upload ketika tombol Import Data ditekan
document.getElementById("importDataBtn").addEventListener("click", function () {
  document.getElementById("fileInput").click();
});

// Mengambil file yang di-upload dan memprosesnya
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const rows = content.split("\n");

        // Parse CSV dan masukkan ke dalam tabel
        const tableBody = document.querySelector("table tbody");
        rows.forEach((row) => {
          const cols = row.split(",");
          if (cols.length > 1) {
            // Pastikan baris tidak kosong
            const newRow = document.createElement("tr");

            // Tambahkan setiap kolom ke dalam baris
            cols.forEach((col) => {
              const cell = document.createElement("td");
              cell.textContent = col.trim();
              newRow.appendChild(cell);
            });

            // Tambahkan baris ke dalam tabel
            tableBody.appendChild(newRow);
          }
        });
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  });

// Fungsi untuk memperbarui saldo kasbon atau kasbon motor
function updateKasbon() {
  const namaKaryawan = document.getElementById("nama").value; // Nama karyawan yang dipilih
  const kasbonDibayar = parseFloat(document.getElementById("kasbon").value); // Jumlah kasbon yang dibayar
  const kasbonMotorDibayar = parseFloat(
    document.getElementById("kasbonMotor").value
  ); // Jumlah kasbon motor yang dibayar

  // Ambil data karyawan yang ada (ini hanya contoh, sesuaikan dengan bagaimana data karyawan disimpan)
  const karyawan = getKaryawanData(namaKaryawan); // Fungsi ini akan mengambil data karyawan berdasarkan nama

  if (karyawan) {
    // Perbarui saldo kasbon dan kasbon motor
    const saldoKasbonBaru = karyawan.kasbon - kasbonDibayar;
    const saldoKasbonMotorBaru = karyawan.kasbonMotor - kasbonMotorDibayar;

    // Update data karyawan di UI dan database (contoh update UI)
    document.getElementById("saldoKasbon").innerText = saldoKasbonBaru;
    document.getElementById("saldoKasbonMotor").innerText =
      saldoKasbonMotorBaru;

    // Update database (perlu implementasi server-side untuk menyimpan perubahan ini)
    updateKaryawanData(namaKaryawan, saldoKasbonBaru, saldoKasbonMotorBaru); // Fungsi untuk update data di database
  } else {
    alert("Karyawan tidak ditemukan!");
  }
}

// Ambil elemen input hari kerja
const hariKerjaInput = document.getElementById("hariKerja");

// Fungsi untuk membatasi input agar tetap dalam rentang 1-7
hariKerjaInput.addEventListener("input", function () {
  let value = parseInt(hariKerjaInput.value);
  if (value < 1) {
    hariKerjaInput.value = 0; // Jika nilai kurang dari 1, atur menjadi 1
  } else if (value > 7) {
    hariKerjaInput.value = 7; // Jika nilai lebih dari 7, atur menjadi 7
  }
});

// Validasi input untuk Lembur Mingguan (1 - 7)
const lemburInput = document.getElementById("lembur");
lemburInput.addEventListener("input", function () {
  let value = parseInt(lemburInput.value);
  if (value < 1) {
    lemburInput.value = 0; // Jika nilai kurang dari 1, atur menjadi 1
  } else if (value > 7) {
    lemburInput.value = 7; // Jika nilai lebih dari 7, atur menjadi 7
  }
});

// Validasi input untuk Jam Lembur (1 - 24)
const jamLemburInput = document.getElementById("jamLembur");
jamLemburInput.addEventListener("input", function () {
  let value = parseInt(jamLemburInput.value);
  if (value < 1) {
    jamLemburInput.value = 0; // Jika nilai kurang dari 1, atur menjadi 1
  } else if (value > 24) {
    jamLemburInput.value = 24; // Jika nilai lebih dari 24, atur menjadi 24
  }
});

// Validasi input untuk Gaji Per Hari
const gajiPerHariInput = document.getElementById("gajiPerHari");
gajiPerHariInput.addEventListener("input", function () {
  let value = parseInt(gajiPerHariInput.value);
  if (value < 0) {
    gajiPerHariInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  }
});

// Validasi input untuk Upah Lembur Per Jam
const upahLemburInput = document.getElementById("upahLembur");
upahLemburInput.addEventListener("input", function () {
  let value = parseInt(upahLemburInput.value);
  if (value < 0) {
    upahLemburInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  }
});

// Validasi input untuk Hari Kerja (0 - 7)
const editHariKerjaInput = document.getElementById("editHariKerja");
editHariKerjaInput.addEventListener("input", function () {
  let value = parseInt(editHariKerjaInput.value);
  if (value < 0) {
    editHariKerjaInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  } else if (value > 7) {
    editHariKerjaInput.value = 7; // Jika nilai lebih dari 7, atur menjadi 7
  }
});

// Validasi input untuk Lembur Mingguan (0 - 7)
const editLemburInput = document.getElementById("editLembur");
editLemburInput.addEventListener("input", function () {
  let value = parseInt(editLemburInput.value);
  if (value < 0) {
    editLemburInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  } else if (value > 7) {
    editLemburInput.value = 7; // Jika nilai lebih dari 7, atur menjadi 7
  }
});

// Validasi input untuk Jam Lembur (0 - 24)
const editJamLemburInput = document.getElementById("editJamLembur");
editJamLemburInput.addEventListener("input", function () {
  let value = parseInt(editJamLemburInput.value);
  if (value < 0) {
    editJamLemburInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  } else if (value > 24) {
    editJamLemburInput.value = 24; // Jika nilai lebih dari 24, atur menjadi 24
  }
});

// Validasi input untuk Gaji Per Hari
const editGajiPerHariInput = document.getElementById("editGajiPerHari");
editGajiPerHariInput.addEventListener("input", function () {
  let value = parseInt(editGajiPerHariInput.value);
  if (value < 0) {
    editGajiPerHariInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  }
});

// Validasi input untuk Upah Lembur Per Jam
const editUpahLemburInput = document.getElementById("editUpahLembur");
editUpahLemburInput.addEventListener("input", function () {
  let value = parseInt(editUpahLemburInput.value);
  if (value < 0) {
    editUpahLemburInput.value = 0; // Jika nilai kurang dari 0, atur menjadi 0
  }
});

// Validasi nama karyawan (hanya huruf)
const namaInput = document.getElementById("nama");
const editNamaInput = document.getElementById("editNama");

function validasiNama(input) {
  const regex = /^[A-Za-z\s]+$/; // Hanya menerima huruf dan spasi
  if (!regex.test(input.value)) {
    input.setCustomValidity("Nama hanya boleh mengandung huruf dan spasi.");
  } else {
    input.setCustomValidity(""); // Menghapus pesan kesalahan jika input valid
  }
}

// Validasi nama saat input diubah
namaInput.addEventListener("input", function () {
  validasiNama(namaInput);
});

editNamaInput.addEventListener("input", function () {
  validasiNama(editNamaInput);
});

// Cegah pengiriman form jika ada kesalahan
document.getElementById("employeeForm").addEventListener("submit", function (event) {
  validasiNama(namaInput);
  if (!namaInput.checkValidity()) {
    event.preventDefault(); // Cegah form disubmit jika nama tidak valid
  }
});

document.getElementById("editEmployeeForm").addEventListener("submit", function (event) {
  validasiNama(editNamaInput);
  if (!editNamaInput.checkValidity()) {
    event.preventDefault(); // Cegah form disubmit jika nama tidak valid
  }
});

function logout() {
  // Kirim pesan ke main process untuk melakukan logout
  window.location.href = "login.html";
}

// Fungsi untuk mengambil data dari file JSON
async function loadData() {
  const response = await fetch("data.json");
  const data = await response.json();
  return data;
}

// Fungsi untuk mengonversi data JSON menjadi CSV, dengan memisahkan ID
// Fungsi untuk mengonversi data JSON menjadi CSV, tanpa kolom ID dan memastikan pemisahan kolom
function convertToCSV(objArray, type) {
  const array = Array.isArray(objArray) ? objArray : Object.values(objArray);
  let result = "";

  // Menentukan header CSV tanpa kolom ID
  const headers =
    type === "penggajian"
      ? [
          "tanggal_gajian",
          "nama_karyawan",
          "hari_kerja",
          "gaji_per_hari",
          "lembur_mingguan",
          "jam_lembur",
          "upah_lembur_per_jam",
          "kasbon",
          "kasbon_motor",
          "gaji",
        ]
      : ["nama", "gaji_harian", "upah_lembur", "kasbon", "medical"];

  result += headers.join(",") + "\r\n";

  // Menambahkan data CSV tanpa kolom ID dan memastikan setiap nilai diapit tanda kutip
  array.forEach((item) => {
    result +=
      headers
        .map((header) => {
          const key = header.replace("id_", ""); // Mengambil key yang sesuai
          return `"${item[key] !== undefined ? item[key] : ""}"`; // Membungkus nilai dengan tanda kutip
        })
        .join(",") + "\r\n";
  });

  return result;
}

// Fungsi untuk mengekspor data ke CSV
async function exportData() {
  const data = await loadData(); // Memuat data dari file JSON

  const penggajianCSV = convertToCSV(data.penggajian, "penggajian");
  const karyawanCSV = convertToCSV(data.karyawan, "karyawan");

  // Gabungkan data penggajian dan karyawan menjadi satu file CSV
  const finalCSV = `Data Penggajian:\r\n${penggajianCSV}\r\nData Karyawan:\r\n${karyawanCSV}`;

  // Membuat link untuk mengunduh file CSV
  const blob = new Blob([finalCSV], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    // Mengecek jika fitur download tersedia
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exported_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
