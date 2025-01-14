const { ipcRenderer } = require("electron");

// ====================== HANDLER PENGGAJIAN ======================

// ====================== HANDLER PENGGAJIAN ======================

// Tampilkan modal untuk penggajian
const openModal = document.getElementById("openAddDataModal");
const modal = document.getElementById("addDataModal");
const closeModal = document.querySelector(".close");

if (openModal && modal && closeModal) {
  openModal.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Menutup modal ketika pengguna mengklik area luar modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Tambah data penggajian ke tabel dan kirim ke main process
  const addDataForm = document.getElementById("addDataForm");
  const tableBody = document.querySelector(".content table tbody");

  addDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const tanggal = document.getElementById("tanggal").value;
    const nama = document.getElementById("nama").value;
    const hariKerja = parseInt(document.getElementById("hariKerja").value, 10);
    const gajiPerHari = parseFloat(
      document.getElementById("gajiPerHari").value
    );
    const lembur = parseInt(document.getElementById("lembur").value, 10);
    const jamLembur = parseInt(document.getElementById("jamLembur").value, 10);
    const upahLembur = parseFloat(document.getElementById("upahLembur").value);
    const kasbon = parseFloat(document.getElementById("kasbon").value);
    const kasbonMotor = parseFloat(
      document.getElementById("kasbonMotor").value
    );

    const totalGaji = hariKerja * gajiPerHari + jamLembur * upahLembur;

    // Kirim data ke main process
    ipcRenderer.send("tambahData", {
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
    });

    // Reset form
    addDataForm.reset();
  });

  // Mendapatkan data yang dimuat dari main process
  ipcRenderer.on("dataDimuat", (event, rows) => {
    tableBody.innerHTML = ""; // Kosongkan tabel sebelum mengisi ulang
    rows.forEach((row) => {
      const {
        id,
        tanggal_gajian,
        nama_karyawan,
        hari_kerja,
        gaji_per_hari,
        lembur_mingguan,
        jam_lembur,
        upah_lembur_per_jam,
        kasbon,
        kasbon_motor,
        gaji,
      } = row;
      const rowHTML = `
        <tr data-id="${id}">
          <td>${tanggal_gajian}</td>
          <td>${nama_karyawan}</td>
          <td>${hari_kerja} Hari</td>
          <td>Rp${gaji_per_hari.toLocaleString()}</td>
          <td>${lembur_mingguan} Hari</td>
          <td>${jam_lembur} Jam</td>
          <td>Rp${upah_lembur_per_jam.toLocaleString()}</td>
          <td>Rp${kasbon.toLocaleString()}</td>
          <td>Rp${kasbon_motor.toLocaleString()}</td>
          <td>Rp${gaji.toLocaleString()}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", rowHTML);
    });
  });

  // Memuat data penggajian saat aplikasi dimulai
  document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("muatData");
  });

  // Mendapatkan notifikasi data berhasil disimpan
  ipcRenderer.on("dataTersimpan", (event, data) => {
    const {
      id,
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

    const rowHTML = `
      <tr data-id="${id}">
        <td>${tanggal}</td>
        <td>${nama}</td>
        <td>${hariKerja} Hari</td>
        <td>Rp${gajiPerHari.toLocaleString()}</td>
        <td>${lembur} Hari</td>
        <td>${jamLembur} Jam</td>
        <td>Rp${upahLembur.toLocaleString()}</td>
        <td>Rp${kasbon.toLocaleString()}</td>
        <td>Rp${kasbonMotor.toLocaleString()}</td>
        <td>Rp${totalGaji.toLocaleString()}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", rowHTML);
    modal.style.display = "none";

    // Memuat ulang data setelah menambah data baru
    ipcRenderer.send("muatData");
  });

  // Menangani penghapusan data penggajian
  tableBody.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("delete-btn")) {
      const row = e.target.closest("tr");
      const rowId = row.getAttribute("data-id");

      if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        ipcRenderer.send("hapusData", rowId);
      }
    }
  });

  // Mendapatkan notifikasi data berhasil dihapus
  ipcRenderer.on("dataDihapus", (event, id) => {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.remove();
    }
  });

  // Menangani kesalahan saat menyimpan data penggajian
  ipcRenderer.on("dataTersimpanGagal", (event, error) => {
    alert(`Gagal menyimpan data: ${error}`);
  });

  // Menangani kesalahan saat memuat data penggajian
  ipcRenderer.on("muatDataGagal", (event, error) => {
    alert(`Gagal memuat data: ${error}`);
  });

  // Menangani kesalahan saat menghapus data penggajian
  ipcRenderer.on("hapusDataGagal", (event, error) => {
    alert(`Gagal menghapus data: ${error}`);
  });
}

// ====================== HANDLER KARYAWAN ======================

// Cek apakah halaman ini adalah karyawan.html dengan memeriksa keberadaan elemen form
const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const employeeTableBody = employeeTable
  ? employeeTable.querySelector("tbody")
  : null;

if (employeeForm && employeeTableBody) {
  // Kirim permintaan untuk memuat data karyawan saat halaman dibuka
  ipcRenderer.send("loadEmployees");

  // Menangani pengiriman form untuk menambah karyawan
  employeeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const gajiHarian = parseFloat(document.getElementById("gajiHarian").value);
    const upahLembur = parseFloat(document.getElementById("upahLembur").value);
    const kasbon = parseFloat(document.getElementById("kasbon").value);
    const medical = parseFloat(document.getElementById("medical").value);

    if (!nama) {
      alert("Nama karyawan harus diisi.");
      return;
    }

    if (
      isNaN(gajiHarian) ||
      isNaN(upahLembur) ||
      isNaN(kasbon) ||
      isNaN(medical)
    ) {
      alert("Semua field harus diisi dengan angka yang valid.");
      return;
    }

    // Kirim data ke main process
    ipcRenderer.send("addEmployee", {
      nama,
      gajiHarian,
      upahLembur,
      kasbon,
      medical,
    });

    // Reset form
    employeeForm.reset();
  });

  // Mendapatkan data karyawan yang telah dimuat
  ipcRenderer.on("employeesLoaded", (event, employees) => {
    employeeTableBody.innerHTML = ""; // Kosongkan tabel sebelum mengisi ulang
    employees.forEach((employee) => {
      const { id, nama, gaji_harian, upah_lembur, kasbon, medical } = employee;
      const rowHTML = `
          <tr data-id="${id}">
            <td>${nama}</td>
            <td>Rp${gaji_harian.toLocaleString()}</td>
            <td>Rp${upah_lembur.toLocaleString()}</td>
            <td>Rp${kasbon.toLocaleString()}</td>
            <td>Rp${medical.toLocaleString()}</td>
            <td>
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Hapus</button>
            </td>
          </tr>
        `;
      employeeTableBody.insertAdjacentHTML("beforeend", rowHTML);
    });
  });

  // Mendapatkan notifikasi karyawan berhasil ditambahkan
  ipcRenderer.on("employeeAdded", (event, employee) => {
    const { id, nama, gajiHarian, upahLembur, kasbon, medical } = employee;
    const rowHTML = `
        <tr data-id="${id}">
          <td>${nama}</td>
          <td>Rp${gajiHarian.toLocaleString()}</td>
          <td>Rp${upahLembur.toLocaleString()}</td>
          <td>Rp${kasbon.toLocaleString()}</td>
          <td>Rp${medical.toLocaleString()}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Hapus</button>
          </td>
        </tr>
      `;
    employeeTableBody.insertAdjacentHTML("beforeend", rowHTML);
  });

  // Menangani penghapusan karyawan
  employeeTableBody.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("delete-btn")) {
      const row = e.target.closest("tr");
      const employeeId = row.getAttribute("data-id");

      if (confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) {
        ipcRenderer.send("hapusKaryawan", employeeId);
      }
    }

    // Opsi: Menangani edit karyawan (jika diimplementasikan)
    if (e.target && e.target.classList.contains("edit-btn")) {
      const row = e.target.closest("tr");
      const employeeId = row.getAttribute("data-id");

      // Implementasi modal edit atau prompt untuk mengedit data
      // Contoh sederhana menggunakan prompt:
      const namaBaru = prompt("Masukkan nama baru:", row.children[0].innerText);
      if (namaBaru !== null) {
        const gajiHarianBaru = parseFloat(
          prompt(
            "Masukkan Gaji Harian baru:",
            row.children[1].innerText.replace(/Rp|,/g, "")
          )
        );
        const upahLemburBaru = parseFloat(
          prompt(
            "Masukkan Upah Lembur Perjam baru:",
            row.children[2].innerText.replace(/Rp|,/g, "")
          )
        );
        const kasbonBaru = parseFloat(
          prompt(
            "Masukkan Kasbon baru:",
            row.children[3].innerText.replace(/Rp|,/g, "")
          )
        );
        const medicalBaru = parseFloat(
          prompt(
            "Masukkan Medical baru:",
            row.children[4].innerText.replace(/Rp|,/g, "")
          )
        );

        if (
          namaBaru &&
          !isNaN(gajiHarianBaru) &&
          !isNaN(upahLemburBaru) &&
          !isNaN(kasbonBaru) &&
          !isNaN(medicalBaru)
        ) {
          // Kirim data yang diperbarui ke main process
          ipcRenderer.send("updateEmployee", {
            id: employeeId,
            nama: namaBaru,
            gajiHarian: gajiHarianBaru,
            upahLembur: upahLemburBaru,
            kasbon: kasbonBaru,
            medical: medicalBaru,
          });
        } else {
          alert("Data yang dimasukkan tidak valid.");
        }
      }
    }
  });

  // Mendapatkan notifikasi karyawan berhasil dihapus
  ipcRenderer.on("employeeDeleted", (event, id) => {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.remove();
    }
  });

  // Mendapatkan notifikasi karyawan berhasil diupdate (opsional)
  ipcRenderer.on("employeeUpdated", (event, employee) => {
    const { id, nama, gajiHarian, upahLembur, kasbon, medical } = employee;
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.children[0].innerText = nama;
      row.children[1].innerText = `Rp${gajiHarian.toLocaleString()}`;
      row.children[2].innerText = `Rp${upahLembur.toLocaleString()}`;
      row.children[3].innerText = `Rp${kasbon.toLocaleString()}`;
      row.children[4].innerText = `Rp${medical.toLocaleString()}`;
    }
  });

  // Menangani kesalahan saat menambah karyawan
  ipcRenderer.on("employeeAddedGagal", (event, error) => {
    alert(`Gagal menambah karyawan: ${error}`);
  });

  // Menangani kesalahan saat memuat data karyawan
  ipcRenderer.on("employeesLoadedGagal", (event, error) => {
    alert(`Gagal memuat data karyawan: ${error}`);
  });

  // Menangani kesalahan saat menghapus karyawan
  ipcRenderer.on("hapusKaryawanGagal", (event, error) => {
    alert(`Gagal menghapus karyawan: ${error}`);
  });
}

// =================== DASHBOARD ====================== 
const ctx = document.getElementById("gajiChart").getContext("2d");

// Data dummy untuk grafik (contoh)
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  datasets: [
    {
      label: "Total Gaji per Bulan",
      data: [5000000, 6000000, 5500000, 7000000, 8000000, 7500000, 9000000, 8500000, 9500000, 10000000, 11000000, 12000000], // Data dummy
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

// Konfigurasi grafik
const chartConfig = {
  type: "bar", // Jenis grafik (bisa diganti ke 'line', 'pie', dll.)
  data: chartData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

// Buat grafik
const gajiChart = new Chart(ctx, chartConfig);