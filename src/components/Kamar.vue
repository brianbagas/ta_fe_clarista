<template>
  <v-container class="py-10">
    <div class="text-center mb-10">
      <h1 class="text-h4 font-weight-bold text-primary mb-2">
        Pilihan Kamar Kami
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        Istirahat nyaman dengan fasilitas terbaik di Clarista Homestay
      </p>
    </div>

    <div v-if="loading" class="d-flex justify-center my-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      title="Terjadi Kesalahan"
      :text="error"
      class="mb-6"
    ></v-alert>

    <v-alert
      v-else-if="rooms.length === 0"
      type="info"
      variant="tonal"
      text="Belum ada kamar yang tersedia saat ini."
    ></v-alert>

    <v-row v-else justify="center">
      <v-col
        v-for="room in rooms"
        :key="room.id_kamar"
        cols="12"
        md="6"
        lg="5"
      >
        <v-card elevation="4" class="rounded-lg h-100 d-flex flex-column hover-card">
          <v-img
            v-if="room.thumbnail && room.thumbnail !== 'null'"
            :src="room.thumbnail"
            height="250"
            cover
            class="align-end"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
              </div>
            </template>
            <template v-slot:error>
               <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3 w-100 flex-column">
                  <v-icon size="48" color="grey-lighten-1">mdi-image-off</v-icon>
                  <div class="text-caption text-grey mt-2">Gambar tidak tersedia</div>
               </div>
            </template>
            <v-card-title class="text-white bg-black-transparent font-weight-bold">
              {{ room.tipe_kamar }}
            </v-card-title>
          </v-img>
          
          <v-sheet
            v-else
            height="250"
            color="grey-lighten-3"
            class="d-flex align-end justify-start position-relative"
          >
             <div class="d-flex align-center justify-center w-100 h-100 position-absolute" style="z-index: 0;">
                <v-icon size="64" color="grey-lighten-2">mdi-image-off</v-icon>
             </div>
             <v-card-title class="text-white bg-black-transparent font-weight-bold w-100 position-relative" style="z-index: 1;">
              {{ room.tipe_kamar }}
            </v-card-title>
          </v-sheet>

          <v-card-text class="pt-4 flex-grow-1">
            <div class="d-flex align-center mb-3">
              <v-icon color="green" icon="mdi-cash-multiple" class="mr-2"></v-icon>
              <span class="text-h6 font-weight-bold text-green-darken-2">
                Rp {{ formatPrice(room.harga) }}
                <span class="text-caption text-grey">/ malam</span>
              </span>
            </div>

            <div class="d-flex gap-2 mb-3">
              <v-chip size="small" color="primary" variant="flat">
                <v-icon start icon="mdi-wifi"></v-icon> WiFi
              </v-chip>
              <v-chip size="small" color="primary" variant="flat">
                <v-icon start icon="mdi-snowflake"></v-icon> AC
              </v-chip>
              <v-chip size="small" color="primary" variant="flat" v-if="room.tipe_kamar.includes('Double')">
                <v-icon start icon="mdi-television"></v-icon> TV
              </v-chip>
            </div>

            <p class="text-body-2 text-grey-darken-1">
              Nikmati pengalaman menginap terbaik dengan tipe {{ room.tipe_kamar }}. 
              Cocok untuk Anda yang mencari kenyamanan ekstra.
            </p>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn
              variant="outlined"
              color="primary"
              block
              prepend-icon="mdi-eye"
              @click="openDetail(room)"
            >
              Lihat Detail & Fasilitas
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="600" scrollable>
      <v-card v-if="selectedRoom">
        <v-carousel
          v-if="selectedRoom.images && selectedRoom.images.length > 0"
          height="300"
          hide-delimiter-background
          show-arrows="hover"
        >
          <v-carousel-item
            v-for="(image, i) in selectedRoom.images"
            :key="i"
            :src="image.url"
            cover
          ></v-carousel-item>
        </v-carousel>

        <v-img
          v-else
          :src="selectedRoom.thumbnail || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop'"
          height="300"
          cover
        ></v-img>
        
        <v-card-title class="text-h5 font-weight-bold mt-2">
          {{ selectedRoom.tipe_kamar }}
        </v-card-title>

        <v-card-text style="max-height: 400px;">
          <div class="text-h6 text-primary font-weight-bold mb-4">
            Rp {{ formatPrice(selectedRoom.harga) }} / malam
          </div>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">Deskripsi</h3>
          <p class="text-body-2 text-grey-darken-2 mb-4">
            Kamar tipe {{ selectedRoom.tipe_kamar }} menyediakan ruang yang luas dan nyaman. 
            Sangat direkomendasikan untuk istirahat setelah perjalanan jauh.
          </p>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">Fasilitas Lengkap</h3>
          <v-list density="compact" class="bg-grey-lighten-4 rounded-lg">
            <v-list-item 
              v-for="(fasilitas, i) in parseFacilities(selectedRoom.fasilitas)" 
              :key="i"
              prepend-icon="mdi-check-circle"
              class="text-body-2"
            >
              {{ fasilitas }}
            </v-list-item>
            <v-list-item v-if="parseFacilities(selectedRoom.fasilitas).length === 0">
              WiFi, AC, Kamar Mandi Dalam, Air Panas
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialog = false">Tutup</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            variant="flat" 
            prepend-icon="mdi-calendar-check"
            @click="goToBooking"
          >
            Pesan Sekarang
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import apiClient from '../axios'; 

export default {
  name: 'RoomListPublic',
  data() {
    return {
      rooms: [],
      loading: true,
      error: null,
      // State untuk Dialog
      dialog: false,
      selectedRoom: null,
    };
  },
  async created() {
    await this.fetchRooms();
  },
  methods: {
    async fetchRooms() {
      try {
        const response = await apiClient.get('/kamar');
        if (response.success) {
          this.rooms = response.data;
        } else {
          this.error = response.message || "Gagal memuat data kamar. Silakan coba lagi.";
        }
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal memuat data kamar. Silakan coba lagi.";
        console.error(err);
      } finally {
        this.loading = false;
        // Cek query param setelah data diload
        this.checkInitialQuery();
      }
    },
    checkInitialQuery() {
      const openId = this.$route.query.open;
      if (openId) {
        // Cari room dengan ID tersebut
        const targetRoom = this.rooms.find(r => r.id_kamar == openId);
        if (targetRoom) {
          this.openDetail(targetRoom);
        }
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat('id-ID').format(value);
    },
    parseFacilities(facilitiesJson) {
      try {
        if (Array.isArray(facilitiesJson)) return facilitiesJson;
        return JSON.parse(facilitiesJson || '[]');
      } catch (e) {
        return [];
      }
    },
    // Fungsi untuk membuka Dialog
    openDetail(room) {
      this.selectedRoom = room;
      this.dialog = true;
    },
    // Fungsi pindah ke halaman booking
    goToBooking() {
      this.dialog = false;
      // Gunakan router push jika pengguna menekan "Pesan"
      // Sesuaikan query param agar halaman booking otomatis memilih kamar ini
      this.$router.push({ 
        path: '/booking', 
        query: { room_id: this.selectedRoom.id_kamar } 
      });
    }
  },
};
</script>

<style scoped>
/* Custom CSS seminimal mungkin karena sudah pakai Vuetify */
.bg-black-transparent {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
}
</style>