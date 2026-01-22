<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="7">
        <v-card variant="outlined">
          <v-card-title class="text-h5">Metode Pembayaran</v-card-title>
          <v-card-subtitle>Lakukan Pembayaran (Bank Transfer)</v-card-subtitle>
          <v-list>
            <v-list-item title="Bank" subtitle="BRI"></v-list-item>
            <v-list-item title="Nomor Rekening" subtitle="123-456-789"></v-list-item>
            <v-list-item title="Atas Nama" subtitle="Clarista Homestay"></v-list-item>
            <v-list-item>
                <v-list-item-title class="font-weight-bold">Total Bayar</v-list-item-title>
                <v-list-item-subtitle class="text-h6 text-primary font-weight-bold">
                    Rp {{ pesanan ? new Intl.NumberFormat('id-ID').format(pesanan.total_bayar) : '0' }}
                </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text>
      <v-file-input
  @change="onFileChange"
  label="Bukti Bayar"
  variant="outlined"
  accept="image/png, image/jpeg, image/jpg"
  prepend-icon="mdi-camera"
  :rules="[rules.required]"
  hint="Klik untuk mengunggah bukti bayar"
></v-file-input>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="outlined">
          <v-card-title class="text-h5">Ringkasan Pesanan</v-card-title>
          <div v-if="loading">
            <v-skeleton-loader type="list-item-two-line@3"></v-skeleton-loader>
          </div>
          <div v-else-if="pesanan">
             <v-card-text>
                Check-in: {{ new Date(pesanan.tanggal_check_in).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
                <br>
                Check-out: {{ new Date(pesanan.tanggal_check_out).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
             </v-card-text>
             <v-divider></v-divider>
             <v-list>
                <v-list-item v-for="detail in pesanan.detail_pemesanans" :key="detail.id">
                    <v-list-item-title>{{ detail.jumlah_kamar }}x {{ detail.kamar.tipe_kamar }}</v-list-item-title>
                    <template v-slot:append>
                        <span>Rp {{ new Intl.NumberFormat('id-ID').format(detail.harga_per_malam * detail.jumlah_kamar) }}</span>
                    </template>
                </v-list-item>
             </v-list>
             <v-divider></v-divider>
             <v-card-text class="d-flex justify-space-between text-h6">
                <strong>Total</strong>
                <strong>Rp {{ new Intl.NumberFormat('id-ID').format(pesanan.total_bayar) }}</strong>
             </v-card-text>
          </div>
          <v-card-actions class="pa-4">
            <v-btn
              color="primary"
              :loading="uploadLoading"
              :disabled="!buktiBayarFile"
              block
              @click="handleUpload"
            >
              Konfirmasi Pembayaran
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../axios';

const route = useRoute();
const router = useRouter();

const pesanan = ref(null);
const buktiBayarFile = ref(null);
const loading = ref(true);
const uploadLoading = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });
const pesananId = route.params.id;

const rules = {
  required: value => !!value || 'File bukti bayar harus diisi.',
};

onMounted(async () => {
  try {
    const response = await apiClient.get(`/pemesanan/${pesananId}`);
    pesanan.value = response.data;
  } catch (err) {
    console.error('Gagal memuat data pesanan:', err);
  } finally {
    loading.value = false;
  }
});

const onFileChange = (event) => {
  // Ambil file langsung dari event target
  const file = event.target.files[0];
  if (file) {
    buktiBayarFile.value = file;
    console.log('File dipilih:', buktiBayarFile.value);
  }
};

const handleUpload = async () => {
  // Pengecekan diubah sedikit agar lebih aman
  if (!buktiBayarFile.value || buktiBayarFile.value.length === 0) {
    snackbar.value = { show: true, text: 'Silakan pilih file bukti bayar terlebih dahulu.', color: 'warning' };
    return;
  }

  // Menampilkan file yang benar di console
  console.log('File yang akan diunggah:', buktiBayarFile.value); 

  uploadLoading.value = true;
  const formData = new FormData();
  
  // -- INI BAGIAN YANG DIPERBAIKI --
  // Mengambil file pertama (indeks 0) dari array buktiBayarFile
  formData.append('bukti_bayar', buktiBayarFile.value);

  try {
    const response = await apiClient.post(`/pemesanan/${pesananId}/pembayaran`, formData,{
    headers: {
        'Content-Type': 'multipart/form-data'
      }
  });
    
    snackbar.value = { show: true, text: response.data.message, color: 'success' };
    
    setTimeout(() => {
      router.push('/pesanan-saya');
    }, 2000);

  } catch (error) {
    // Log error spesifik dari server jika ada
    const errorMessage = error.response?.data?.message || 'Gagal mengunggah bukti bayar.';
    console.error('Upload gagal:', error);
    snackbar.value = { show: true, text: errorMessage, color: 'error' };
  } finally {
    uploadLoading.value = false;
  }
};
</script>