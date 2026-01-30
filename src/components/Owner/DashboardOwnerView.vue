<template>
  <v-container fluid class="bg-grey-lighten-4 h-100">
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold text-primary">Dashboard Owner</h2>
        <p class="text-subtitle-1 text-grey-darken-1">
          Ringkasan performa Clarista Homestay.
        </p>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center mt-10">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-2">Menghitung pendapatan...</p>
      </v-col>
    </v-row>

    <div v-else>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="rounded-lg h-100">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-overline mb-1">Total Pendapatan (Bulan Ini)</div>
                  <div class="text-h5 font-weight-bold text-success">
                    {{ formatRupiah(stats.incomeMonth) }}
                  </div>
                </div>
                <v-avatar color="success" variant="tonal" rounded size="large">
                  <v-icon icon="mdi-cash-multiple"></v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="rounded-lg h-100" :color="stats.pendingCount > 0 ? 'orange-lighten-5' : ''">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-overline mb-1 text-black">Perlu Verifikasi</div>
                  <div class="text-h4 font-weight-bold text-warning">
                    {{ stats.pendingCount }}
                  </div>
                </div>
                <v-avatar color="warning" variant="flat" rounded size="large">
                  <v-icon icon="mdi-bell-ring" color="white"></v-icon>
                </v-avatar>
              </div>
              <v-btn 
                v-if="stats.pendingCount > 0"
                variant="text" 
                color="warning" 
                class="px-0 mt-2"
                to="/admin/verifikasi-pembayaran"
              >
                Cek Sekarang >
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="rounded-lg h-100">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-overline mb-1">Total Booking</div>
                  <div class="text-h5 font-weight-bold">
                    {{ stats.totalBookings }}
                  </div>
                </div>
                <v-avatar color="info" variant="tonal" rounded size="large">
                  <v-icon icon="mdi-clipboard-list"></v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="rounded-lg h-100">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-overline mb-1">Kamar Terisi</div>
                  <div class="text-h5 font-weight-bold">
                    {{ stats.activeRooms }} Unit
                  </div>
                </div>
                <v-avatar color="primary" variant="tonal" rounded size="large">
                  <v-icon icon="mdi-bed"></v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" md="8">
          <v-card elevation="2" class="rounded-lg">
            <v-card-title class="font-weight-bold">Statistik Pemesanan (Manual Chart)</v-card-title>
            <v-card-text>
              <p class="text-caption mb-4">Perbandingan status pesanan saat ini:</p>
              
              <div class="mb-3">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-body-2 font-weight-medium">Lunas / Selesai</span>
                  <span class="text-caption">{{ stats.lunasCount }} Pesanan</span>
                </div>
                <v-progress-linear
                  :model-value="(stats.lunasCount / stats.totalBookings) * 100"
                  color="success"
                  height="20"
                  rounded
                  striped
                >
                </v-progress-linear>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-body-2 font-weight-medium">Menunggu Verifikasi</span>
                  <span class="text-caption">{{ stats.pendingCount }} Pesanan</span>
                </div>
                <v-progress-linear
                  :model-value="(stats.pendingCount / stats.totalBookings) * 100"
                  color="warning"
                  height="20"
                  rounded
                  striped
                ></v-progress-linear>
              </div>

               <div class="mb-3">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-body-2 font-weight-medium">Belum Bayar (Baru)</span>
                  <span class="text-caption">{{ stats.newCount }} Pesanan</span>
                </div>
                <v-progress-linear
                  :model-value="(stats.newCount / stats.totalBookings) * 100"
                  color="info"
                  height="20"
                  rounded
                ></v-progress-linear>
              </div>

            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" class="rounded-lg h-100">
            <v-card-title class="font-weight-bold">Aksi Cepat</v-card-title>
            <v-list lines="two">
              <v-list-item to="/admin/kamar" prepend-icon="mdi-bed-empty" title="Kelola Kamar" subtitle="Update harga & stok"></v-list-item>
              <v-divider></v-divider>
              <v-list-item to="/admin/promo" prepend-icon="mdi-ticket-percent" title="Buat Promo" subtitle="Tarik pelanggan baru"></v-list-item>
              <v-divider></v-divider>
              <v-list-item to="/admin/laporan" prepend-icon="mdi-file-chart" title="Laporan Bulanan" subtitle="Cetak laporan"></v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12">
          <v-card elevation="2" class="rounded-lg">
            <div class="d-flex justify-space-between align-center pa-4">
              <h3 class="text-h6 font-weight-bold">Pesanan Terbaru</h3>
              <v-btn variant="text" color="primary" to="/admin/pesanan">Lihat Semua</v-btn>
            </div>
            
            <v-data-table
              :headers="headers"
              :items="recentBookings"
              density="comfortable"
              :items-per-page="5"
            >
              <template v-slot:item.status_pemesanan="{ item }">
                <v-chip :color="getStatusColor(item.status_pemesanan)" size="small" class="font-weight-bold">
                  {{ item.status_pemesanan }}
                </v-chip>
              </template>

              <template v-slot:item.total_bayar="{ item }">
                {{ formatRupiah(item.total_bayar) }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-eye" size="small" variant="text" color="primary" :to="`/admin/pesanan-saya/${item.id}`"></v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from '../../axios'; // Sesuaikan path import axios-mu
import {defineStore} from 'pinia';

// State Data
const loading = ref(true);
const recentBookings = ref([]);
const stats = ref({
  incomeMonth: 0,
  pendingCount: 0,
  newCount: 0,
  lunasCount: 0,
  totalBookings: 0,
  activeRooms: 0,
  pesananBatal: 0
});

// Polling State
const pollingInterval = ref(null);

// Konfigurasi Header Tabel
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nama Tamu', key: 'user.name' }, // Sesuaikan dengan relasi di API Laravel
  { title: 'Check In', key: 'tanggal_checkin' },
  { title: 'Total', key: 'total_bayar' },
  { title: 'Status', key: 'status_pemesanan' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

// Fungsi Format Rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// Fungsi Warna Status
const getStatusColor = (status_pemesanan) => {
  switch (status_pemesanan) {
    case 'diferifikasi': return 'success';
    case 'menunggu_konfirmasi': return 'warning'; // Update status string match
    case 'menunggu_verifikasi': return 'warning'; // Handle legacy/potential mismatch
    case 'menunggu_pembayaran': return 'info';
    case 'dibatalkan': return 'error';
    default: return 'grey';
  }
};

// Fungsi Polling Khusus Notifikasi Pembayaran
const fetchNotificationCount = async () => {
    try {
        const response = await axios.get('/admin/pembayaran-notifikasi', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.success) {
            // Update jumlah pendingCount dari endpoint khusus ini
            // Ini akan memastikan data realtime (via polling)
            stats.value.pendingCount = response.data;
        }
    } catch (error) {
        console.error("Gagal polling notifikasi", error);
    }
};

// LOGIKA UTAMA: Ambil data dari API yang sudah ada dan hitung manual di Frontend
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    
    // 1. Panggil API Pesanan
    const response = await axios.get('/admin/pemesanan', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.success) {
      const allData = response.data;
      
      // Simpan untuk tabel (ambil 5 teratas)
      recentBookings.value = allData.slice(0, 5);

      // 2. HITUNG STATISTIK CLIENT-SIDE
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Hitung TOTAL BOOKING (Semua yang tidak batal)
      const validBookings = allData.filter(item => item.status_pemesanan !== 'batal');
      stats.value.totalBookings = validBookings.length;

      // Note: pendingCount akan di-cover oleh polling, tapi kita bisa set initial value disini juga
      // atau biarkan fetchNotificationCount yang menangani
      // const pendingVerif = allData.filter(item => item.status_pemesanan === 'menunggu_konfirmasi');
      // stats.value.pendingCount = pendingVerif.length;

      // Hitung Pesanan BARU (Belum Bayar)
      const pendingBayar = allData.filter(item => item.status_pemesanan === 'menunggu_pembayaran');
      stats.value.newCount = pendingBayar.length;

      // Hitung Pesanan LUNAS (Total Lunas Sepanjang Waktu untuk Chart)
      const lunas = allData.filter(item => item.status_pemesanan === 'dikonfimrasi' || item.status_pemesanan === 'selesai');
      stats.value.lunasCount = lunas.length;

      // Hitung TOTAL PENDAPATAN (Hanya Lunas/Selesai di BULAN INI)
      const incomeThisMonth = lunas.filter(item => {
          const checkIn = new Date(item.tanggal_check_in);
          return checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear;
      });

      stats.value.incomeMonth = incomeThisMonth.reduce((acc, curr) => acc + parseInt(curr.total_bayar), 0);
      
// stats.value.activeRooms = Math.floor(Math.random() * 5); // Dummy removed
    }
    
    // Panggil notifikasi count juga saat load awal agar sinkron
    await fetchNotificationCount();

    // 3. FETCH REALTIME DASHBOARD STATS (Active Rooms)
    try {
        const statsResponse = await axios.get('/admin/dashboard-stats', {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if(statsResponse.success) {
           stats.value.activeRooms = statsResponse.data.active_rooms;
        }
    } catch (e) {
        console.error("Gagal load stats dashboard", e);
    }

  } catch (error) {
    console.error("Gagal ambil data dashboard", error);
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  fetchDashboardData();
  
  // Setup Polling setiap 10 detik (10000ms)
  pollingInterval.value = setInterval(() => {
      fetchNotificationCount();
  }, 10000);
});

onUnmounted(() => {
    // Bersihkan interval saat komponen di-destroy
    if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
    }
});
</script>