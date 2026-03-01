<template>
  <v-container>
    <div class="d-flex justify-start mb-4">
      <v-btn to="/pesanan-saya" variant="text" color="text-grey-darken-2">
        <v-icon start>mdi-arrow-left</v-icon>
        Kembali ke Riwayat
      </v-btn>
    </div>

    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <v-alert v-else-if="error" type="error" prominent>{{ error }}</v-alert>

    <v-card v-else-if="pesanan" variant="outlined">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5">Detail Transaksi</div>
        <v-chip :color="getStatusColor(pesanan.status_pemesanan)" label>
          {{ pesanan.status_pemesanan.replace('_', ' ').toUpperCase() }}
        </v-chip>
      </v-card-title>
      <v-card-subtitle class="text-left">
        Kode Booking: {{ pesanan.kode_booking }}
      </v-card-subtitle>

      <v-divider class="my-4"></v-divider>

      <!-- BAGIAN BARU: Detail Waktu Menginap -->
      <div class="px-4 px-md-6 mb-6 mt-2">
        <v-row>
            <v-col cols="12" sm="6" class="mb-4 mb-sm-0">
                <div class="d-flex align-center">
                    <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
                        <v-icon>mdi-calendar-check</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-caption text-grey-darken-1">Check-in</div>
                        <div class="text-body-1 font-weight-bold">
                            {{ formatDate(pesanan.tanggal_check_in) }}
                        </div>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" sm="6" class="text-left text-sm-right">
                <div class="d-flex align-center justify-start justify-sm-end">
                    <div class="order-2 order-sm-1 ml-3 ml-sm-0 mr-sm-3">
                        <div class="text-caption text-grey-darken-1">Check-out</div>
                        <div class="text-body-1 font-weight-bold">
                            {{ formatDate(pesanan.tanggal_check_out) }}
                        </div>
                    </div>
                    <v-avatar color="error" variant="tonal" size="40" class="order-1 order-sm-2">
                        <v-icon>mdi-calendar-remove</v-icon>
                    </v-avatar>
                </div>
            </v-col>
        </v-row>
      </div>

      <v-divider class="my-4"></v-divider>
      
      <v-card-text class="pa-0">
        <div class="px-4 px-md-6 py-4 text-left">
            <div class="text-subtitle-1 font-weight-bold mb-2">Detail Kontak</div>
            <p class="mb-1"><strong>Nama:</strong> {{ pesanan.user.name }}</p>
            <p><strong>Email:</strong> {{ pesanan.user.email }}</p>
        </div>
        
        <v-divider></v-divider>

        <div class="px-4 px-md-6 pt-4 pb-2">
            <div class="text-subtitle-1 font-weight-bold text-left">Rincian Tagihan</div>
        </div>
      <!-- Desktop Table (Hidden on small screens) -->
      <v-table density="comfortable" class="text-body-2 d-none d-md-block">
        <thead>
          <tr>
            <th class="text-left font-weight-bold text-grey-darken-2">Tipe Kamar</th>
            <th class="text-left font-weight-bold text-grey-darken-2">Jumlah</th>
            <th class="text-left font-weight-bold text-grey-darken-2">Durasi</th>
            <th class="text-left font-weight-bold text-grey-darken-2">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detail in pesanan.detail_pemesanans" :key="detail.id">
            <td class="py-3 text-left">
                <div class="font-weight-bold">{{ detail.kamar.tipe_kamar }}</div>
                <div class="text-caption text-grey">Rp {{ formatCurrency(detail.harga_per_malam) }} / malam</div>
            </td>
            <td class="text-left">{{ detail.jumlah_kamar }} Unit</td>
            <td class="text-left">{{ durasiMalam }} Malam</td>
            <td class="text-left font-weight-bold">Rp {{ formatCurrency(detail.harga_per_malam * detail.jumlah_kamar * durasiMalam) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-left text-caption text-grey-darken-1 pt-4">Subtotal</td>
            <td class="text-left font-weight-bold pt-4">Rp {{ formatCurrency(subtotal) }}</td>
          </tr>
          <tr v-if="pesanan.promo">
            <td colspan="3" class="text-left text-caption text-green">
              <v-icon start size="x-small">mdi-ticket-percent</v-icon> 
              Diskon ({{ pesanan.promo.kode_promo }})
            </td>
            <td class="text-left text-green font-weight-bold">- Rp {{ formatCurrency(subtotal - pesanan.total_bayar) }}</td>
          </tr>
          <tr>
            <td colspan="3" class="text-left text-h6 font-weight-black text-primary pt-2">Total Bayar</td>
            <td class="text-left text-h6 font-weight-black text-primary pt-2">Rp {{ formatCurrency(pesanan.total_bayar) }}</td>
          </tr>
        </tfoot>
      </v-table>

      <!-- Mobile List (Visible on small screens) -->
      <div class="d-md-none px-4 pb-4">
          <div v-for="detail in pesanan.detail_pemesanans" :key="detail.id" class="mb-4 pa-3 bg-grey-lighten-5 rounded-lg border">
              <div class="d-flex justify-space-between align-start mb-2">
                  <div>
                      <div class="font-weight-bold text-body-1">{{ detail.kamar.tipe_kamar }}</div>
                      <div class="text-caption text-grey">Rp {{ formatCurrency(detail.harga_per_malam) }} / malam</div>
                  </div>
                  <div class="text-right">
                      <div class="font-weight-bold text-primary">Rp {{ formatCurrency(detail.harga_per_malam * detail.jumlah_kamar * durasiMalam) }}</div>
                  </div>
              </div>
              <v-divider class="mb-2"></v-divider>
              <div class="d-flex justify-space-between text-caption text-grey-darken-2">
                  <span>{{ detail.jumlah_kamar }} Unit</span>
                  <span>{{ durasiMalam }} Malam</span>
              </div>
          </div>

          <div class="mt-4 px-2">
              <div class="d-flex justify-space-between mb-1 text-body-2">
                  <span class="text-grey-darken-1">Subtotal</span>
                  <span class="font-weight-bold">Rp {{ formatCurrency(subtotal) }}</span>
              </div>
              <div v-if="pesanan.promo" class="d-flex justify-space-between mb-2 text-body-2 text-green">
                  <span>
                    <v-icon start size="x-small">mdi-ticket-percent</v-icon> 
                    Diskon ({{ pesanan.promo.kode_promo }})
                  </span>
                  <span class="font-weight-bold">- Rp {{ formatCurrency(subtotal - pesanan.total_bayar) }}</span>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="d-flex justify-space-between align-center">
                  <span class="text-h6 font-weight-bold">Total Bayar</span>
                  <span class="text-h6 font-weight-black text-primary">Rp {{ formatCurrency(pesanan.total_bayar) }}</span>
              </div>
          </div>
      </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../../axios';

const route = useRoute();
const pesanan = ref(null);
const loading = ref(true);
const error = ref(null);

const getStatusColor = (status) => {
  if (status === 'dikonfirmasi' || status === 'selesai') return 'success';
  if (status === 'menunggu_pembayaran') return 'warning';
  if (status === 'batal') return 'error';
  return 'grey';
};

const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });
};

const durasiMalam = computed(() => {
    if (!pesanan.value) return 0;
    const checkIn = new Date(pesanan.value.tanggal_check_in);
    const checkOut = new Date(pesanan.value.tanggal_check_out);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
});

const subtotal = computed(() => {
  if (!pesanan.value) return 0;
  // Subtotal = (Harga per malam * Jumlah Kamar) * Durasi Malam
  return pesanan.value.detail_pemesanans.reduce((total, detail) => {
    return total + (detail.harga_per_malam * detail.jumlah_kamar * durasiMalam.value);
  }, 0);
});

onMounted(async () => {
  const pesananId = route.params.id;
  try {
    const response = await apiClient.get(`/pemesanan/${pesananId}`);
    if (response.success) {
      pesanan.value = response.data;
    } else {
      error.value = response.message || 'Gagal memuat detail pemesanan atau Anda tidak memiliki akses.';
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal memuat detail pemesanan atau Anda tidak memiliki akses.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>