<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex text-left pe-2 text-h5 bg-grey-lighten-4">
        <v-icon icon="mdi-delete-restore" class="me-2"></v-icon>
        Data Terhapus (Sampah)
      </v-card-title>

      <v-tabs v-model="tab" color="primary">
        <v-tab value="kamar">Kamar</v-tab>
        <v-tab value="kamar_unit">Unit Kamar</v-tab>
        <v-tab value="promo">Promo</v-tab>
        <v-tab value="pemesanan">Pemesanan</v-tab>
        <v-tab value="pembayaran">Pembayaran</v-tab>
        <v-tab value="review">Review</v-tab>
        <v-tab value="bank">Bank Account</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <!-- 1. TAB KAMAR -->
          <v-window-item value="kamar">
            <CrudTable
              :headers="headersKamar"
              :items="dataKamar"
              :loading="loading"
              @restore="restoreItem($event, 'kamar')"
              @force-delete="forceDeleteItem($event, 'kamar')"
            />
          </v-window-item>

          <!-- 2. TAB KAMAR UNIT -->
          <v-window-item value="kamar_unit">
            <CrudTable
              :headers="headersKamarUnit"
              :items="dataKamarUnit"
              :loading="loading"
              @restore="restoreItem($event, 'kamar-unit')"
              @force-delete="forceDeleteItem($event, 'kamar-unit')"
            />
          </v-window-item>

          <!-- 3. TAB PROMO -->
          <v-window-item value="promo">
            <CrudTable
              :headers="headersPromo"
              :items="dataPromo"
              :loading="loading"
              @restore="restoreItem($event, 'promo')"
              @force-delete="forceDeleteItem($event, 'promo')"
            />
          </v-window-item>

          <!-- 4. TAB PEMESANAN -->
          <v-window-item value="pemesanan">
            <CrudTable
              :headers="headersPemesanan"
              :items="dataPemesanan"
              :loading="loading"
              @restore="restoreItem($event, 'pemesanan')"
              @force-delete="forceDeleteItem($event, 'pemesanan')"
            />
          </v-window-item>

          <!-- 5. TAB PEMBAYARAN -->
          <v-window-item value="pembayaran">
            <CrudTable
              :headers="headersPembayaran"
              :items="dataPembayaran"
              :loading="loading"
              @restore="restoreItem($event, 'pembayaran')"
              @force-delete="forceDeleteItem($event, 'pembayaran')"
            />
          </v-window-item>

          <!-- 6. TAB REVIEW -->
          <v-window-item value="review">
            <CrudTable
              :headers="headersReview"
              :items="dataReview"
              :loading="loading"
              @restore="restoreItem($event, 'review')"
              @force-delete="forceDeleteItem($event, 'review')"
            />
          </v-window-item>

          <!-- 7. TAB BANK ACCOUNT -->
          <v-window-item value="bank">
            <CrudTable
              :headers="headersBank"
              :items="dataBank"
              :loading="loading"
              @restore="restoreItem($event, 'bank-account')"
              @force-delete="forceDeleteItem($event, 'bank-account')"
            />
          </v-window-item>

        </v-window>
      </v-card-text>
    </v-card>

    <!-- Dialog Konfirmasi Restore -->
    <v-dialog v-model="dialogRestore" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Restore Data</v-card-title>
        <v-card-text>Anda yakin ingin mengembalikan data ini?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeRestore">Batal</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="restoreConfirm">RESTORE</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Konfirmasi Force Delete -->
    <v-dialog v-model="dialogForceDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 text-error">Hapus Permanen</v-card-title>
        <v-card-text>
          <p class="mb-2">Anda yakin ingin menghapus data ini <strong>PERMANEN</strong>?</p>
          <p class="text-caption text-red">Tindakan ini tidak dapat dibatalkan!</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeForceDelete">Batal</v-btn>
          <v-btn color="red-darken-1" variant="flat" @click="forceDeleteConfirm">HAPUS PERMANEN</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import apiClient from '../../axios';
import CrudTable from './CrudTable.vue'; // Import komponen eksternal

const tab = ref('kamar');
const loading = ref(false);
const snackbar = ref({ show: false, text: '', color: '' });

// Data Refs
const dataKamar = ref([]);
const dataKamarUnit = ref([]);
const dataPromo = ref([]);
const dataPemesanan = ref([]);
const dataPembayaran = ref([]);
const dataReview = ref([]);
const dataBank = ref([]);

// Headers Definitions
const headersKamar = [
  { title: 'Tipe Kamar', key: 'tipe_kamar' },
  { title: 'Harga', key: 'harga' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const headersKamarUnit = [
  { title: 'Nomor Unit', key: 'nomor_unit' },
  { title: 'Tipe Kamar', key: 'kamar.tipe_kamar' },
  { title: 'Status Terakhir', key: 'status_unit' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const headersPromo = [
  { title: 'Nama Promo', key: 'nama_promo' },
  { title: 'Kode', key: 'kode_promo' },
  { title: 'Diskon', key: 'nilai_diskon' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const headersPemesanan = [
  { title: 'Kode Booking', key: 'kode_booking' },
  { title: 'Pemesan', key: 'user.name' },
  { title: 'Total Bayar', key: 'total_bayar' },
  { title: 'Status', key: 'status_pemesanan' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const headersPembayaran = [
  { title: 'Pemesan', key: 'pemesanan.user.name' },
  { title: 'Bank Tujuan', key: 'bank_tujuan' },
  { title: 'Jumlah', key: 'jumlah_bayar' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const headersReview = [
  { title: 'Pelanggan', key: 'user.name' },
  { title: 'Rating', key: 'rating' },
  { title: 'Komentar', key: 'komentar' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const headersBank = [
  { title: 'Bank', key: 'nama_bank' },
  { title: 'No Rekening', key: 'nomor_rekening' },
  { title: 'Atas Nama', key: 'atas_nama' },
  { title: 'Dihapus Pada', key: 'deleted_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

// Dialog State
const dialogRestore = ref(false);
const dialogForceDelete = ref(false);
const editedItem = ref(null);
const currentType = ref('');

// --- Fetch Functions ---
const fetchData = async () => {
  loading.value = true;
  try {
    let url = '';
    switch (tab.value) {
      case 'kamar': url = '/admin/trashed/kamar'; break;
      case 'kamar_unit': url = '/admin/trashed/kamar-unit'; break;
      case 'promo': url = '/admin/trashed/promo'; break;
      case 'pemesanan': url = '/admin/trashed/pemesanan'; break;
      case 'pembayaran': url = '/admin/trashed/pembayaran'; break;
      case 'review': url = '/admin/trashed/review'; break;
      case 'bank': url = '/admin/trashed/bank-account'; break;
    }

    if (url) {
      const response = await apiClient.get(url);
      
      switch (tab.value) {
        case 'kamar': dataKamar.value = response.data; break;
        case 'kamar_unit': dataKamarUnit.value = response.data; break;
        case 'promo': dataPromo.value = response.data; break;
        case 'pemesanan': dataPemesanan.value = response.data; break;
        case 'pembayaran': dataPembayaran.value = response.data; break;
        case 'review': dataReview.value = response.data; break;
        case 'bank': dataBank.value = response.data; break;
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
    snackbar.value = { show: true, text: 'Gagal mengambil data: ' + (error.response?.data?.message || error.message), color: 'error' };
  } finally {
    loading.value = false;
  }
};

// --- Watch Tab Change ---
watch(tab, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});

// --- Action Handlers ---
const restoreItem = (item, type) => {
  editedItem.value = item;
  currentType.value = type;
  dialogRestore.value = true;
};

const forceDeleteItem = (item, type) => {
  editedItem.value = item;
  currentType.value = type;
  dialogForceDelete.value = true;
};

const closeRestore = () => {
  dialogRestore.value = false;
  editedItem.value = null;
  currentType.value = '';
};

const closeForceDelete = () => {
  dialogForceDelete.value = false;
  editedItem.value = null;
  currentType.value = '';
};

const restoreConfirm = async () => {
  try {
    loading.value = true;
    const url = `/admin/trashed/${currentType.value}/${editedItem.value.id || editedItem.value.id_kamar}/restore`;
    await apiClient.post(url);
    
    snackbar.value = { show: true, text: 'Data berhasil dipulihkan (restore)', color: 'success' };
    await fetchData(); // Refresh data
    closeRestore();
  } catch (error) {
    snackbar.value = { show: true, text: 'Gagal memulihkan: ' + (error.response?.data?.message || error.message), color: 'error' };
  } finally {
    loading.value = false;
  }
};

const forceDeleteConfirm = async () => {
  try {
    loading.value = true;
    const url = `/admin/trashed/${currentType.value}/${editedItem.value.id || editedItem.value.id_kamar}`;
    await apiClient.delete(url);
    
    snackbar.value = { show: true, text: 'Data berhasil dihapus PERMANEN', color: 'success' };
    await fetchData(); // Refresh data
    closeForceDelete();
  } catch (error) {
    snackbar.value = { show: true, text: 'Gagal menghapus permanen: ' + (error.response?.data?.message || error.message), color: 'error' };
  } finally {
    loading.value = false;
  }
};
</script>
