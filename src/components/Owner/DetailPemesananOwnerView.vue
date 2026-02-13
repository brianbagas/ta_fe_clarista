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
                         {{ formatStatusLabel(pesanan.status_pemesanan) }}
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
                    
                    <v-btn
                        v-if="canMarkNoShow"
                        color="error"
                        variant="flat"
                        class="ml-2"
                        prepend-icon="mdi-account-cancel"
                        @click="noShowDialog = true"
                    >
                        Tandai Tidak Datang
                    </v-btn>
                    
                    <v-btn
                        v-if="pesanan.status_pemesanan === 'menunggu_konfirmasi'"
                        color="primary"
                        variant="flat"
                        class="ml-2"
                        prepend-icon="mdi-cash-check"
                        :to="`/admin/verifikasi-pembayaran/${pesanan.id}`"
                    >
                        Verifikasi
                    </v-btn>
                </div>
            </div>
            
            <v-card-text class="pa-6">
                <v-row>
                    <v-col cols="12" md="6">
                        <div class="d-flex text-start mb-4">
                            <v-avatar color="primary" variant="tonal" class="mr-3">
                                <v-icon>mdi-account</v-icon>
                            </v-avatar>
                            <div>
                                <div class="text-subtitle-2 text-grey">Tamu</div>
                                <div class="text-body-1 font-weight-medium">{{ pesanan.user.name }}</div>
                                <div class="text-caption">{{ pesanan.user.email }}</div>
                                <div v-if="pesanan.user.no_hp" class="text-caption d-flex align-center">
                                    <v-icon size="x-small" class="mr-1">mdi-phone</v-icon>
                                    {{ pesanan.user.no_hp }}
                                </div>
                            </div>
                        </div>
                    </v-col>
                    
                    <v-divider vertical class="d-none d-md-flex mx-4" inset></v-divider>

                    <v-col cols="12" md="5">
                         <div class="d-flex text-start mb-4">
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
                                    <th class="text-left text-caption font-weight-bold text-uppercase text-grey-darken-1">Catatan</th>
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
                                    <td class="text-left text-caption" style="max-width: 150px;">
                                        <span v-if="placement.catatan" class="text-grey-darken-2">{{ placement.catatan }}</span>
                                        <span v-else class="text-grey-lighten-1 font-italic">-</span>
                                    </td>
                                    <td class="text-right pr-6">
                                        <div class="d-flex justify-end gap-2">
                                            <!-- Tombol Check Out -->
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

                                            <!-- Tombol Ganti Unit (Baru) -->
                                            <v-btn
                                                v-if="placement.status_penempatan !== 'checked_out' && placement.status_penempatan !== 'cancelled'"
                                                color="warning"
                                                size="small"
                                                variant="tonal"
                                                prepend-icon="mdi-swap-horizontal"
                                                class="text-none"
                                                @click="openGantiUnitDialog(detail, placement)"
                                            >
                                                Ganti Unit
                                            </v-btn>

                                        <v-btn
                                            v-if="placement.status_penempatan === 'pending' && pesanan.status_pemesanan !== 'batal'"
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
                                            <span v-if="['checked_out', 'cancelled', 'selesai'].includes(placement.status_penempatan)">
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
                                        </div>
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
             <v-card-text class="d-flex justify-space-between text-start pa-6">
                 <div>
                    <div class="text-h6 font-weight-bold text-grey-darken-3">Total Tagihan</div>
                    <div class="text-caption text-grey">Sudah termasuk pajak & biaya layanan</div>
                 </div>
                 <div class="text-h3 font-weight-bold text-primary">Rp {{ formatPrice(pesanan.total_bayar) }}</div>
             </v-card-text>
        </v-card>

    </div>

    <!-- Dialog Tidak Datang -->
    <v-dialog v-model="noShowDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white d-flex align-center">
          <v-icon start class="mr-2">mdi-account-cancel</v-icon>
          Tandai Tidak Datang
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-3">Apakah Anda yakin pelanggan ini tidak datang?</p>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            <strong>Order #{{ pesanan.kode_booking }}</strong><br>
            Tindakan ini akan membatalkan pesanan dan merilis kamar untuk booking lain.
          </v-alert>
          <v-alert type="info" variant="tonal" density="compact">
            <strong>Catatan:</strong> Pastikan Anda sudah mencoba menghubungi pelanggan sebelum menandai sebagai tidak datang.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="noShowDialog = false">Batal</v-btn>
          <v-btn 
            color="error" 
            variant="flat" 
            @click="confirmMarkNoShow" 
            :loading="markingNoShow"
          >
            Ya, Tandai Tidak Datang
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <!-- Dialog Ganti Unit -->
    <v-dialog v-model="gantiUnitDialog" max-width="500">
        <v-card>
            <v-card-title>Ganti Unit Kamar</v-card-title>
            <v-card-text>
                <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                    Unit saat ini: <strong>{{ selectedPlacement?.kamar_unit?.nomor_unit }}</strong>
                </v-alert>

                <v-select
                    v-model="selectedRoomTypeId"
                    :items="roomTypes"
                    item-title="tipe_kamar"
                    item-value="id_kamar"
                    label="Pilih Tipe Kamar (Upgrade/Downgrade Gratis)"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                ></v-select>

                <v-select
                    v-model="newUnitId"
                    :items="availableUnits"
                    item-title="nomor_unit"
                    item-value="id"
                    label="Pilih Unit Baru"
                    variant="outlined"
                    :loading="loadingUnits"
                    :no-data-text="loadingUnits ? 'Memuat...' : 'Tidak ada unit tersedia'"
                ></v-select>

                <v-checkbox
                    v-model="markAsMaintenance"
                    label="Tandai unit lama sebagai 'Maintenance' (Rusak/Perlu Perbaikan)?"
                    density="compact"
                    color="error"
                ></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="gantiUnitDialog = false">Batal</v-btn>
                <v-btn 
                    color="primary" 
                    variant="flat" 
                    @click="confirmGantiUnit" 
                    :loading="swapping"
                    :disabled="!newUnitId"
                >
                    Simpan Perubahan
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Check-in dengan Catatan -->
    <v-dialog v-model="checkInDialog" max-width="500">
        <v-card>
            <v-card-title class="text-h6 bg-primary text-white d-flex align-center">
                <v-icon start class="mr-2">mdi-login</v-icon>
                Konfirmasi Check-in
            </v-card-title>
            <v-card-text class="pt-4">
                <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                    Tamu akan di-check-in ke unit <strong>{{ checkInTarget.unitLabel }}</strong>.
                </v-alert>
                <v-textarea
                    v-model="checkInCatatan"
                    label="Catatan Check-in (Opsional)"
                    placeholder="Contoh: Tamu request extra bantal, late check-in, dll."
                    variant="outlined"
                    rows="3"
                    counter="500"
                    maxlength="500"
                    persistent-counter
                ></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="checkInDialog = false">Batal</v-btn>
                <v-btn 
                    color="primary" 
                    variant="flat" 
                    @click="confirmCheckIn" 
                    :loading="checkingIn"
                    prepend-icon="mdi-login"
                >
                    Proses Check-in
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
import { ref, onMounted, reactive, watch, computed } from 'vue'; // Added watch, computed
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

// State Tidak Datang
const noShowDialog = ref(false);
const markingNoShow = ref(false);

// State Ganti Unit
const gantiUnitDialog = ref(false);
const selectedPlacement = ref(null);
const availableUnits = ref([]);
const newUnitId = ref(null);
const markAsMaintenance = ref(false);
const loadingUnits = ref(false);
const swapping = ref(false);
const roomTypes = ref([]); // List semua tipe kamar
const selectedRoomTypeId = ref(null); // Tipe kamar yang dipilih untuk swap

// State Check-in Dialog
const checkInDialog = ref(false);
const checkInCatatan = ref('');
const checkingIn = ref(false);
const checkInTarget = ref({ detailId: null, unitId: null, placementId: null, unitLabel: '' });

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

const fetchRoomTypes = async () => {
    try {
        const response = await apiClient.get('/kamar'); // Public route list kamar
        if (response.success) {
            roomTypes.value = response.data;
        }
    } catch (e) {
        console.error("Gagal load tipe kamar", e);
    }
};

const fetchAvailableUnits = async () => {
    if (!selectedRoomTypeId.value || !pesanan.value) return;
    
    loadingUnits.value = true;
    availableUnits.value = [];
    
    try {
        const response = await apiClient.get('/admin/available-units', { 
            params: { 
                kamar_id: selectedRoomTypeId.value,
                check_in: pesanan.value.tanggal_check_in,
                check_out: pesanan.value.tanggal_check_out
            } 
        });

        if (response.success) {
            // Filter unit biar gak pilih diri sendiri (hanya jika tipe kamarnya sama dgn yang sekarang)
            // Jika upgrade ke tipe lain, tampilkan semua.
            if (selectedPlacement.value && selectedPlacement.value.kamar_unit?.kamar_id === selectedRoomTypeId.value) {
                 availableUnits.value = response.data.filter(u => u.id !== selectedPlacement.value.kamar_unit_id);
            } else {
                 availableUnits.value = response.data;
            }
        }
    } catch (err) {
        console.error(err);
        showSnackbar('error', 'Gagal memuat daftar unit');
    } finally {
        loadingUnits.value = false;
    }
};

// Watch perubahan tipe kamar untuk load unit baru
watch(selectedRoomTypeId, () => {
    fetchAvailableUnits();
});

// --- GANTI UNIT LOGIC ---
const openGantiUnitDialog = async (detail, placement) => {
    selectedPlacement.value = placement;
    newUnitId.value = null;
    markAsMaintenance.value = false;
    
    // Ensure room types are loaded
    if (roomTypes.value.length === 0) {
        await fetchRoomTypes();
    }

    // Set default tipe kamar ke tipe kamar asal
    // Gunakan id_kamar dari detail (fallback ke object kamar jika id flat tidak ada)
    // Pastikan tipe data sama (Number)
    const currentKamarId = detail.kamar_id || detail.kamar?.id_kamar;
    selectedRoomTypeId.value = currentKamarId ? Number(currentKamarId) : null;

    gantiUnitDialog.value = true;
    
    // Fetch ulang unit (akan ditrigger oleh watcher juga, tapi kita panggil explicit agar aman saat dialog buka)
    await fetchAvailableUnits();
};

const confirmGantiUnit = async () => {
    if (!newUnitId.value) return;

    swapping.value = true;
    try {
        const response = await apiClient.post('/admin/ganti-unit', {
            penempatan_id: selectedPlacement.value.id,
            new_kamar_unit_id: newUnitId.value,
            old_unit_status: markAsMaintenance.value ? 'maintenance' : 'kotor'
        });

        if (response.success) {
            showSnackbar('success', response.message);
            gantiUnitDialog.value = false;
            await fetchPesanan(); // Refresh data
        } else {
            showSnackbar('error', response.message);
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal mengganti unit');
    } finally {
        swapping.value = false;
    }
};



// 3.5 Action Check In (Existing Pending Unit) - Buka Dialog
const handlePendingCheckIn = (detailId, unitId, placementId) => {
    // Cari label unit untuk ditampilkan di dialog
    let unitLabel = '';
    if (pesanan.value?.detail_pemesanans) {
        for (const detail of pesanan.value.detail_pemesanans) {
            const placement = detail.penempatan_kamars?.find(p => p.id === placementId);
            if (placement) {
                unitLabel = placement.kamar_unit?.nomor_unit || '';
                break;
            }
        }
    }

    checkInTarget.value = { detailId, unitId, placementId, unitLabel };
    checkInCatatan.value = '';
    checkInDialog.value = true;
};

// Konfirmasi Check-in dari Dialog
const confirmCheckIn = async () => {
    const { detailId, unitId, placementId } = checkInTarget.value;
    checkingIn.value = true;
    loadingAction.value = placementId;
    try {
        const response = await apiClient.post('/admin/check-in', {
            detail_pemesanan_id: detailId,
            kamar_unit_id: unitId,
            catatan: checkInCatatan.value || null
        });
        
        if (response.success) {
            showSnackbar('success', response.message || 'Berhasil Check-in!');
            checkInDialog.value = false;
            await fetchPesanan();
        } else {
            showSnackbar('error', response.message || 'Gagal Check-in');
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal Check-in');
    } finally {
        checkingIn.value = false;
        loadingAction.value = null;
    }
};

// 4. Action Check Out
const handleCheckOut = async (penempatanId) => {
    if(!confirm("Konfirmasi tamu keluar (Check-out) ? Unit akan diset KOTOR dan perlu dibersihkan.")) return;

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

// 6. Mark as Tidak Datang
const confirmMarkNoShow = async () => {
    markingNoShow.value = true;
    try {
        const response = await apiClient.post(`/admin/pemesanan/${pesananId}/mark-no-show`);
        
        if (response.success) {
            showSnackbar('success', response.message || 'Pesanan berhasil ditandai sebagai tidak datang');
            noShowDialog.value = false;
            await fetchPesanan();
        } else {
            showSnackbar('error', response.message || 'Gagal menandai pesanan sebagai tidak datang');
        }
    } catch (err) {
        showSnackbar('error', err.response?.data?.message || 'Gagal menandai pesanan sebagai tidak datang');
    } finally {
        markingNoShow.value = false;
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
    if (status === 'tidak_datang') return 'grey-darken-3';
    return 'grey';
};

const formatStatusLabel = (status) => {
    const labels = {
        'menunggu_pembayaran': 'Menunggu Pembayaran',
        'menunggu_konfirmasi': 'Menunggu Konfirmasi',
        'dikonfirmasi': 'Dikonfirmasi',
        'selesai': 'Selesai',
        'batal': 'Batal',
        'tidak_datang': 'Tidak Datang'
    };
    return labels[status] || status.replace('_', ' ');
};

// Computed: Check if can mark tidak datang
const canMarkNoShow = computed(() => {
    if (!pesanan.value) return false;
    
    // 1. Status harus dikonfirmasi
    if (pesanan.value.status_pemesanan !== 'dikonfirmasi') return false;
    
    // 2. Tanggal check-in harus hari ini atau sudah lewat
    const checkInDate = new Date(pesanan.value.tanggal_check_in);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    
    if (checkInDate > today) return false;
    
    // 3. Belum ada yang check-in (semua check_in_aktual masih null)
    const hasCheckedIn = pesanan.value.detail_pemesanans?.some(detail => 
        detail.penempatan_kamars?.some(p => p.check_in_aktual !== null)
    );
    
    return !hasCheckedIn;
});

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

onMounted(() => {
    fetchPesanan();
    fetchRoomTypes();
});
</script>

<style scoped>
.border-primary {
    border-top: 4px solid #1976D2 !important;
}
.border-dashed {
    border: 1px dashed #1976D2;
}
.gap-2 { gap: 8px; }
</style>