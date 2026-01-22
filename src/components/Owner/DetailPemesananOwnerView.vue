<template>
  <v-container>
    <v-btn to="/admin/pemesanan" variant="text" class="mb-4">
      <v-icon left>mdi-arrow-left</v-icon>
      Kembali ke Riwayat
    </v-btn>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-2 text-grey">Memuat detail pesanan...</p>
    </div>
    
    <v-alert v-else-if="error" type="error" prominent>{{ error }}</v-alert>

    <div v-else-if="pesanan">
        <!-- Header Pesanan -->
        <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center bg-grey-lighten-4 pa-4">
                <div>
                    <div class="text-h5 font-weight-bold">Detail Transaksi</div>
                    <div class="text-subtitle-2 text-grey">Kode Booking: #{{ pesanan.id }}</div>
                </div>
                <v-chip :color="getStatusColor(pesanan.status_pemesanan)" size="large" label class="text-uppercase font-weight-bold">
                {{ pesanan.status_pemesanan.replace('_', ' ') }}
                </v-chip>
            </v-card-title>
            
            <v-card-text class="pa-4">
                <v-row>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-1 font-weight-bold mb-1">Data Tamu</div>
                        <v-list density="compact" class="pa-0">
                             <v-list-item prepend-icon="mdi-account" class="px-0">
                                <v-list-item-title>{{ pesanan.user.name }}</v-list-item-title>
                             </v-list-item>
                             <v-list-item prepend-icon="mdi-email" class="px-0">
                                <v-list-item-title>{{ pesanan.user.email }}</v-list-item-title>
                             </v-list-item>
                        </v-list>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="text-subtitle-1 font-weight-bold mb-1">Informasi Inap</div>
                        <v-list density="compact" class="pa-0">
                            <v-list-item prepend-icon="mdi-calendar-arrow-right" class="px-0">
                                <v-list-item-title>Check In: {{ formatDate(pesanan.tanggal_check_in) }}</v-list-item-title>
                            </v-list-item>
                             <v-list-item prepend-icon="mdi-calendar-arrow-left" class="px-0">
                                <v-list-item-title>Check Out: {{ formatDate(pesanan.tanggal_check_out) }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Bagian Operasional Check-in / Check-out -->
        <h2 class="text-h6 font-weight-bold mb-3 d-flex align-center">
            <v-icon start color="primary">mdi-door-open</v-icon>
            Manajemen Kamar & Check-in
        </h2>

        <div v-for="detail in pesanan.detail_pemesanans" :key="detail.id" class="mb-6">
            <v-card elevation="2" class="border-t-4 border-primary">
                <v-card-title class="d-flex justify-space-between">
                    <span>
                        {{ detail.kamar.tipe_kamar }} <span class="text-grey text-subtitle-1">(x{{ detail.jumlah_kamar }})</span>
                    </span>
                    <v-chip color="blue" size="small" variant="flat">ID Detail: {{ detail.id }}</v-chip>
                </v-card-title>

                <v-card-text>
                    <!-- List Unit yang Sudah Check-in -->
                    <div v-if="detail.penempatan_kamars && detail.penempatan_kamars.length > 0">
                        <div class="text-subtitle-2 mb-2">Unit Terisi:</div>
                        <v-table density="compact" class="mb-4 bg-grey-lighten-5 rounded">
                            <thead>
                                <tr>
                                    <th>Unit</th>
                                    <th>Status</th>
                                    <th>Waktu Masuk</th>
                                    <th>Waktu Keluar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="placement in detail.penempatan_kamars" :key="placement.id">
                                    <td class="font-weight-bold text-primary">
                                        {{ placement.kamar_unit ? placement.kamar_unit.nama_unit : 'Unit Terhapus' }}
                                    </td>
                                    <td>
                                        <v-chip size="x-small" :color="placement.status_penempatan === 'assigned' ? 'success' : 'grey'">
                                            {{ placement.status_penempatan.toUpperCase() }}
                                        </v-chip>
                                    </td>
                                    <td>{{ formatTime(placement.check_in_aktual) }}</td>
                                    <td>{{ placement.check_out_aktual ? formatTime(placement.check_out_aktual) : '-' }}</td>
                                    <td>
                                        <v-btn
                                            v-if="placement.status_penempatan === 'assigned'"
                                            color="error"
                                            size="x-small"
                                            variant="flat"
                                            prepend-icon="mdi-logout"
                                            :loading="loadingAction === placement.id"
                                            @click="handleCheckOut(placement.id)"
                                        >
                                            Check Out
                                        </v-btn>
                                        <span v-else class="text-caption text-grey italic">Selesai</span>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                
                    <!-- Form Check New Unit -->
                    <div v-if="getUnassignedCount(detail) > 0" class="mt-3 pa-3 bg-blue-lighten-5 rounded border-dashed">
                       <div class="d-flex align-center justify-space-between mb-2">
                           <div class="text-subtitle-2 text-blue-darken-3">
                               <v-icon start size="small">mdi-plus-circle</v-icon>
                               Input Check-in Baru (Sisa: {{ getUnassignedCount(detail) }})
                           </div>
                       </div>
                       
                       <v-row dense align="center">
                           <v-col cols="12" sm="8">
                               <v-select
                                   v-model="selectedUnits[detail.id]"
                                   :items="availableUnits[detail.kamar_id] || []"
                                   item-title="nama_unit"
                                   item-value="id"
                                   label="Pilih Unit Kamar Fisik"
                                   density="compact"
                                   variant="outlined"
                                   hide-details
                                   placeholder="Pilih nomor kamar..."
                                   @click="fetchUnits(detail.kamar_id)"
                               ></v-select>
                           </v-col>
                           <v-col cols="12" sm="4">
                               <v-btn 
                                   block 
                                   color="primary" 
                                   prepend-icon="mdi-login"
                                   :disabled="!selectedUnits[detail.id]"
                                   :loading="loadingAction === 'in-' + detail.id"
                                   @click="handleCheckIn(detail.id, selectedUnits[detail.id])"
                               >
                                   Proses Masuk
                               </v-btn>
                           </v-col>
                       </v-row>
                    </div>

                    <v-alert v-else type="success" variant="tonal" density="compact" class="mt-2" border="start">
                        Semua kamar pada detail pesanan ini telah ditempatkan.
                    </v-alert>

                </v-card-text>
            </v-card>
        </div>


        <!-- Rincian Biaya Bottom -->
        <v-card variant="flat" class="mt-6 bg-grey-lighten-4">
             <v-card-text class="d-flex justify-space-between align-center">
                 <div class="text-h6 text-grey-darken-1">Total Tagihan</div>
                 <div class="text-h4 font-weight-bold text-primary">Rp {{ formatPrice(pesanan.total_bayar) }}</div>
             </v-card-text>
        </v-card>

    </div>

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
const availableUnits = reactive({}); // penyimpanan cache unit { kamar_id: [list_unit] }
const selectedUnits = reactive({}); // v-model dropdown { detail_id: unit_id }
const snackbar = ref({ show: false, text: '', color: '' });

// 1. Fetch Detail Pesanan
const fetchPesanan = async () => {
    loading.value = true;
    try {
        const response = await apiClient.get(`/admin/pemesanan/${pesananId}`);
        pesanan.value = response.data;
        
        // Inisialisasi unit list untuk setiap kamar agar reaktif
        if(pesanan.value.detail_pemesanans) {
            pesanan.value.detail_pemesanans.forEach(d => {
                fetchUnits(d.kamar_id); // Auto fetch units saat load
            });
        }
    } catch (err) {
        error.value = 'Gagal memuat detail pesanan.';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// 2. Fetch Kamar Unit
const fetchUnits = async (kamarId) => {
    // Jika sudah ada data, skip (opsional, kalau mau refresh terus bisa dihapus if-nya)
    // Tapi disini kita load ulang jaga-jaga status berubah
    try {
        const response = await apiClient.get('/kamar_units', { params: { kamar_id: kamarId } });
        // Filter hanya yang available atau maintenance (bisa dipaksa admin? sebaiknya hanya available)
        // Kita tampilkan semua biar admin tau, tapi beri tanda
        availableUnits[kamarId] = response.data.data.map(u => ({
            ...u,
            title: `${u.nama_unit} (${u.status_unit})` // Utk display kalau pakai item-title="title"
        }));
    } catch (err) {
        console.error("Gagal load unit", err);
    }
};

// 3. Action Check In
const handleCheckIn = async (detailId, unitId) => {
    if(!confirm("Konfirmasi tamu masuk (Check-in) ke unit ini?")) return;
    
    loadingAction.value = 'in-' + detailId;
    try {
        await apiClient.post('/admin/check-in', {
            detail_pemesanan_id: detailId,
            kamar_unit_id: unitId
        });
        showSnackbar('success', 'Berhasil Check-in!');
        
        // Reset pilihan & Refresh Data
        selectedUnits[detailId] = null;
        await fetchPesanan(); 
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
        await apiClient.post(`/admin/check-out/${penempatanId}`);
        showSnackbar('success', 'Berhasil Check-out!');
        await fetchPesanan();
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal Check-out');
    } finally {
        loadingAction.value = null;
    }
};


// Helpers
const getUnassignedCount = (detail) => {
    const assigned = detail.penempatan_kamars ? detail.penempatan_kamars.filter(p => p.status_penempatan === 'assigned').length : 0;
    // Kita ijinkan checkin sebanyak jumlah kamar pesanan
    // Jika 1 kamar tapi history check-in sudah 5 (karena gonta ganti), tetap harus hitung yg AKTIF saja
    return Math.max(0, detail.jumlah_kamar - assigned);
};

const getStatusColor = (status) => {
    if (status === 'dikonfirmasi' || status === 'selesai' || status === 'confirmed') return 'success';
    if (status === 'menunggu_pembayaran') return 'warning';
    return 'grey';
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