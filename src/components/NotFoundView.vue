<template>
  <v-container class="fill-height bg-grey-lighten-5" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon 
          icon="mdi-map-marker-question" 
          size="150" 
          color="grey-lighten-1"
          class="mb-4"
        ></v-icon>
        
        <h1 class="text-h2 font-weight-bold text-primary mb-2">404</h1>
        <h2 class="text-h5 font-weight-medium text-grey-darken-2 mb-6">
          Waduh! Halaman tidak ditemukan.
        </h2>
        
        <p class="text-body-1 text-grey-darken-1 mb-8">
          Sepertinya kamu tersesat. Halaman yang kamu cari mungkin sudah dihapus
          atau alamatnya salah ketik.
        </p>

        <div class="d-flex justify-center gap-4">
          <v-btn 
            color="primary" 
            size="large" 
            prepend-icon="mdi-home"
            @click="goHome"
            elevation="2"
          >
            Kembali ke Home
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  // Cek role dari localStorage untuk redirect yang cerdas
  const role = localStorage.getItem('userRole'); // Sesuaikan key penyimpanan role kamu
  if (role === 'owner') {
    router.push('/owner');
  } else {
    router.push('/');
  }
};
</script>