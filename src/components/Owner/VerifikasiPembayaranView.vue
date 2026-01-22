<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-cash-check" size="large" class="mr-2" color="primary"></v-icon>
      <h1 class="text-h4">Antrian Verifikasi Pembayaran</h1>
    </div>
    
    <p class="mb-6">
      <v-chip color="primary" variant="flat">
        {{ pemesanans.length }} Perlu Review
      </v-chip>
    </p>

    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
    <v-alert v-else-if="error" type="error" variant="tonal" closable>{{ error }}</v-alert>
    
    <div v-else-if="pemesanans.length > 0">
      <v-card 
        v-for="pesanan in pemesanans" 
        :key="pesanan.id"
        class="mb-6 elevation-2"
        rounded="lg"
      >
        <v-row no-gutters>
          <v-col cols="12" md="8" class="pa-4">
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="text-overline text-primary">ID BOOKING</div>
                <h2 class="text-h5 font-weight-bold mb-2">CL-JUL25-00{{ pesanan.id }}</h2>
              </div>
              <v-chip size="small" color="warning" prepend-icon="mdi-clock-outline">Menunggu Verifikasi</v-chip>
            </div>

            <v-divider class="my-3"></v-divider>

            <v-row>
              <v-col cols="6">
                <p class="text-caption text-grey">PEMESAN</p>
                <p class="font-weight-medium">{{ pesanan.user.name }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-grey">TIPE KAMAR</p>
                <p class="font-weight-medium">{{ pesanan.detail_pemesanans[0]?.kamar?.tipe_kamar || 'N/A' }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-grey">CHECK-IN</p>
                <p class="font-weight-medium">{{ new Date(pesanan.tanggal_check_in).toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-grey">TOTAL TAGIHAN</p>
                <p class="font-weight-bold text-success text-h6">Rp {{ new Intl.NumberFormat('id-ID').format(pesanan.total_bayar) }}</p>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="4" class="pa-4 bg-grey-lighten-4 d-flex flex-column align-center justify-center border-s-md">
            <p class="font-weight-bold mb-2 w-100">Bukti Bayar:</p>
            <v-hover v-slot="{ isPropping, props }">
              <v-card
                v-bind="props"
                @click="openZoom(getBuktiBayarUrl(pesanan.pembayaran.bukti_bayar_path))"
                class="cursor-pointer overflow-hidden"
                max-width="250"
              >
                <v-img 
                  :src="getBuktiBayarUrl(pesanan.pembayaran.bukti_bayar_path)"
                  height="180"
                  width="250"
                  cover
                  class="align-end text-white"
                >
                  <div class="d-flex justify-center mb-2">
                    <v-btn size="small" prepend-icon="mdi-magnify-plus" color="black" variant="flat">Zoom</v-btn>
                  </div>
                </v-img>
              </v-card>
            </v-hover>
            <p class="text-caption mt-2 text-grey">Klik gambar untuk memperbesar</p>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            color="error" 
            prepend-icon="mdi-close-circle"
            class="px-6"
            @click="triggerTolak(pesanan.id)"
          >
            Tolak
          </v-btn>
          <v-btn 
            variant="flat" 
            color="success" 
            prepend-icon="mdi-check-decagram"
            class="px-6"
            @click="prosesVerifikasi(pesanan.id, 'dikonfirmasi')"
          >
            Konfirmasi Pembayaran
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-sheet v-else class="text-center text-grey py-12" border rounded="lg">
      <v-icon size="80" color="grey-lighten-1">mdi-tray-check</v-icon>
      <p class="text-h6 mt-4">Bersih! Tidak ada antrian pembayaran.</p>
    </v-sheet>

    <v-dialog v-model="zoomDialog" max-width="800">
      <v-card>
        <v-toolbar flat density="compact">
          <v-toolbar-title>Pratinjau Bukti Bayar</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="zoomDialog = false"></v-btn>
        </v-toolbar>
        <v-img :src="selectedImg" width="100%"></v-img>
      </v-card>
    </v-dialog>

    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="bg-error text-white">Alasan Penolakan</v-card-title>
        <v-card-text class="mt-4">
          <p class="mb-2 text-body-2">Berikan alasan mengapa pembayaran ini ditolak. Alasan ini akan dikirimkan kepada pelanggan.</p>
          <v-textarea
            v-model="rejectReason"
            label="Komentar Admin"
            placeholder="Contoh: Bukti transfer tidak terbaca atau nominal tidak sesuai."
            variant="outlined"
            rows="3"
            :rules="[v => !!v || 'Alasan wajib diisi']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="rejectDialog = false">Batal</v-btn>
          <v-btn color="error" variant="flat" :disabled="!rejectReason" @click="konfirmasiTolak">Kirim Penolakan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../axios';

const pemesanans = ref([]);
const loading = ref(true);
const error = ref(null);

// State untuk Zoom
const zoomDialog = ref(false);
const selectedImg = ref('');

// State untuk Penolakan
const rejectDialog = ref(false);
const rejectReason = ref('');
const activePesananId = ref(null);

const fetchVerifikasiList = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/admin/pembayaran/verifikasi');
    pemesanans.value = response.data;
  } catch (err) {
    error.value = 'Gagal memuat data verifikasi.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const getBuktiBayarUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}/storage/${path.replace('public/', '')}`;
};

const openZoom = (url) => {
  selectedImg.value = url;
  zoomDialog.value = true;
};

const triggerTolak = (id) => {
  activePesananId.value = id;
  rejectReason.value = '';
  rejectDialog.value = true;
};

const konfirmasiTolak = async () => {
  await prosesVerifikasi(activePesananId.value, 'batal', rejectReason.value);
  rejectDialog.value = false;
};

const prosesVerifikasi = async (id, status, alasan = '') => {
  try {
    await apiClient.post(`/admin/pembayaran/verifikasi/${id}`, { 
      status, 
      catatan_admin: alasan // Mengirim alasan penolakan ke backend
    });
    
    // Notifikasi sukses (bisa diganti dengan v-snackbar)
    alert(status === 'dikonfirmasi' ? "Pembayaran berhasil dikonfirmasi!" : "Pembayaran telah ditolak.");
    
    // Hapus item dari list setelah diproses
    pemesanans.value = pemesanans.value.filter(p => p.id !== id);
  } catch (err) {
    console.error('Gagal memproses verifikasi:', err);
    alert('Gagal memproses verifikasi.');
  }
};

onMounted(fetchVerifikasiList);
</script>

<style scoped>
.border-s-md {
  border-left: 1px solid #e0e0e0;
}
@media (max-width: 960px) {
  .border-s-md {
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
</style>