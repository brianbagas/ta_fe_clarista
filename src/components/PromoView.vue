<template>
  <v-container class="py-10">
    <div class="text-center mb-10">
      <v-icon size="60" color="orange-darken-1" class="mb-2">mdi-ticket-percent-outline</v-icon>
      <h1 class="text-h4 font-weight-bold text-blue-darken-3">Promo Spesial Clarista</h1>
      <p class="text-subtitle-1 text-grey-darken-1 mt-2">
        Hemat lebih banyak untuk liburan impian Anda. Salin kodenya dan gunakan saat checkout!
      </p>
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12" md="4">
        <v-skeleton-loader type="image, article" class="rounded-lg"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-6">
      {{ error }}
    </v-alert>

    <v-row v-else-if="promos.length > 0">
      <v-col v-for="promo in promos" :key="promo.id" cols="12" md="4">
        <v-card class="promo-card d-flex flex-column h-100" elevation="4">
          
          <div class="ticket-header bg-blue-darken-3 pa-6 text-center position-relative">
            <div class="punch-hole left"></div>
            <div class="punch-hole right"></div>

            <div class="text-overline text-white mb-1 opacity-80">DISKON SPESIAL</div>
            <div class="text-h3 font-weight-black text-white text-uppercase">
              {{ formatDiscount(promo) }}
            </div>
            <div class="mt-2">
              <v-chip color="orange-accent-2" variant="flat" size="small" class="font-weight-bold text-blue-darken-4">
                <v-icon start icon="mdi-clock-outline" size="x-small"></v-icon>
                Berlaku s/d {{ formatDate(promo.berlaku_selesai) }}
              </v-chip>
            </div>
          </div>

          <v-card-text class="pa-5 bg-white flex-grow-1 d-flex flex-column">
            <h3 class="text-h6 font-weight-bold mb-2">{{ promo.nama_promo }}</h3>
            <p class="text-body-2 text-grey-darken-1 mb-4 flex-grow-1">
              {{ promo.deskripsi }}
            </p>

            <v-divider class="border-dashed my-4"></v-divider>

            <div class="d-flex align-center bg-grey-lighten-4 rounded-lg px-3 py-2 border-dashed-container">
              <v-icon color="grey-darken-1" class="mr-2">mdi-tag-text-outline</v-icon>
              <div class="flex-grow-1 font-weight-bold text-subtitle-1 text-blue-darken-3 spacing-1">
                {{ promo.kode_promo }}
              </div>
              
              <v-tooltip text="Salin Kode" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-content-copy"
                    size="small"
                    color="primary"
                    variant="text"
                    @click="copyToClipboard(promo.kode_promo)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-center py-10">
      <v-icon size="64" color="grey-lighten-1">mdi-emoticon-sad-outline</v-icon>
      <h3 class="text-h6 text-grey mt-4">Belum ada promo tersedia saat ini.</h3>
    </div>

    <v-snackbar v-model="snackbar" color="success" timeout="2000" location="bottom right">
      <v-icon start>mdi-check-circle</v-icon>
      Kode promo berhasil disalin!
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../axios';

const promos = ref([]);
const loading = ref(true);
const error = ref(null);
const snackbar = ref(false);

const fetchPromos = async () => {
  try {
    const response = await apiClient.get('/promo');
    if (response.success) {
      promos.value = response.data;
    } else {
      error.value = response.message || 'Gagal memuat data promo.';
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal memuat data promo.';
    console.error('Error fetching promos:', err);
  } finally {
    loading.value = false;
  }
};

// --- HELPER FUNCTIONS ---

const formatDiscount = (promo) => {
  if (promo.tipe_diskon === 'persen') {
    return `${promo.nilai_diskon}%`;
  } else {
    // Format Rupiah Singkat (misal 25rb) agar muat di kartu
    const val = promo.nilai_diskon;
    if (val >= 1000) {
      return `Rp ${val / 1000}rb`; 
    }
    return `Rp ${val}`;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    snackbar.value = true;
  });
};

onMounted(fetchPromos);
</script>

<style scoped>
/* Styling Kartu Voucher */
.promo-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.promo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
}

/* Header Tiket */
.ticket-header {
  border-bottom: 2px dashed rgba(255, 255, 255, 0.3);
}

/* Efek Sobekan Kertas (Punch Holes) */
.punch-hole {
  position: absolute;
  bottom: -10px; /* Setengah lingkaran */
  width: 20px;
  height: 20px;
  background-color: rgb(var(--v-theme-background)); /* Warna background halaman */
  border-radius: 50%;
  z-index: 1;
}

.punch-hole.left {
  left: -10px;
}

.punch-hole.right {
  right: -10px;
}

/* Garis Putus-putus Custom */
.border-dashed {
  border-style: dashed !important;
  border-color: #e0e0e0 !important;
}

.border-dashed-container {
  border: 1px dashed #bdbdbd;
}

.spacing-1 {
  letter-spacing: 1px;
}
</style>