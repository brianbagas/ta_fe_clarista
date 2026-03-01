<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="text-left">
        <h1 class="text-h4 font-weight-bold" style="color: #333333;">Laporan Pendapatan</h1>
        <p class="text-grey-darken-1">Lihat dan unduh laporan pendapatan homestay.</p>
      </div>
    </div>
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
      <v-col cols="12" md="2">
        <v-btn color="primary" height="56" block @click="fetchLaporan">
          Tampilkan Laporan
        </v-btn>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn 
          color="success" 
          height="56" 
          block 
          @click="exportPdf"
          :loading="loadingPdf"
          prepend-icon="mdi-file-pdf-box"
        >
          Export PDF
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
    <v-chip :color="getStatusColor(item.status_pemesanan)" small>{{ formatStatusLabel(item.status_pemesanan) }}</v-chip>
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
      loadingPdf: false,
      laporan: null,
      filter: (() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return {
          startDate: `${y}-${m}-01`, // Tanggal 1 bulan ini (local time, tanpa konversi UTC)
          endDate: `${y}-${m}-${d}`, // Hari ini (local time)
        };
      })(),
      headers: [
        { title: 'Kode Booking', key: 'kode_booking' },
        { title: 'Nama Tamu', key: 'user.name' },
        { title: 'Tanggal Konfirmasi', key: 'pembayaran.tanggal_konfirmasi' },
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
    async exportPdf() {
      this.loadingPdf = true;
      try {
        console.log('Starting PDF export...', {
          start_date: this.filter.startDate,
          end_date: this.filter.endDate,
          timestamp: new Date().toISOString()
        });

        const response = await apiClient.get('/laporan/export-pdf', {
          params: {
            start_date: this.filter.startDate,
            end_date: this.filter.endDate
          },
          responseType: 'blob',
          timeout: 120000 // 2 minutes timeout for large PDFs
        });

        console.log('PDF Response received:', {
          size: response.size,
          type: response.type,
          timestamp: new Date().toISOString()
        });

        // Verify it's actually a PDF
        if (response.type !== 'application/pdf') {
          console.warn('Response type is not PDF:', response.type);
        }

        // Create blob link to download - bypass IDM by using direct blob URL
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `laporan-pendapatan-${this.filter.startDate}.pdf`;
        
        // Add to DOM temporarily (needed for Firefox)
        document.body.appendChild(link);
        
        // Trigger click
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        console.log("PDF berhasil diunduh pada", new Date().toISOString());
        alert("PDF berhasil diunduh!");
        
      } catch (error) {
        console.error("Gagal export PDF:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          timestamp: new Date().toISOString()
        });
        
        // More informative error message
        let errorMsg = "Gagal mengunduh PDF. ";
        if (error.code === 'ECONNABORTED') {
          errorMsg += "Request timeout - laporan terlalu besar atau server lambat.";
        } else if (error.response?.status === 401) {
          errorMsg += "Anda tidak terauthorisasi. Silakan login ulang.";
        } else if (error.response?.status === 500) {
          errorMsg += "Server error. Silakan coba lagi nanti.";
        } else {
          errorMsg += "Silakan coba lagi.";
        }
        
        alert(errorMsg);
      } finally {
        this.loadingPdf = false;
      }
    },
    getStatusColor(status) {
      if (status === 'dikonfirmasi' || status === 'selesai') return 'success';
      if (status === 'menunggu_pembayaran') return 'warning';
      if (status === 'menunggu_konfirmasi') return 'orange';
      if (status === 'batal') return 'error';
      if (status === 'tidak_datang') return 'grey-darken-3';
      return 'grey';
    },
    formatStatusLabel(status) {
      const labels = {
        'menunggu_pembayaran': 'Menunggu Pembayaran',
        'menunggu_konfirmasi': 'Menunggu Konfirmasi',
        'dikonfirmasi': 'Dikonfirmasi',
        'selesai': 'Selesai',
        'batal': 'Batal',
        'tidak_datang': 'Tidak Datang'
      };
      return labels[status] || status.replace('_', ' ');
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