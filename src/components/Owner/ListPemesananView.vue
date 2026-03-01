<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
        <div>
             <h1 class="text-h4 font-weight-bold" style="color: #333333;">Manajemen Pesanan</h1>
            <p class="text-grey-darken-1">Lihat dan kelola semua pesanan yang masuk.</p>
        </div>
    </div>

    <v-card elevation="0" border rounded="lg">
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="border-b"
      >
        <v-tab value="semua">Semua</v-tab>
        <v-tab value="menunggu_pembayaran">Menunggu Pembayaran</v-tab>
        <v-tab value="perlu_tindakan">
            Perlu Verifikasi
            <v-badge v-if="counts.perlu_tindakan > 0" :content="counts.perlu_tindakan" color="error" inline class="ml-2"></v-badge>
        </v-tab>
        <v-tab value="terkonfirmasi">
             Terkonfirmasi
             <v-badge v-if="counts.siap_checkin > 0" :content="counts.siap_checkin" color="indigo" inline class="ml-2"></v-badge>
        </v-tab>
        <v-tab value="selesai_batal">Riwayat</v-tab>
      </v-tabs>

      <v-card-title class="pt-4">
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Cari Tamu, Kode Booking..."
          single-line
          hide-details
          variant="outlined"
          density="compact"
          class="mb-2"
          @update:model-value="onSearchChange"
        ></v-text-field>
      </v-card-title>

      <v-data-table-server
        :headers="headers"
        :items="pemesanans"
        :items-length="totalItems"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        :sort-by="[{ key: sortByColumn, order: sortOrder }]"
        loading-text="Memuat data pesanan..."
        no-data-text="Tidak ada pesanan pada kategori ini."
        hover
        @update:options="onTableOptionsChange"
      >
        <template v-slot:[`item.kode_booking`]="{ item }">
            <div class="text-left font-weight-bold">{{ item.kode_booking }}</div>
        </template>

        <template v-slot:[`item.user.name`]="{ item }">
            <div class="text-left">
                <div class="font-weight-medium">{{ item.user.name }}</div>
                <div class="text-caption text-grey">{{ item.user.email }}</div>
            </div>
        </template>

        <template v-slot:[`item.tanggal_check_in`]="{ item }">
             <div class="text-left">{{ formatDate(item.tanggal_check_in) }}</div>
        </template>
        
        <template v-slot:[`item.tanggal_check_out`]="{ item }">
             <div class="text-left">{{ formatDate(item.tanggal_check_out) }}</div>
        </template>

        <template v-slot:[`item.status_pemesanan`]="{ item }">
          <div class="text-left">
            <v-chip :color="getStatusColor(item.status_pemesanan)" size="small" class="font-weight-bold">
                {{ formatStatusLabel(item.status_pemesanan) }}
            </v-chip>
          </div>
        </template>

        <template v-slot:[`item.total_bayar`]="{ item }">
          <div class="text-left font-weight-medium text-grey-darken-3">Rp {{ formatPrice(item.total_bayar) }}</div>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-start gap-2">
            <v-btn 
                v-if="isReadyToCheckIn(item)"
                color="indigo" 
                size="x-small" 
                variant="flat"
                prepend-icon="mdi-login" 
                class="text-none"
                @click="viewDetails(item)"
            >
                Check In
            </v-btn>

            <v-btn 
                v-else-if="item.status_pemesanan === 'menunggu_konfirmasi'"
                color="warning" 
                size="x-small" 
                variant="flat"
                prepend-icon="mdi-file-check" 
                class="text-none"
                :to="`/admin/verifikasi-pembayaran/${item.id}`"
            >
                Verifikasi
            </v-btn>

             <v-btn 
                v-else-if="hasActiveStay(item)"
                color="pink" 
                size="x-small" 
                variant="flat"
                prepend-icon="mdi-logout" 
                class="text-none"
                @click="viewDetails(item)"
            >
                Check Out
            </v-btn>

             <v-btn 
                color="grey-darken-1" 
                variant="text" 
                size="small" 
                icon="mdi-eye"
                @click="viewDetails(item)"
                title="Lihat Detail"
            >
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '../../axios';
import router from '../../router';

const search = ref('');
const loading = ref(true);
const pemesanans = ref([]);
const activeTab = ref('semua');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const sortByColumn = ref('created_at');
const sortOrder = ref('desc');

// Debounce timer untuk search
let searchTimer = null;

const headers = [
  { title: 'Kode Booking', key: 'kode_booking', align: 'start' },
  { title: 'Nama Tamu', key: 'user.name', align: 'start' },
  { title: 'Check-in', key: 'tanggal_check_in', align: 'start' },
  { title: 'Check-out', key: 'tanggal_check_out', align: 'start' },
  { title: 'Tagihan', key: 'total_bayar', align: 'start' },
  { title: 'Status', key: 'status_pemesanan', align: 'start' },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'start' },
];

// Map tab ke query param status
const getStatusParam = () => {
  const tabMap = {
    'semua': null,
    'menunggu_pembayaran': 'menunggu_pembayaran',
    'perlu_tindakan': 'perlu_tindakan',
    'terkonfirmasi': 'dikonfirmasi',
    'selesai_batal': 'selesai_batal',
  };
  return tabMap[activeTab.value] || null;
};

const fetchPemesanan = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: itemsPerPage.value,
      sort_by: sortByColumn.value,
      sort_order: sortOrder.value
    };

    const status = getStatusParam();
    if (status) params.status = status;
    if (search.value) params.search = search.value;

    const response = await apiClient.get('/admin/pemesanan', { params });
    if (response.success) {
      pemesanans.value = response.data.data;
      totalItems.value = response.data.total;
    }
  } catch (err) {
    console.error('Gagal memuat data pemesanan:', err);
  } finally {
    loading.value = false;
  }
};

// Dipanggil saat pagination/sort berubah dari v-data-table-server
const onTableOptionsChange = ({ page, itemsPerPage: perPage, sortBy }) => {
  currentPage.value = page;
  itemsPerPage.value = perPage;
  
  if (sortBy && sortBy.length > 0) {
      sortByColumn.value = sortBy[0].key;
      sortOrder.value = sortBy[0].order;
  } else {
      sortByColumn.value = 'created_at';
      sortOrder.value = 'desc';
  }
  
  fetchPemesanan();
};

// Debounce search agar tidak hit API setiap ketikan
const onSearchChange = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchPemesanan();
  }, 400);
};

// Reset ke page 1 saat tab berubah
watch(activeTab, () => {
  currentPage.value = 1;
  fetchPemesanan();
});

// Badge counts — ambil dari endpoint terpisah agar tidak tergantung halaman aktif
const counts = ref({ perlu_tindakan: 0, siap_checkin: 0 });

const fetchCounts = async () => {
  try {
    // Hitung perlu verifikasi
    const res1 = await apiClient.get('/admin/pemesanan', { params: { status: 'perlu_tindakan', per_page: 1 } });
    if (res1.success) counts.value.perlu_tindakan = res1.data.total;

    // Hitung terkonfirmasi (siap checkin)
    const res2 = await apiClient.get('/admin/pemesanan', { params: { status: 'dikonfirmasi', per_page: 1 } });
    if (res2.success) counts.value.siap_checkin = res2.data.total;
  } catch (err) {
    console.error('Gagal memuat counts:', err);
  }
};

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isInternalCheckInPending = (pemesanan) => {
    if(!pemesanan.detail_pemesanans) return false; 
    return pemesanan.detail_pemesanans.some(detail => 
        detail.penempatan_kamars && detail.penempatan_kamars.some(p => p.status_penempatan === 'pending')
    );
};

const isReadyToCheckIn = (item) => {
    const today = getLocalDateString(new Date());
    const checkInDate = getLocalDateString(new Date(item.tanggal_check_in));
    return item.status_pemesanan === 'dikonfirmasi' && checkInDate <= today && isInternalCheckInPending(item);
};

const hasActiveStay = (pemesanan) => {
    if (pemesanan.status_pemesanan === 'selesai' || pemesanan.status_pemesanan === 'batal') return false;
    if(!pemesanan.detail_pemesanans) return false;
    return pemesanan.detail_pemesanans.some(detail => 
        detail.penempatan_kamars && detail.penempatan_kamars.some(p => p.status_penempatan === 'assigned')
    );
};

const getStatusColor = (status) => {
  if (status === 'dikonfirmasi' || status === 'selesai') return 'success';
  if (status === 'menunggu_pembayaran') return 'warning';
  if (status === 'menunggu_konfirmasi') return 'orange';
  if (status === 'batal') return 'error';
  if (status === 'tidak_datang') return 'grey-darken-3';
  return 'grey';
};

const formatStatusLabel = (status) => {
  const labels = {
    'menunggu_pembayaran': 'MENUNGGU PEMBAYARAN',
    'menunggu_konfirmasi': 'MENUNGGU KONFIRMASI',
    'dikonfirmasi': 'DIKONFIRMASI',
    'selesai': 'SELESAI',
    'batal': 'BATAL',
    'tidak_datang': 'TIDAK DATANG'
  };
  return labels[status] || status.replace('_', ' ').toUpperCase();
};

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatPrice = (p) => new Intl.NumberFormat('id-ID').format(p);

const viewDetails = (item) => {
  router.push({ name: 'DetailPesananOwner', params: { id: item.id } });
};

onMounted(() => {
  fetchPemesanan();
  fetchCounts();
});
</script>