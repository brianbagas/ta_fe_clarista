<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
        <div>
             <h1 class="text-h4 font-weight-bold">Manajemen Pesanan</h1>
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
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredPemesanans"
        :search="search"
        :loading="loading"
        loading-text="Memuat data pesanan..."
        no-data-text="Tidak ada pesanan pada kategori ini."
        hover
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
                {{ item.status_pemesanan.replace('_', ' ').toUpperCase() }}
            </v-chip>
          </div>
        </template>

        <template v-slot:[`item.total_bayar`]="{ item }">
          <div class="text-left font-weight-medium text-grey-darken-3">Rp {{ formatPrice(item.total_bayar) }}</div>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-start gap-2">
            <!-- Action Button Logic -->
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
                @click="viewDetails(item)"
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

            <!-- Detail Button (Always Visible) -->
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
      </v-data-table>
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

const headers = [
  { title: 'Kode Booking', key: 'kode_booking', align: 'start' },
  { title: 'Nama Tamu', key: 'user.name', align: 'start' },
  { title: 'Check-in', key: 'tanggal_check_in', align: 'start' },
  { title: 'Check-out', key: 'tanggal_check_out', align: 'start' }, // Reusing text slot for out, but label is Durasi/Out
  { title: 'Tagihan', key: 'total_bayar', align: 'start' },
  { title: 'Status', key: 'status_pemesanan', align: 'start' },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'start' },
];

const fetchPemesanan = async () => {
    loading.value = true;
  try {
    const response = await apiClient.get('/admin/pemesanan');
    if (response.success) {
      pemesanans.value = response.data;
    }
  } catch (err) {
    console.error('Gagal memuat data pemesanan:', err);
  } finally {
    loading.value = false;
  }
};

// Computed Filters
const filteredPemesanans = computed(() => {
    return pemesanans.value.filter(p => {
        if (activeTab.value === 'semua') return true;
        
        if (activeTab.value === 'menunggu_pembayaran') {
            return p.status_pemesanan === 'menunggu_pembayaran';
        }

        if (activeTab.value === 'perlu_tindakan') {
            return p.status_pemesanan === 'menunggu_konfirmasi';
        }
        
        if (activeTab.value === 'terkonfirmasi') {
            return p.status_pemesanan === 'dikonfirmasi';
        }
        
        if (activeTab.value === 'selesai_batal') {
            return ['selesai', 'batal'].includes(p.status_pemesanan);
        }
        
        return true;
    });
});

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const counts = computed(() => {
    const today = getLocalDateString(new Date());
    let tindakan = 0;
    let checkin = 0;
    
    pemesanans.value.forEach(p => {
        const checkInDate = getLocalDateString(new Date(p.tanggal_check_in));
        
        // Perlu Verifikasi hanya jika status menunggu_konfirmasi
        if(p.status_pemesanan === 'menunggu_konfirmasi') tindakan++;
        
        // Hitung yang siap checkin untuk badge di tab Terkonfirmasi
         if (p.status_pemesanan === 'dikonfirmasi' && 
                   checkInDate <= today && 
                   isInternalCheckInPending(p)) checkin++;
    });
    
    return { perlu_tindakan: tindakan, siap_checkin: checkin };
});

const isInternalCheckInPending = (pemesanan) => {
    // Cek apakah ada unit yang status penempatannya 'pending'
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
  if (status === 'batal') return 'error';
  return 'grey';
};

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatPrice = (p) => new Intl.NumberFormat('id-ID').format(p);

const viewDetails = (item) => {
  router.push({ name: 'DetailPesananOwner', params: { id: item.id } });
};

onMounted(fetchPemesanan);
</script>