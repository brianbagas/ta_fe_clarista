<template>
  <v-footer class="bg-blue-darken-4 text-white pt-10 pb-5">
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <div class="text-h6 font-weight-bold mb-3">Clarista Homestay</div>
          <p class="text-body-2 text-blue-lighten-4">
            Penginapan nyaman dan strategis untuk keluarga maupun solo traveler. 
            Nikmati fasilitas terbaik dengan harga terjangkau.
          </p>
        </v-col>

        <v-col cols="12" md="2">
          <div class="text-subtitle-1 font-weight-bold mb-3"></div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item to="/" class="px-0 text-blue-lighten-4">Home</v-list-item>
            <v-list-item to="/kamar" class="px-0 text-blue-lighten-4">Daftar Kamar</v-list-item>
            <v-list-item to="/promo" class="px-0 text-blue-lighten-4">Promo</v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" md="4">
          <div class="text-subtitle-1 font-weight-bold mb-3">Hubungi Kami</div>
          <div class="d-flex align-center mb-2" v-if="content.alamat">
            <v-icon start size="small">mdi-map-marker</v-icon>
            <span class="text-body-2">{{ content.alamat || 'Alamat belum diatur' }}</span>
          </div>
          <div class="d-flex align-center mb-2" v-if="content.telepon">
            <v-icon start size="small">mdi-whatsapp</v-icon>
            <span class="text-body-2">{{ content.telepon || '-' }}</span>
          </div>
          <div class="d-flex align-center" v-if="content.email">
            <v-icon start size="small">mdi-email-outline</v-icon>
            <span class="text-body-2">{{ content.email || '-' }}</span>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-5 border-opacity-25"></v-divider>

      <div class="text-center text-caption text-blue-lighten-3">
        &copy; 2026 Clarista Homestay. All Rights Reserved. 
      </div>
    </v-container>
  </v-footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../axios';

const content = ref({
    alamat: '',
    telepon: '',
    email: ''
});

const fetchContent = async () => {
    try {
        const response = await apiClient.get('/content/homepage');
        if (response.success && response.data) {
            content.value = response.data;
        }
    } catch (err) {
        console.error("Gagal memuat konten footer:", err);
    }
};

onMounted(() => {
    fetchContent();
});
</script>