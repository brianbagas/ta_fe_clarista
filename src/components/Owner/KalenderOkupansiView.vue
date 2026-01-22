<template>
  <div class="container mt-5">
    <div class="card shadow">
      
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Kalender Ketersediaan Kamar</h4>
        
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light btn-sm" @click="changeMonth(-1)">❮ Bulan Lalu</button>
          <span class="fw-bold fs-5">{{ currentMonthName }} {{ currentYear }}</span>
          <button class="btn btn-light btn-sm" @click="changeMonth(1)">Bulan Depan ❯</button>
        </div>
      </div>

      <div class="card-body">
        
        <div class="row mb-3">
          <div class="col-md-4 d-flex align-items-center">
            <label class="me-2 fw-bold text-nowrap">Filter Lantai:</label>
            <select v-model="selectedFloor" class="form-select">
              <option value="all">Tampilkan Semua Lantai</option>
              <option v-for="floor in availableFloors" :key="floor" :value="floor">
                Lantai {{ floor }}
              </option>
            </select>
          </div>
          <div class="col-md-8 text-end align-self-center small text-muted">
            Menampilkan {{ filteredRooms.length }} unit kamar.
          </div>
        </div>

        <div class="table-responsive p-0" style="overflow-x: auto;">
          <table class="table table-bordered table-hover mb-0 text-center">
            <thead class="table-light">
              <tr>
                <th class="sticky-col bg-light" style="min-width: 100px; z-index: 20;">Unit</th>
                <th v-for="date in daysInMonth" :key="date" 
                    :class="{'bg-warning-subtle': isToday(date)}" 
                    style="min-width: 40px; font-size: 0.8rem;">
                  {{ formatDateNumber(date) }}
                  <br>
                  <small>{{ getDayName(date) }}</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in filteredRooms" :key="room.id">
                
                <td class="sticky-col fw-bold bg-white">{{ room.nomor_unit }}</td>
                
                <td v-for="date in daysInMonth" :key="date" class="p-0 position-relative">
                  <div class="h-100 w-100 d-flex align-items-center justify-content-center cell-status"
                       :class="getCellClass(room.id, date)"
                       :title="getCellTooltip(room.id, date)"
                       style="height: 40px; cursor: pointer;">
                    
                     <span v-if="getCellStatus(room.id, date) === 'booked'" class="small">★</span>
                     <span v-if="getCellStatus(room.id, date) === 'maintenance'" class="small">🛠</span>
                  </div>
                </td>
              </tr>
              
              <tr v-if="filteredRooms.length === 0">
                <td :colspan="daysInMonth.length + 1" class="text-center py-4 text-muted">
                  Tidak ada data kamar untuk filter ini.
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer bg-white border-top">
        <div class="d-flex gap-4 small">
          <div class="d-flex align-items-center">
            <div class="box me-2 bg-light border"></div> Tersedia (Kosong)
          </div>
          <div class="d-flex align-items-center">
            <div class="box me-2 bg-success"></div> Terisi (Ada Tamu)
          </div>
          <div class="d-flex align-items-center">
            <div class="box me-2 bg-secondary"></div> Maintenance
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentDate: new Date(),
      rooms: [],      // Semua data kamar dari API
      bookings: [],   // Semua data booking dari API
      selectedFloor: 'all', // State untuk filter lantai
    };
  },
  computed: {
    currentYear() {
      return this.currentDate.getFullYear();
    },
    currentMonthName() {
      return this.currentDate.toLocaleString('id-ID', { month: 'long' });
    },
    daysInMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      
      let result = [];
      for (let i = 1; i <= days; i++) {
        // Format tanggal YYYY-MM-DD (PENTING untuk perbandingan string)
        const d = new Date(year, month, i);
        // Trik timezone offset agar tidak mundur sehari saat toISOString
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d - offset)).toISOString().split('T')[0];
        result.push(localISOTime);
      }
      return result;
    },
    
    // --- LOGIKA FILTER LANTAI OTOMATIS ---
    availableFloors() {
      // Ambil digit pertama dari setiap nomor unit (101 -> 1, 802 -> 8)
      // Gunakan Set agar angkanya unik (tidak duplikat)
      const floors = new Set(this.rooms.map(r => r.nomor_unit.toString().charAt(0)));
      // Ubah Set jadi Array dan urutkan
      return Array.from(floors).sort();
    },

    filteredRooms() {
      if (this.selectedFloor === 'all') {
        return this.rooms;
      }
      // Filter kamar yang digit depannya sama dengan lantai yang dipilih
      return this.rooms.filter(room => 
        room.nomor_unit.toString().charAt(0) === this.selectedFloor.toString()
      );
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    changeMonth(step) {
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + step));
      this.fetchData(); 
    },
    formatDateNumber(dateStr) {
      return parseInt(dateStr.split('-')[2]); 
    },
    getDayName(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', { weekday: 'short' });
    },
    isToday(dateStr) {
      // Trik timezone offset untuk today juga
      const d = new Date();
      const offset = d.getTimezoneOffset() * 60000;
      const today = (new Date(d - offset)).toISOString().split('T')[0];
      return dateStr === today;
    },
    
    // --- LOGIKA UTAMA & WARNA ---
    getCellStatus(roomId, dateStr) {
      // Perbaikan Logika Tanggal (Abaikan Jam)
      const booking = this.bookings.find(b => {
        // Potong string jadi "YYYY-MM-DD" saja
        const checkIn = b.check_in_aktual ? b.check_in_aktual.substring(0, 10) : '';
        const checkOut = b.check_out_aktual ? b.check_out_aktual.substring(0, 10) : '';
        
        return (
          b.kamar_unit_id === roomId &&
          dateStr >= checkIn && 
          dateStr < checkOut 
        );
      });

      if (booking) return 'booked';

      const room = this.rooms.find(r => r.id === roomId);
      if (room && room.status_unit === 'maintenance') {
         const d = new Date();
         const offset = d.getTimezoneOffset() * 60000;
         const today = (new Date(d - offset)).toISOString().split('T')[0];
         if(dateStr >= today) return 'maintenance';
      }

      return 'available';
    },

    getCellClass(roomId, dateStr) {
      const status = this.getCellStatus(roomId, dateStr);
      
      if (status === 'booked') {
        return 'bg-success text-white'; // HIJAU (Tamu)
      } 
      if (status === 'maintenance') {
        return 'bg-secondary text-white'; // ABU-ABU (Rusak)
      }
      return 'bg-light'; // PUTIH/NETRAL (Kosong)
    },

    getCellTooltip(roomId, dateStr) {
      const booking = this.bookings.find(b => {
        const checkIn = b.check_in_aktual ? b.check_in_aktual.substring(0, 10) : '';
        const checkOut = b.check_out_aktual ? b.check_out_aktual.substring(0, 10) : '';
        return b.kamar_unit_id === roomId && dateStr >= checkIn && dateStr < checkOut;
      });

      if (booking) {
         // Tampilkan Nama Tamu jika ada di respon API (misal: b.nama_tamu)
         // Jika tidak ada, tampilkan ID-nya saja
         return `Terisi (ID Booking: ${booking.id})`; 
      }
      return 'Tersedia';
    },

    async fetchData() {
        try {
            const token = localStorage.getItem('token');
            // Pastikan URL API sudah benar
            const response = await axios.get('http://127.0.0.1:8000/api/admin/kalender-data', {
                params: {
                    month: this.currentDate.getMonth() + 1,
                    year: this.currentYear
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Masukkan data real dari API
            this.rooms = response.data.rooms || [];
            this.bookings = response.data.bookings || [];

        } catch (error) {
            console.error("Gagal ambil data kalender", error);
            // KOSONGKAN DATA JIKA ERROR (Jangan pakai dummy data angka 47 lagi)
            this.rooms = []; 
            this.bookings = [];
            alert("Gagal memuat data kalender. Cek koneksi API.");
        }
    }
  }
};
</script>

<style scoped>
.sticky-col {
  position: sticky;
  left: 0;
  border-right: 2px solid #ddd;
}
.box {
    width: 15px;
    height: 15px;
    border-radius: 3px;
    display: inline-block;
}
table {
    table-layout: fixed;
}
th, td {
    border: 1px solid #dee2e6;
    vertical-align: middle;
}
</style>