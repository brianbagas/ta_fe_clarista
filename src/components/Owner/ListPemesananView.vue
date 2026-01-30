<template>
  <v-container>
    <h1 class="text-h4 mb-4">Manajemen Pesanan</h1>
    <p class="mb-6">Lihat dan kelola semua pesanan yang masuk.</p>

    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Cari berdasarkan nama atau kode booking..."
          single-line
          hide-details
          variant="solo"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="pemesanans"
        :search="search"
        :loading="loading"
        loading-text="Memuat data pesanan..."
        no-data-text="Tidak ada data pesanan."
      >
        <template v-slot:[`item.status_pemesanan`]="{ item }">
          <v-chip :color="getStatusColor(item.status_pemesanan)" small>
            {{ item.status_pemesanan.replace('_', ' ').toUpperCase() }}
          </v-chip>
        </template>

        <template v-slot:[`item.total_bayar`]="{ item }">
          Rp {{ new Intl.NumberFormat('id-ID').format(item.total_bayar) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetails(item)">Detail </v-btn>
          <!-- <v-btn icon="mdi-pencil" variant="text" size="small" @click="editItem(item)"></v-btn> -->
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../axios';
import router from '../../router';

const search = ref('');
const loading = ref(true);
const pemesanans = ref([]);
const headers = [
  { title: 'Kode Booking', key: 'kode_booking' },
  { title: 'Nama Tamu', key: 'user.name' },
  { title: 'Check-in', key: 'tanggal_check_in' },
  { title: 'Check-out', key: 'tanggal_check_out' },
  { title: 'Tagihan', key: 'total_bayar' },
  { title: 'Status', key: 'status_pemesanan' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

const fetchPemesanan = async () => {
  try {
    const response = await apiClient.get('/admin/pemesanan');
    if (response.success) {
      pemesanans.value = response.data;
    }
  } catch (err) {
    console.error('Gagal memuat data pemesanan:', err);
    // Tampilkan notifikasi error ke owner
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  if (status === 'dikonfirmasi' || status === 'selesai') return 'success';
  if (status === 'menunggu_pembayaran') return 'warning';
  if (status === 'batal') return 'error';
  return 'grey';
};

const viewDetails = (item) => {
  console.log('Lihat detail:', item.id);
  // Navigasi ke halaman detail pesanan
  router.push({ name: 'DetailPesananOwner', params: { id: item.id } });
};

const editItem = (item) => {
  console.log('Edit item:', item.id);
  // Buka dialog untuk edit status pesanan
   router.push('homepage')
};

onMounted(fetchPemesanan);
</script>