<template>
  <v-container class="py-10 bg-grey-lighten-4 fill-height align-start" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold text-blue-grey-darken-3">Riwayat Pesanan</h1>
            <p class="text-body-1 text-grey">Kelola semua perjalanan dan reservasi Anda.</p>
          </div>
        </div>

        <v-tabs v-model="activeTab" bg-color="transparent" color="primary" class="mb-6">
          <v-tab value="all">Semua</v-tab>
          <v-tab value="wait">Menunggu Bayar</v-tab>
          <v-tab value="active">Menunggu Konfirmasi</v-tab>
          <v-tab value="history">Selesai</v-tab>
        </v-tabs>

        <div v-if="loading" class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey">Memuat data pesanan...</p>
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <div v-else-if="filteredList.length === 0" class="text-center py-15">
          <v-icon size="100" color="grey-lighten-2">mdi-ticket-confirmation-outline</v-icon>
          <h3 class="text-h6 text-grey mt-4">Tidak ada pesanan di kategori ini.</h3>
          <v-btn to="/booking" color="primary" variant="flat" class="mt-4">Pesan Sekarang</v-btn>
        </div>

        <div v-else class="d-flex flex-column gap-4">
          <v-card
            v-for="pesanan in filteredList"
            :key="pesanan.id"
            class="rounded-xl border-opacity-50 mb-4 transition-swing"
            elevation="2"
            
          >
            <div class="bg-grey-lighten-5 px-5 py-3 d-flex justify-space-between align-center border-b">
              <div class="d-flex align-center text-caption text-grey-darken-1">
                <v-icon size="small" start>mdi-receipt</v-icon>
                <span class="font-weight-bold mr-2">ORDER #{{ pesanan.id }}</span>
                <span class="text-grey">• Dipesan {{ formatDate(pesanan.created_at) }}</span>
              </div>
              <v-chip :color="getStatusColor(pesanan.status_pemesanan)" size="small" label class="font-weight-bold">
                {{ formatStatus(pesanan.status_pemesanan) }}
              </v-chip>
            </div>

            <v-card-text class="pa-0">
              <v-row no-gutters>
                <v-col cols="12" md="8" class="pa-5">
                  <div v-for="detail in pesanan.detail_pemesanans" :key="detail.id" class="d-flex mb-4">
                    <v-avatar rounded="lg" size="80" class="me-4 bg-grey-lighten-2">
                      <v-img 
                        :src="detail.kamar.image || 'https://via.placeholder.com/150'" 
                        cover
                      ></v-img>
                    </v-avatar>
                    
                    <div>
                      <h3 class="text-h6 font-weight-bold">{{ detail.kamar.tipe_kamar }}</h3>
                      <div class="d-flex align-center mt-1 text-body-2 text-grey-darken-2">
                        <v-icon size="small" start color="primary">mdi-calendar-range</v-icon>
                        {{ formatDateShort(pesanan.tanggal_check_in) }} — {{ formatDateShort(pesanan.tanggal_check_out) }}
                      </div>
                      <div class="d-flex align-center mt-1 text-caption text-grey">
                        <v-icon size="small" start>mdi-bed</v-icon>
                        {{ detail.jumlah_kamar }} Kamar
                        <span class="mx-2">•</span>
                        <v-icon size="small" start>mdi-moon-waning-crescent</v-icon>
                        {{ calculateNights(pesanan.tanggal_check_in, pesanan.tanggal_check_out) }} Malam
                      </div>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="4" class="pa-5 bg-blue-grey-lighten-5 d-flex flex-column justify-center align-end">
                  <div class="text-caption text-grey-darken-1">Total Pembayaran</div>
                  <div class="text-h5 font-weight-bold text-primary mb-4">
                    Rp {{ formatCurrency(pesanan.total_bayar) }}
                  </div>

                  <div class="d-flex gap-2 flex-wrap justify-end">
                    <v-btn 
                      v-if="pesanan.status_pemesanan === 'menunggu_pembayaran'"
                      :to="{ name: 'bayar-pesanan', params: { id: pesanan.id } }"
                      color="orange-darken-1"
                      variant="flat"
                      prepend-icon="mdi-credit-card"
                    >
                      Bayar
                    </v-btn>
                    
                    <v-btn 
                      :to="{ name: 'detail-pesanan', params: { id: pesanan.id } }"
                      variant="outlined" 
                      color="blue-grey"
                    >
                      Detail
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '../../axios';

const pemesanans = ref([]);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('all'); // State untuk tab aktif

const fetchRiwayat = async () => {
  try {
    const response = await apiClient.get('/pemesanan');
    // Urutkan dari yang terbaru (ID terbesar/Created At terbaru)
    pemesanans.value = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    error.value = 'Gagal memuat riwayat pemesanan.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// --- LOGIC FILTER TAB ---
const filteredList = computed(() => {
  if (activeTab.value === 'all') return pemesanans.value;
  
  return pemesanans.value.filter(p => {
    const status = p.status_pemesanan;
    if (activeTab.value === 'wait') return status === 'menunggu_pembayaran';
    if (activeTab.value === 'active') return ['dikonfirmasi', 'sukses','menunggu_konfirmasi'].includes(status);
    if (activeTab.value === 'history') return ['selesai', 'batal'].includes(status);
    return true;
  });
});

// --- HELPER FUNCTIONS ---
const getStatusColor = (status) => {
  const colors = {
    'menunggu_pembayaran': 'orange-lighten-4 text-orange-darken-4', // Gaya chip modern (bg terang, teks gelap)
    'dikonfirmasi': 'blue-lighten-4 text-blue-darken-4',
    'menunggu_konfirmasi': 'green-lighten-4 text-green-darken-4',
    'batal': 'red-lighten-4 text-red-darken-4',
    'selesai': 'grey-lighten-3 text-grey-darken-3'
  };
  return colors[status] || 'grey';
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').toUpperCase();
};

const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });
};

const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
};

const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

onMounted(fetchRiwayat);
</script>

<style scoped>
/* Transisi halus saat hover */
.transition-swing:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px 0 rgba(0,0,0,0.1) !important;
}
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
</style>