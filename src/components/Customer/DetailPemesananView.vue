<template>
  <v-container>
    <v-btn to="/pesanan-saya" variant="text" class="mb-4">
      <v-icon left>mdi-arrow-left</v-icon>
      Kembali ke Riwayat
    </v-btn>

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
      <v-card-subtitle>
        Kode Booking: CL-JAN01-{{ pesanan.id }}
      </v-card-subtitle>

      <v-divider class="my-4"></v-divider>
      
      <v-card-text>
        <div class="text-subtitle-1 font-weight-bold mb-2">Detail Kontak</div>
        <p><strong>Nama:</strong> {{ pesanan.user.name }}</p>
        <p><strong>Email:</strong> {{ pesanan.user.email }}</p>
        
        <v-divider class="my-4"></v-divider>

        <div class="text-subtitle-1 font-weight-bold mb-2">Rincian Tagihan</div>
      <v-table>
  <thead>
    <tr>
      <th class="text-left">Deskripsi</th>
      <th class="text-center">Jumlah</th>
      <th class="text-right">Harga</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="detail in pesanan.detail_pemesanans" :key="detail.id">
      <td>{{ detail.kamar.tipe_kamar }}</td>
      <td class="text-center">{{ detail.jumlah_kamar }}</td>
      <td class="text-right">Rp {{ new Intl.NumberFormat('id-ID').format(detail.harga_per_malam) }}</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2" class="text-right">Subtotal</td>
      <td class="text-right">Rp {{ new Intl.NumberFormat('id-ID').format(subtotal) }}</td>
    </tr>
    <tr v-if="pesanan.promo" class="text-green">
      <td colspan="2" class="text-right">Diskon ({{ pesanan.promo.kode_promo }})</td>
      <td class="text-right">- Rp {{ new Intl.NumberFormat('id-ID').format(subtotal - pesanan.total_bayar) }}</td>
    </tr>
    <tr class="font-weight-bold">
      <td colspan="2" class="text-right">Total</td>
      <td class="text-right">Rp {{ new Intl.NumberFormat('id-ID').format(pesanan.total_bayar) }}</td>
    </tr>
  </tfoot>
</v-table>
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



const subtotal = computed(() => {
  if (!pesanan.value) return 0;
  // Menjumlahkan harga asli dari setiap detail pesanan
  return pesanan.value.detail_pemesanans.reduce((total, detail) => {
    return total + (detail.harga_per_malam * detail.jumlah_kamar);
  }, 0);
});

onMounted(async () => {
  const pesananId = route.params.id;
  try {
    const response = await apiClient.get(`/pemesanan/${pesananId}`);
    pesanan.value = response.data;
  } catch (err) {
    error.value = 'Gagal memuat detail pemesanan atau Anda tidak memiliki akses.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>