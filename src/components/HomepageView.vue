<template>
  <div class="main-wrapper bg-grey-lighten-5">
    
    <div class="hero-section position-relative">
      <v-img
        :src="heroImageUrl"
        :alt="content.hero_title || 'Hero Image'"
        cover
        height="600"
        class="align-center"
      >
        <div class="fill-height w-100 position-absolute" 
             style="background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)); top: 0;">
        </div>

        <v-container class="position-relative z-index-1 text-center text-white">
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-4 font-primary">
            {{ content.hero_title || 'SELAMAT DATANG DI CLARISTA HOMESTAY' }}
          </h1>
          <p class="text-h6 font-weight-light mb-8 opacity-90 max-width-800 mx-auto">
            {{ content.hero_subtitle || 'Penginapan nyaman dengan sentuhan personal di jantung Kretek, Yogyakarta.' }}
          </p>
        </v-container>
      </v-img>

      <v-container class="booking-widget-container">
        <v-card elevation="10" class="rounded-xl pa-4 mt-n16 position-relative z-index-2">
          <v-row align ="center" no-gutters>
            <v-col cols="12" md="3" class="px-2">
              <div class="text-caption font-weight-bold text-grey mb-1 ml-1">Check-in</div>
              <v-text-field type="date" density="compact" variant="outlined" hide-details color="primary"></v-text-field>
            </v-col>
            <v-col cols="12" md="3" class="px-2 mt-3 mt-md-0">
              <div class="text-caption font-weight-bold text-grey mb-1 ml-1">Check-out</div>
              <v-text-field type="date" density="compact" variant="outlined" hide-details color="primary"></v-text-field>
            </v-col>
            <v-col cols="12" md="3" class="px-2 mt-3 mt-md-0">
               <div class="text-caption font-weight-bold text-grey mb-1 ml-1">Tamu</div>
               <v-select 
                  :items="['1 Orang', '2 Orang', '3 Orang', '4+ Orang']" 
                  density="compact" 
                  variant="outlined" 
                  hide-details 
                  prepend-inner-icon="mdi-account-group"
                  color="primary"
                ></v-select>
            </v-col>
            <v-col cols="12" md="3" class="px-2 mt-4 mt-md-0 d-flex align-end">
              <v-btn block height="40" color="blue-darken-3" class="text-white text-capitalize rounded-lg">
                Cari Ketersediaan
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </div>

    <v-container class="my-16">
      <div class="text-center mb-10">
        <div class="text-overline text-blue-darken-3 font-weight-bold">PILIHAN TERBAIK</div>
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">Tipe Kamar Kami</h2>
        <v-divider class="mx-auto mt-3 border-opacity-100" length="60" color="primary" thickness="3"></v-divider>
      </div>

      <v-row>
        <v-col v-for="room in kamars" :key="room.id_kamar" cols="12" md="4">
          <v-card class="mx-auto rounded-lg elevation-4 h-100 d-flex flex-column group-hover-card" hover>
            
            <div class="position-relative overflow-hidden" style="height: 250px;">
              <v-img
                :src="room.image"
                cover
                class="h-100 transition-swing"
                style="transition: transform 0.5s;"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </div>
                </template>
              </v-img>
              
              <v-chip
                v-if="room.jumlah_tersedia < 3"
                color="red"
                class="position-absolute top-0 right-0 ma-3 font-weight-bold"
                size="small"
                variant="flat"
              >
                Sisa {{ room.jumlah_tersedia }} Unit!
              </v-chip>
            </div>

            <v-card-item>
              <v-card-title class="font-weight-bold text-h6">{{ room.tipe_kamar }}</v-card-title>
              <v-card-subtitle class="mt-1">
                <v-icon icon="mdi-bed-king-outline" size="small" class="mr-1"></v-icon> 
                Max {{ room.capacity }} Orang
              </v-card-subtitle>
            </v-card-item>

            <v-card-text class="flex-grow-1">
              <p class="text-body-2 text-grey-darken-1 line-clamp-2 mb-4">{{ room.deskripsi }}</p>
              
              <div class="d-flex gap-3 text-grey-lighten-1">
                <v-tooltip text="Free WiFi" location="top"><template v-slot:activator="{ props }"><v-icon v-bind="props" icon="mdi-wifi"></v-icon></template></v-tooltip>
                <v-tooltip text="AC" location="top"><template v-slot:activator="{ props }"><v-icon v-bind="props" icon="mdi-snowflake"></v-icon></template></v-tooltip>
                <v-tooltip text="TV" location="top"><template v-slot:activator="{ props }"><v-icon v-bind="props" icon="mdi-television"></v-icon></template></v-tooltip>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4 pt-2">
              <div>
                <div class="text-caption text-grey">Mulai dari</div>
                <div class="text-h6 font-weight-bold text-blue-darken-3">
                  Rp {{ new Intl.NumberFormat('id-ID').format(room.harga) }}
                  <span class="text-caption text-grey font-weight-regular">/malam</span>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn 
                color="blue-darken-3" 
                variant="flat" 
                class="text-capitalize"
                @click="viewDetails(room.id)"
              >
              Detail
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

<v-sheet class="py-16 bg-blue-grey-lighten-5">
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h2 class="text-h4 font-weight-bold text-blue-darken-3">Promo Spesial</h2>
          <p class="text-body-2 text-grey-darken-1 mt-1">Dapatkan penawaran terbaik hari ini</p>
        </div>
        <v-btn 
          to="/promo" 
          variant="text" 
          color="primary" 
          append-icon="mdi-arrow-right"
          class="font-weight-bold"
        >
          Lihat Semua
        </v-btn>
      </div>

      <div v-if="promoLoading" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <v-alert v-else-if="promoError" type="error" variant="tonal" class="mb-4">
        {{ promoError }}
      </v-alert>

      <v-alert v-else-if="latestPromos.length === 0" type="info" variant="tonal">
        Belum ada promo tersedia.
      </v-alert>

<v-slide-group 
        v-else 
        class="py-4" 
        :show-arrows="!$vuetify.display.xs" 
        center-active
      >
        <v-slide-group-item v-for="promo in latestPromos" :key="promo.id">
          
          <v-card 
            class="ma-2 ticket-card d-flex flex-row" 
            :width="$vuetify.display.xs ? '82vw' : 380" 
            :min-height="$vuetify.display.xs ? 150 : 180"
            elevation="4"
          >
            <div class="ticket-left bg-blue-darken-3 d-flex flex-column align-center justify-center pa-3 position-relative"
                 :style="{ width: $vuetify.display.xs ? '90px' : '120px' }">
              
              <div class="punch-hole top"></div>
              <div class="punch-hole bottom"></div>

              <div :class="['font-weight-black text-white text-center', $vuetify.display.xs ? 'text-h6' : 'text-h4']">
                {{ formatDiscountValue(promo) }}
              </div>
              <div class="text-caption font-weight-bold text-blue-lighten-4 mt-1">OFF</div>
            </div>

            <div class="ticket-divider d-flex flex-column justify-center bg-white position-relative">
               <div class="dashed-line-vertical"></div>
            </div>

            <div class="ticket-right bg-white pa-3 d-flex flex-column justify-space-between flex-grow-1 overflow-hidden">
              <div>
                <div class="d-flex justify-space-between align-start">
                  <v-chip size="x-small" color="orange" variant="flat" class="font-weight-bold mb-1">
                    HOT
                  </v-chip>
                </div>
                
                <div :class="['font-weight-bold text-blue-darken-4 line-clamp-1', $vuetify.display.xs ? 'text-body-2' : 'text-subtitle-1']">
                  {{ promo.nama_promo }}
                </div>
                
                <div class="text-caption text-grey-darken-1 line-clamp-2 mt-1" style="line-height: 1.2;">
                  {{ promo.deskripsi }}
                </div>
              </div>

              <div 
                class="code-container mt-2 d-flex align-center justify-space-between px-2 py-1 rounded border-dashed"
                @click="copyToClipboard(promo.kode_promo)"
                v-ripple
              >
                <div class="d-flex align-center overflow-hidden">
                  <span class="font-weight-bold text-primary text-uppercase text-caption text-truncate">
                    {{ promo.kode_promo }}
                  </span>
                </div>
                <v-icon icon="mdi-content-copy" size="x-small" color="primary" class="ml-1 flex-shrink-0"></v-icon>
              </div>
            </div>
          </v-card>

        </v-slide-group-item>
      </v-slide-group>
    </v-container>

    <v-snackbar v-model="snackbar" color="success" timeout="2000" location="bottom center">
      <v-icon start>mdi-check-circle</v-icon> Kode berhasil disalin!
    </v-snackbar>
  </v-sheet>
    
    <v-container class="my-16">
      <h2 class="text-h4 text-center font-weight-bold mb-2">Apa Kata Mereka?</h2>
      <p class="text-center text-grey mb-10">Pengalaman asli dari tamu yang menginap di Clarista Homestay</p>
      
      <v-row justify="center">
        <v-col cols="12" v-if="latestReviews.length > 0">
           <v-slide-group show-arrows center-active>
              <v-slide-group-item v-for="review in latestReviews" :key="review.id">
                <v-card class="ma-3 pa-6 rounded-xl border" width="350" flat color="white">
                  <div class="d-flex align-center mb-4">
                    <v-avatar color="blue-lighten-4" size="48" class="mr-3">
                      <span class="text-blue-darken-3 font-weight-bold text-h6">{{ review.user?.name?.charAt(0) || 'U' }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-bold text-body-1">{{ review.user?.name }}</div>
                      <v-rating
                        :model-value="review.rating"
                        color="amber-darken-2"
                        density="compact"
                        readonly
                        size="x-small"
                      ></v-rating>
                    </div>
                  </div>
                  <v-icon icon="mdi-format-quote-open" color="grey-lighten-2" size="large"></v-icon>
                  <p class="text-body-2 text-grey-darken-2 mt-2 font-italic">"{{ review.komentar }}"</p>
                </v-card>
              </v-slide-group-item>
           </v-slide-group>
        </v-col>
      </v-row>
    </v-container>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; 
import { useRouter } from 'vue-router';
import apiClient from '../axios';

const router = useRouter();
const content = ref({});
const loading = ref(true);
const kamars = ref([]);
const latestReviews = ref([]);
const reviewLoading = ref(true);
const latestPromos = ref([]);
const promoLoading = ref(true);
const promoError = ref('');
const snackbar = ref(false);
// 1. Image Logic: Diperbaiki agar lebih robust
const heroImageUrl = computed(() => {
  if (content.value.hero_image_path) {
    // Pastikan path bersih dari 'public/' jika API mengembalikannya
    const cleanPath = content.value.hero_image_path.replace('public/', '').replace(/^\//, '');
    // Gunakan URL storage Laravel standar
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  }
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'; // Gambar Tropical Placeholder yang lebih bagus
});

// 2. Data Kamar: Saya update dummy datanya agar sesuai dengan UI baru (Harga & Stok)
// Nanti ini bisa diganti dengan fetch dari API /kamar
const roomTypes = ref([
  {
    id: 1, 
    title: 'Single Bed Room',
    description: 'Kamar yang nyaman dan ringkas dengan pencahayaan alami, cocok untuk solo traveler yang mencari ketenangan.',
    price: 350000,
    jumlah_tersedia: 2, // Untuk trigger badge "Sisa 2 Unit"
    capacity: 1,
    image: 'http://127.0.0.1:8000/storage/images/kamars/dummy-8.jpg' // Sesuaikan path ini
  },
  {
    id: 2, 
    title: 'Double Bed Deluxe',
    description: 'Ruangan yang lebih luas dengan fasilitas premium, ideal untuk pasangan. Dilengkapi balkon pribadi.',
    price: 550000,
    jumlah_tersedia: 5,
    capacity: 2,
    image: 'http://127.0.0.1:8000/storage/images/kamars/dummy-4.jpg' // Sesuaikan path ini
  },
  {
    id: 3, 
    title: 'Family Suite',
    description: 'Kamar ekstra luas untuk keluarga kecil. Ruang tamu terpisah dan kamar mandi bathtub.',
    price: 750000,
    jumlah_tersedia: 0, // Bisa ditambah logic disable button
    capacity: 4,
    image: 'http://127.0.0.1:8000/storage/images/kamars/dummy-10.jpg' 
  },
]);

const fetchContent = async () => {
  try {
    const response = await apiClient.get('/content/homepage');
    content.value = response.data;
  } catch (error) {
    console.error('Gagal memuat konten homepage:', error);
  } finally {
    loading.value = false;
  }
};

// Helper untuk format diskon (Persen vs Rupiah)
const formatDiscountValue = (promo) => {
  if (promo.tipe_diskon === 'persen') {
    return `${promo.nilai_diskon}%`;
  } else {
    // Ubah 25000 jadi 25rb agar muat di kotak kecil
    const val = promo.nilai_diskon;
    if (val >= 1000) return `${val / 1000}rb`;
    return `${val}`;
  }
};

const copyToClipboard = (code) => {
  navigator.clipboard.writeText(code).then(() => {
    snackbar.value = true;
  });
};

const fetchLatestPromos = async () => {
  try {
    const response = await apiClient.get('/promo/latest');
    // Adaptasi jika response dibungkus data atau array langsung
    latestPromos.value = response.data.data ? response.data.data : response.data;
  } catch (error) {
    console.error('Gagal memuat promo:', error);
    promoError.value = 'Gagal memuat promo terbaru.';
  } finally {
    promoLoading.value = false;
  }
};

const fetchLatestReviews = async () => {
  try {
    const response = await apiClient.get('/review/latest');
    latestReviews.value = response.data;
  } catch (error) {
    console.error('Gagal memuat review terbaru:', error);
  } finally {
    reviewLoading.value = false;
  }
};

const fetchKamarData = async () => {
  try {
    const response = await apiClient.get('/kamar'); 
    // Sesuaikan jika response dibungkus data atau tidak
    roomTypes.value = Array.isArray(response.data.data) ? response.data.data : response.data.data;
    kamars.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data kamar:", error);
  }finally {
    loading.value = false;
  }
};

onMounted(() => {
    fetchContent();
    fetchLatestPromos();
    fetchLatestReviews();
    fetchKamarData();
});

const viewDetails = (roomId) => {
  router.push({ name: 'kamar', params: { id: roomId } }); // Asumsi route punya param id
};
</script>

<style scoped>
/* Custom Styling untuk hal-hal yang tidak tercover Vuetify Classes */

.main-wrapper {
  font-family: 'Poppins', sans-serif; /* Pastikan font ini di load di index.html */
}
/* Styling Tiket Promo */
.ticket-card {
  position: relative;
  overflow: visible !important; /* Agar shadow/elemen luar tidak terpotong */
  border-radius: 12px;
}

/* Bagian Kiri (Biru) */
.ticket-left {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  flex-shrink: 0; /* Mencegah bagian ini mengecil */
}

/* Bagian Kanan (Putih) */
.ticket-right {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  min-width: 0; /* Penting untuk text-truncate di flex container */
}

/* Logic Lubang Tiket (Punch Hole) */
/* .punch-hole {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #ECEFF1; 
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.punch-hole.top {
  top: -10px;
}

.punch-hole.bottom {
  bottom: -10px;
} */

/* Garis Pembatas Vertikal */
.ticket-divider {
  width: 0px; /* Tidak memakan tempat horizontal */
  position: relative;
  z-index: 1;
}

/* Garis putus-putus CSS murni */
.dashed-line-vertical {
  height: 80%;
  border-left: 2px dashed #ffffff; /* Garis putih di atas background biru/putih pertemuan */
  position: absolute;
  left: -1px; /* Posisi di tengah pertemuan */
  top: 10%;
  opacity: 0.5;
}

/* Container Kode Promo */
.code-container {
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.code-container:hover {
  background-color: #e3f2fd;
}

.border-dashed {
  border: 1px dashed #bdbdbd;
}

/* Utility tambahan */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Garis putus-putus vertikal untuk tiket */
.border-dashed-vertical {
  border-left: 2px dashed #e0e0e0;
}

/* Efek Hover pada Image Kamar */
.group-hover-card:hover .v-img__img--cover {
  transform: scale(1.1);
}

.line-clamp-2 {
  display: -webkit-box;

  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Style tambahan untuk border putus-putus kode promo */
.border-dashed {
  border: 1px dashed #bdbdbd;
}

</style>