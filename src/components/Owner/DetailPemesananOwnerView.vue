<template>
  <v-container>
    <div class="d-flex w-100 mb-4">
        <v-btn to="/admin/pesanan" variant="text" prepend-icon="mdi-arrow-left">
        Kembali ke Riwayat
        </v-btn>
    </div>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-2 text-grey">Memuat detail pesanan...</p>
    </div>
    
    <v-alert v-else-if="error" type="error" prominent>{{ error }}</v-alert>

    <div v-else-if="pesanan">
        <!-- Header Pesanan -->
        <v-card elevation="0" border class="mb-6 rounded-lg">
            <div class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5 border-b">
                <div>
                    <h1 class="text-h5 font-weight-bold text-primary">Order #{{ pesanan.kode_booking }}</h1>
                    <div class="text-caption text-grey-darken-1">Dibuat pada: {{ formatDate(pesanan.created_at) }}</div>
                </div>
                <div class="d-flex align-center gap-2">
                    <v-chip :color="getStatusColor(pesanan.status_pemesanan)" variant="elevated" class="text-uppercase font-weight-bold mr-2">
                         {{ pesanan.status_pemesanan.replace('_', ' ') }}
                    </v-chip>
                    
                    <v-btn 
                        v-if="['menunggu_pembayaran', 'menunggu_konfirmasi', 'dikonfirmasi'].includes(pesanan.status_pemesanan)"
                        color="error"
                        variant="tonal"
                        prepend-icon="mdi-close"
                        @click="cancelDialog = true"
                    >
                        Batalkan
                    </v-btn>
                </div>
            </div>
            
            <v-card-text class="pa-6">
                <v-row>
                    <v-col cols="12" md="6">
                        <div class="d-flex align-center mb-4">
                            <v-avatar color="primary" variant="tonal" class="mr-3">
                                <v-icon>mdi-account</v-icon>
                            </v-avatar>
                            <div>
                                <div class="text-subtitle-2 text-grey">Tamu</div>
                                <div class="text-body-1 font-weight-medium">{{ pesanan.user.name }}</div>
                                <div class="text-caption">{{ pesanan.user.email }}</div>
                            </div>
                        </div>
                    </v-col>
                    
                    <v-divider vertical class="d-none d-md-flex mx-4" inset></v-divider>

                    <v-col cols="12" md="5">
                         <div class="d-flex align-center mb-4">
                            <v-avatar color="info" variant="tonal" class="mr-3">
                                <v-icon>mdi-calendar-range</v-icon>
                            </v-avatar>
                            <div>
                                <div class="text-subtitle-2 text-grey">Jadwal Menginap</div>
                                <div class="text-body-1 font-weight-medium">
                                    {{ formatDate(pesanan.tanggal_check_in) }} — {{ formatDate(pesanan.tanggal_check_out) }}
                                </div>
                                <div class="text-caption text-primary font-weight-bold">
                                    {{ calculateDuration(pesanan.tanggal_check_in, pesanan.tanggal_check_out) }} Malam
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Bagian Operasional Check-in / Check-out -->
        <h2 class="text-h6 font-weight-bold mb-4 mt-8 d-flex align-center">
            <v-icon start color="primary" class="mr-2">mdi-bed-outline</v-icon>
            Manajemen Kamar & Akses
        </h2>

        <div v-for="detail in pesanan.detail_pemesanans" :key="detail.id" class="mb-4">
            <v-card elevation="0" border class="rounded-lg overflow-hidden">
                <div class="bg-blue-lighten-5 px-4 py-3 d-flex justify-space-between align-center">
                    <span class="text-subtitle-1 font-weight-bold text-blue-darken-3">
                        {{ detail.kamar.tipe_kamar }} <span class="text-body-2 font-weight-regular text-grey-darken-2 ms-2">({{ detail.jumlah_kamar }} Unit)</span>
                    </span>
                </div>

                <v-card-text class="pa-0">
                    <!-- List Unit yang Sudah Check-in -->
                    <div v-if="detail.penempatan_kamars && detail.penempatan_kamars.length > 0">
                        <v-table density="comfortable" hover>
                            <thead class="bg-grey-lighten-4">
                                <tr>
                                    <th class="text-left text-caption font-weight-bold text-uppercase text-grey-darken-1 pl-6">Unit</th>
                                    <th class="text-left text-caption font-weight-bold text-uppercase text-grey-darken-1">Status</th>
                                    <th class="text-center text-caption font-weight-bold text-uppercase text-grey-darken-1">Check In</th>
                                    <th class="text-center text-caption font-weight-bold text-uppercase text-grey-darken-1">Check Out</th>
                                    <th class="text-right text-caption font-weight-bold text-uppercase text-grey-darken-1 pr-6">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="placement in detail.penempatan_kamars" :key="placement.id">
                                    <td class="text-left pl-6 font-weight-bold text-body-2">
                                        {{ placement.kamar_unit ? placement.kamar_unit.nomor_unit : '?' }}
                                    </td>
                                    <td class="text-left">
                                        <v-chip 
                                            size="x-small" 
                                            :color="getPlacementColor(placement.status_penempatan)"
                                            class="font-weight-bold"
                                        >
                                            {{ placement.status_penempatan.toUpperCase() }}
                                        </v-chip>
                                    </td>
                                    <td class="text-center text-caption">{{ placement.check_in_aktual ? formatTime(placement.check_in_aktual) : '-' }}</td>
                                    <td class="text-center text-caption">{{ placement.check_out_aktual ? formatTime(placement.check_out_aktual) : '-' }}</td>
                                    <td class="text-right pr-6">
                                        <v-btn
                                            v-if="placement.status_penempatan === 'assigned'"
                                            color="error"
                                            size="small"
                                            variant="tonal"
                                            prepend-icon="mdi-logout"
                                            class="text-none"
                                            :loading="loadingAction === placement.id"
                                            @click="handleCheckOut(placement.id)"
                                        >
                                            Check Out
                                        </v-btn>

                                        <v-btn
                                            v-else-if="placement.status_penempatan === 'pending' && pesanan.status_pemesanan !== 'batal'"
                                            color="primary"
                                            size="small"
                                            variant="flat"
                                            prepend-icon="mdi-login"
                                            class="text-none"
                                            :disabled="pesanan.status_pemesanan === 'menunggu_pembayaran'"
                                            :loading="loadingAction === placement.id"
                                            @click="handlePendingCheckIn(detail.id, placement.kamar_unit_id, placement.id)"
                                        >
                                            Proses Masuk
                                        </v-btn>
                                        <span v-else>
                                            <v-btn
                                                v-if="placement.status_penempatan === 'checked_out' && placement.kamar_unit?.status_unit !== 'available'"
                                                color="success"
                                                size="small"
                                                variant="outlined"
                                                prepend-icon="mdi-broom"
                                                class="text-none"
                                                :loading="loadingAction === placement.id"
                                                @click="handleSetAvailable(placement.kamar_unit_id, placement.id)"
                                            >
                                                Sudah Bersih
                                            </v-btn>
                                            <span v-else class="text-caption text-grey italic ml-2">
                                                {{ placement.status_penempatan === 'cancelled' ? 'Dibatalkan' : 'Selesai' }}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                
                    <v-alert v-else type="success" variant="tonal" class="ma-4" density="compact">
                        Semua kamar telah ditempatkan.
                    </v-alert>

                </v-card-text>
            </v-card>
        </div>

        <!-- Rincian Biaya Bottom -->
        <v-card elevation="0" class="mt-8 bg-grey-lighten-4 rounded-lg border-dashed">
             <v-card-text class="d-flex justify-space-between align-center pa-6">
                 <div>
                    <div class="text-h6 font-weight-bold text-grey-darken-3">Total Tagihan</div>
                    <div class="text-caption text-grey">Sudah termasuk pajak & biaya layanan</div>
                 </div>
                 <div class="text-h3 font-weight-bold text-primary">Rp {{ formatPrice(pesanan.total_bayar) }}</div>
             </v-card-text>
        </v-card>

    </div>

    <!-- Cancel Booking Dialog -->
    <v-dialog v-model="cancelDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          Batalkan Pemesanan
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-3">Apakah Anda yakin ingin membatalkan pemesanan ini?</p>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            <strong>Order #{{ pesanan.kode_booking }}</strong><br>
            Tindakan ini akan membatalkan seluruh pemesanan.
          </v-alert>
          <v-textarea
            v-model="cancelReason"
            label="Alasan Pembatalan (Wajib)"
            placeholder="Contoh: Tamu membatalkan karena perubahan jadwal"
            variant="outlined"
            rows="3"
            :rules="[v => !!v || 'Alasan wajib diisi', v => (v && v.length >= 10) || 'Alasan minimal 10 karakter']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelDialog = false">Batal</v-btn>
          <v-btn 
            color="error" 
            variant="flat" 
            @click="confirmCancelBooking" 
            :loading="cancelling"
            :disabled="!cancelReason || cancelReason.length < 10"
          >
            Ya, Batalkan Pesanan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../../axios';

// State
const route = useRoute();
const pesananId = route.params.id;
const pesanan = ref(null);
const loading = ref(true);
const error = ref(null);
const loadingAction = ref(null);

// Data Pendukung
const snackbar = ref({ show: false, text: '', color: '' });
const cancelDialog = ref(false);
const cancelReason = ref('');
const cancelling = ref(false);

// 1. Fetch Detail Pesanan
const fetchPesanan = async () => {
    loading.value = true;
    try {
        const response = await apiClient.get(`/admin/pemesanan/${pesananId}`);
        if (response.success) {
            pesanan.value = response.data;
            
            // Inisialisasi unit list untuk setiap kamar agar reaktif
            // if(pesanan.value.detail_pemesanans) {
            //     pesanan.value.detail_pemesanans.forEach(d => {
            //         // fetchUnits(d.kamar_id); // Auto fetch removed
            //     });
            // }
        } else {
            error.value = response.message || 'Gagal memuat detail pesanan.';
        }
    } catch (err) {
        error.value = err.response?.data?.message || 'Gagal memuat detail pesanan.';
        console.error(err);
    } finally {
        loading.value = false;
    }
};



// 3.5 Action Check In (Existing Pending Unit)
const handlePendingCheckIn = async (detailId, unitId, placementId) => {
    if(!confirm("Konfirmasi tamu masuk (Check-in) ke unit ini?")) return;
    
    loadingAction.value = placementId;
    try {
        const response = await apiClient.post('/admin/check-in', {
            detail_pemesanan_id: detailId,
            kamar_unit_id: unitId
        });
        
        if (response.success) {
            showSnackbar('success', response.message || 'Berhasil Check-in!');
            await fetchPesanan();
        } else {
            showSnackbar('error', response.message || 'Gagal Check-in');
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal Check-in');
    } finally {
        loadingAction.value = null;
    }
};

// 4. Action Check Out
const handleCheckOut = async (penempatanId) => {
    if(!confirm("Konfirmasi tamu keluar (Check-out) ? Unit akan diset MAINTENANCE.")) return;

    loadingAction.value = penempatanId;
    try {
        const response = await apiClient.post(`/admin/check-out/${penempatanId}`);
        if (response.success) {
            showSnackbar('success', response.message || 'Berhasil Check-out!');
            await fetchPesanan();
        } else {
            showSnackbar('error', response.message || 'Gagal Check-out');
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal Check-out');
    } finally {
        loadingAction.value = null;
    }
};

// Action Set Available 
const handleSetAvailable = async (unitId, placementId) => {
    if(!confirm("Pastikan kamar sudah dibersihkan. Set status menjadi AVAILABLE?")) return;

    loadingAction.value = placementId;
    try {
        // Kita gunakan endpoint set-available yang sudah ada check di backend
        const response = await apiClient.put(`/admin/kamar-units/${unitId}`, {
            status_unit: 'available'
        });
        
        if (response.success) {
            showSnackbar('success', 'Status unit berhasil diubah menjadi AVAILABLE.');
            await fetchPesanan();
        } else {
            showSnackbar('error', response.message || 'Gagal mengubah status unit');
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal mengubah status unit');
    } finally {
        loadingAction.value = null;
    }
};

// 5. Cancel Booking by Owner
const confirmCancelBooking = async () => {
    if (!cancelReason.value) {
        showSnackbar('error', 'Alasan pembatalan wajib diisi');
        return;
    }
    
    cancelling.value = true;
    try {
        const response = await apiClient.post(`/admin/pemesanan/${pesananId}/cancel`, {
            alasan: cancelReason.value
        });
        
        if (response.success) {
            showSnackbar('success', response.message || 'Pemesanan berhasil dibatalkan');
            cancelDialog.value = false;
            cancelReason.value = '';
            await fetchPesanan();
        } else {
            showSnackbar('error', response.message || 'Gagal membatalkan pemesanan');
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal membatalkan pemesanan');
    } finally {
        cancelling.value = false;
    }
};




// Helpers
const getUnassignedCount = (detail) => {
    const assigned = detail.penempatan_kamars ? detail.penempatan_kamars.filter(p => ['assigned', 'pending'].includes(p.status_penempatan)).length : 0;
    // Kita ijinkan checkin sebanyak jumlah kamar pesanan
    // Jika 1 kamar tapi history check-in sudah 5 (karena gonta ganti), tetap harus hitung yg AKTIF saja
    return Math.max(0, detail.jumlah_kamar - assigned);
};

const getStatusColor = (status) => {
    if (status === 'dikonfirmasi' || status === 'selesai' || status === 'confirmed') return 'success';
    if (status === 'menunggu_pembayaran') return 'warning';
    return 'grey';
};

const getPlacementColor = (status) => {
    switch(status) {
        case 'assigned': return 'success';
        case 'pending': return 'warning';
        case 'cancelled': return 'error';
        default: return 'grey';
    }
};

const calculateDuration = (inDate, outDate) => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
};

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const formatPrice = (p) => new Intl.NumberFormat('id-ID').format(p);

const showSnackbar = (color, text) => {
    snackbar.value = { show: true, color, text };
};

onMounted(fetchPesanan);
</script>

<style scoped>
.border-primary {
    border-top: 4px solid #1976D2 !important;
}
.border-dashed {
    border: 1px dashed #1976D2;
}
</style>