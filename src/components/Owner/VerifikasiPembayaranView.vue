<style scoped>
.zoom-container {
    cursor: zoom-in;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #ddd;
}
.zoom-container:hover .zoom-overlay {
    opacity: 1;
}
.zoom-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}
</style>

<template>
  <v-container>
    <!-- HEADER -->
    <div class="d-flex align-center mb-6">
        <v-btn icon="mdi-arrow-left" variant="text" @click="goBackToList" class="mr-2"></v-btn>
        <div>
                <h1 class="text-h4 font-weight-bold">Verifikasi Pembayaran</h1>
                <div class="d-flex align-center mt-1" v-if="detailPesanan">
                    <div class="text-subtitle-1 text-grey mr-3">
                        Order #{{ detailPesanan.kode_booking }}
                    </div>
                    <v-chip 
                        size="small" 
                        :color="getStatusColor(detailPesanan.status_pemesanan)"
                        class="text-uppercase font-weight-bold"
                    >
                        {{ formatStatus(detailPesanan.status_pemesanan) }}
                    </v-chip>
                </div>
            </div>
        </div>


    <!-- LOADING STATE -->
    <div v-if="loadingDetail" class="text-center py-10">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-2 text-grey">Memuat detail pesanan...</p>
    </div>

    <!-- ERROR STATE -->
    <v-alert v-else-if="errorDetail" type="error" variant="tonal" class="mb-4">
        {{ errorDetail }}
        <div class="mt-2">
            <v-btn color="error" variant="outlined" size="small" @click="goBackToList">Kembali ke Daftar</v-btn>
        </div>
    </v-alert>

    <!-- CONTENT -->
    <v-row v-else-if="detailPesanan">
        <!-- Kolom Kiri: Bukti Bayar Besar -->
        <v-col cols="12" md="6">
            <v-card class="h-100" elevation="0" border>
                <v-card-title class="bg-grey-lighten-4">
                    <v-icon start color="primary">mdi-image</v-icon>
                    Bukti Pembayaran
                </v-card-title>
                <v-card-text class="pa-4 d-flex align-center justify-center bg-grey-lighten-3" style="min-height: 400px;">
                    <div 
                        v-if="detailPesanan.pembayaran && detailPesanan.pembayaran.bukti_bayar_path" 
                        class="zoom-container w-100"
                        @click="openZoom(getBuktiBayarUrl(detailPesanan.pembayaran.bukti_bayar_path))"
                    >
                        <v-img
                            :src="getBuktiBayarUrl(detailPesanan.pembayaran.bukti_bayar_path)"
                            width="100%"
                            max-height="600"
                            cover
                        ></v-img>
                            <div class="zoom-overlay">
                            <v-chip prepend-icon="mdi-magnify-plus" color="white">Perbesar</v-chip>
                        </div>
                    </div>
                    <div v-else class="text-center text-grey">
                        <v-icon size="64">mdi-image-off</v-icon>
                        <p>Tidak ada bukti pembayaran diupload.</p>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- Kolom Kanan: Detail & Aksi -->
        <v-col cols="12" md="6">
            <v-card class="mb-4 text-left" elevation="0" border>
                <v-card-title class="bg-grey-lighten-4">
                    <v-icon start color="info">mdi-information</v-icon>
                    Rincian Pesanan
                </v-card-title>
                <v-list density="compact">
                    <v-list-item>
                        <template v-slot:prepend><v-icon color="grey">mdi-account</v-icon></template>
                        <v-list-item-title>Nama Tamu</v-list-item-title>
                        <v-list-item-subtitle class="text-body-1 text-high-emphasis text-wrap">
                            {{ detailPesanan.user?.name }} ({{ detailPesanan.user?.email }})
                        </v-list-item-subtitle>
                    </v-list-item>
                    <v-divider inset></v-divider>
                    
                    <v-list-item>
                            <template v-slot:prepend><v-icon color="grey">mdi-bank</v-icon></template>
                        <v-list-item-title>Total Tagihan</v-list-item-title>
                        <v-list-item-subtitle class="text-h5 text-primary font-weight-bold text-wrap">
                            Rp {{ formatPrice(detailPesanan.total_bayar) }}
                        </v-list-item-subtitle>
                    </v-list-item>
                        <v-divider inset></v-divider>

                        <v-list-item>
                            <template v-slot:prepend><v-icon color="grey">mdi-calendar-range</v-icon></template>
                        <v-list-item-title>Jadwal</v-list-item-title>
                        <v-list-item-subtitle class="text-body-1 text-wrap">
                            Check-in: {{ formatDate(detailPesanan.tanggal_check_in) }}<br>
                            Durasi: {{ calculateDuration(detailPesanan.tanggal_check_in, detailPesanan.tanggal_check_out) }} Malam
                        </v-list-item-subtitle>
                    </v-list-item>
                </v-list>
                
                <!-- Detail Pembayaran Tambahan -->
                <div class="px-4 pb-4" v-if="detailPesanan.pembayaran">
                        <v-sheet color="blue-lighten-5" class="pa-3 rounded border border-blue-lighten-4 text-caption text-left">
                        <strong>Info Transfer:</strong><br>
                        Bank: {{ detailPesanan.pembayaran.bank_tujuan || '-' }}<br>
                        Pengirim: {{ detailPesanan.pembayaran.nama_pengirim || '-' }}<br>
                        Tgl Upload: {{ formatDate(detailPesanan.pembayaran.created_at) }}
                    </v-sheet>
                </div>
            </v-card>

            <!-- Action Card -->
            <v-card 
                v-if="['menunggu_pembayaran', 'menunggu_konfirmasi'].includes(detailPesanan.status_pemesanan)"
                elevation="2" 
                border 
                color="surface"
            >
                <v-card-title>Aksi Verifikasi</v-card-title>
                <v-card-text>
                    <p class="mb-4 text-body-2 text-grey-darken-1">
                        Pastikan nominal dan bukti transfer sesuai. Aksi ini tidak dapat dibatalkan.
                    </p>
                    <div class="d-flex flex-column gap-3">
                        <v-btn 
                            block 
                            color="success" 
                            size="large" 
                            prepend-icon="mdi-check-decagram"
                            @click="prosesVerifikasi(detailPesanan.id, 'dikonfirmasi')"
                            :loading="processingAction === 'confirm'"
                            :disabled="!!processingAction"
                        >
                            KONFIRMASI PEMBAYARAN
                        </v-btn>
                            <v-btn 
                            block 
                            color="error" 
                            variant="outlined" 
                            size="large" 
                            prepend-icon="mdi-close-circle"
                            @click="triggerTolak(detailPesanan.id)"
                            :disabled="!!processingAction"
                        >
                            TOLAK PEMBAYARAN
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>

            <v-alert
                v-else
                type="info"
                variant="tonal"
                class="mt-4"
                border="start"
            >
                <template v-slot:prepend>
                    <v-icon :color="getStatusColor(detailPesanan.status_pemesanan)" size="large">
                        {{ detailPesanan.status_pemesanan === 'dikonfirmasi' || detailPesanan.status_pemesanan === 'dibayar' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                    </v-icon>
                </template>
                <div class="text-h6">
                    Status: {{ formatStatus(detailPesanan.status_pemesanan) }}
                </div>
                <div class="text-body-2">
                    Pembayaran ini telah diproses dan tidak membutuhkan tindakan lebih lanjut.
                </div>
            </v-alert>

        </v-col>
    </v-row>

    <!-- DIALOGS (SHARED) -->
    <v-dialog v-model="zoomDialog" max-width="900">
      <v-card>
        <v-toolbar flat density="compact" color="black">
          <v-toolbar-title class="text-white">Bukti Bayar Fullscreen</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" color="white" @click="zoomDialog = false"></v-btn>
        </v-toolbar>
        <v-img :src="selectedImg" width="100%" class="bg-black"></v-img>
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
          <v-btn color="error" variant="flat" :disabled="!rejectReason" :loading="processingAction === 'reject'" @click="konfirmasiTolak">Kirim Penolakan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../axios';

const route = useRoute();
const router = useRouter();

// State Detail
const currentId = ref(route.params.id || null);
const detailPesanan = ref(null);
const loadingDetail = ref(false);
const errorDetail = ref(null);
const processingAction = ref(null); 

// State Actions
const zoomDialog = ref(false);
const selectedImg = ref('');
const rejectDialog = ref(false);
const rejectReason = ref('');
const activePesananId = ref(null);

// Watch Route Change
watch(() => route.params.id, (newId) => {
    currentId.value = newId || null;
    if (newId) {
        fetchDetail(newId);
    } else {
        // Jika tidak ada ID, redirect ke halaman list utama
        router.replace({ name: 'DaftarPesanan' });
    }
});

const goBackToList = () => {
    // Kembali ke list pemesanan utama, tab 'perlu_tindakan' bisa dihandle jika mau, tapi default list juga oke
    router.push({ name: 'DaftarPesanan' });
};

// DETAIL LOGIC
const fetchDetail = async (id) => {
    loadingDetail.value = true;
    errorDetail.value = null;
    detailPesanan.value = null;
    
    try {
        const response = await apiClient.get(`/admin/pembayaran/verifikasi/${id}`);
        if (response.success) {
            detailPesanan.value = response.data;
        } else {
             errorDetail.value = response.message;
        }
    } catch (err) {
         errorDetail.value = err.response?.data?.message || 'Gagal memuat detail pesanan';
    } finally {
        loadingDetail.value = false;
    }
};

// ACTIONS
const getBuktiBayarUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.claristahomestay.web.id';
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
  // Set loading state spesifik
  processingAction.value = status === 'dikonfirmasi' ? 'confirm' : 'reject';
  
  try {
    const response = await apiClient.post(`/admin/pembayaran/verifikasi/${id}`, { 
      status, 
      catatan_admin: alasan 
    });
    
    if (response.success) {
      alert(status === 'dikonfirmasi' ? "Pembayaran berhasil dikonfirmasi!" : "Pembayaran telah ditolak.");
      // Redirect balik ke list utama setelah sukses verify
      router.push({ name: 'DaftarPesanan' });
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memproses verifikasi.');
  } finally {
    processingAction.value = null;
  }
};

// Helpers
const formatPrice = (p) => new Intl.NumberFormat('id-ID').format(p);
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const calculateDuration = (inDate, outDate) => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
};

const getStatusColor = (status) => {
    switch (status) {
        case 'menunggu_pembayaran': return 'warning';
        case 'menunggu_konfirmasi': return 'info';
        case 'dibayar': // Assuming dibayar is confirmed or similar
        case 'dikonfirmasi': return 'success';
        case 'batal': return 'error';
        default: return 'grey';
    }
};

const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || 'Unknown';
};

onMounted(() => {
    if (currentId.value) {
        fetchDetail(currentId.value);
    } else {
        // Jika dibuka tanpa ID, redirect ke list utama
        router.replace({ name: 'ListPemesanan' });
    }
});
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