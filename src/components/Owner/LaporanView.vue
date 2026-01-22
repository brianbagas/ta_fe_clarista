<template>
  <v-container>
    <h2 class="mb-4">Laporan Pendapatan</h2>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="filter.bulan"
          :items="listBulan"
          item-title="nama"
          item-value="id"
          label="Pilih Bulan"
          variant="outlined"
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filter.tahun"
          label="Tahun"
          type="number"
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
      laporan: null, // Data dari API disimpan di sini
      filter: {
        bulan: new Date().getMonth() + 1, // Default bulan ini
        tahun: new Date().getFullYear(),
      },
      listBulan: [
        { id: 1, nama: 'Januari' }, { id: 2, nama: 'Februari' },
        { id: 3, nama: 'Maret' }, { id: 4, nama: 'April' },
        { id: 5, nama: 'Mei' }, { id: 6, nama: 'Juni' },
        { id: 7, nama: 'Juli' }, { id: 8, nama: 'Agustus' },
        { id: 9, nama: 'September' }, { id: 10, nama: 'Oktober' },
        { id: 11, nama: 'November' }, { id: 12, nama: 'Desember' },
      ],
      headers: [
        { title: 'ID Booking', key: 'id' },
        { title: 'Nama Tamu', key: 'user.name' }, 
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
            bulan: this.filter.bulan,
            tahun: this.filter.tahun
          }
        });

        console.log("Respon dari Server:", response); 
        console.log("Isi Data:", response.data);

        if(response.data.meta.code === 200) {
            this.laporan = response.data.data;

            console.log("Data berhasil dimuat:", this.laporan);
            console.log("Data Transaksi berhasil dimuat:", this.laporan.transaksi);
            
        }
      } catch (error) {
        console.error("Gagal ambil laporan", error);
        alert("Gagal mengambil data laporan.");
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