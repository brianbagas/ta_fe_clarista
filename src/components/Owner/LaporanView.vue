<template>
  <v-container>
    <h2 class="mb-4">Laporan Pendapatan</h2>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filter.startDate"
          label="Tanggal Mulai"
          type="date"
          variant="outlined"
          dense
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filter.endDate"
          label="Tanggal Selesai"
          type="date"
          variant="outlined"
          dense
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn color="primary" height="56" block @click="fetchLaporan">
          Tampilkan Laporan
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="laporan">
      <v-col cols="12" md="6">
        <v-card color="primary" class="text-white">
          <v-card-text>
            <div class="text-subtitle-1">Total Pendapatan</div>
            <div class="text-h4 font-weight-bold">
              {{ formatRupiah(laporan.summary.total_pendapatan) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card color="success" class="text-white">
          <v-card-text>
            <div class="text-subtitle-1">Jumlah Transaksi</div>
            <div class="text-h4 font-weight-bold">
              {{ laporan.summary.total_transaksi }} Pesanan
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-6" v-if="laporan">
      <v-card-title>Detail Transaksi - {{ laporan.summary.periode }}</v-card-title>
      <v-data-table
  :headers="headers"
  :items="laporan.transaksi"
  :loading="loading"
>
  <template v-slot:[`item.total_bayar`]="{ item }">
    {{ formatRupiah(item.total_bayar) }} 
  </template>
  
  <template v-slot:[`item.status_pemesanan`]="{ item }">
    <v-chip color="green" small>{{ item.status_pemesanan }}</v-chip>
  </template>

  <template v-slot:[`item.user.name`]="{ item }">
    {{ item.user ? item.user.name : 'User Tidak Ditemukan' }}
  </template>

  <template v-slot:[`item.pembayaran.tanggal_bayar`]="{ item }">
    {{ item.pembayaran ? new Date(item.pembayaran.tanggal_bayar).toLocaleDateString('id-ID') : '-' }}
  </template>
</v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from '../../axios';

export default {
  data() {
    return {
      loading: false,
      laporan: null,
      filter: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().substring(0, 10), // Default Awal Bulan
        endDate: new Date().toISOString().substring(0, 10), // Default Hari Ini
      },
      headers: [
        { title: 'Kode Booking', key: 'kode_booking' },
        { title: 'Nama Tamu', key: 'user.name' },
        { title: 'Tanggal Bayar', key: 'pembayaran.tanggal_bayar' },
        { title: 'Check In', key: 'tanggal_check_in' },
        { title: 'Check Out', key: 'tanggal_check_out' },
        { title: 'Total Bayar', key: 'total_bayar' },
        { title: 'Status', key: 'status_pemesanan' },
      ],
    };
  },
  methods: {
    async fetchLaporan() {
      this.loading = true;
      try {
        const response = await apiClient.get('/laporan', {
          params: {
            start_date: this.filter.startDate,
            end_date: this.filter.endDate
          }
        });

        if (response.success) {
          this.laporan = response.data;
          console.log("Data berhasil dimuat:", this.laporan);
        } else {
          alert(response.message || "Gagal mengambil data laporan.");
        }
      } catch (error) {
        console.error("Gagal ambil laporan", error);
        alert(error.response?.data?.message || "Gagal mengambil data laporan.");
      } finally {
        this.loading = false;
      }
    },
    formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(angka);
    }
  },
  mounted() {
    this.fetchLaporan(); // Load otomatis saat halaman dibuka
  }
};
</script>