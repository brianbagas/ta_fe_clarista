<template>
  <v-navigation-drawer v-model="drawer" location="right" temporary width="300">
    <v-list-item
      v-if="isCustomer"
      prepend-icon="mdi-account-circle"
      :title="auth.state.user?.name"
      subtitle="Customer Clarista"
      class="pa-4 bg-blue-darken-4 text-white"
    ></v-list-item>

    <v-divider></v-divider>
    
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
      <!-- <v-list-item prepend-icon="mdi-bed" title="Kamar" to="/kamar"></v-list-item> dihapus sementara -->
      <v-list-item prepend-icon="mdi-sale" title="Promo" to="/promo"></v-list-item>
      
      <v-divider class="my-2"></v-divider>

      <template v-if="isCustomer">
        <v-list-subheader>AKUN SAYA</v-list-subheader>
        <v-list-item prepend-icon="mdi-history" title="Riwayat Pesanan" to="/pesanan-saya"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Profil Saya" to="/profile"></v-list-item>
        <v-list-item @click="auth.logout" prepend-icon="mdi-logout" title="Logout" base-color="error" class="mt-4" />
      </template>

      <template v-if="!auth.isAuthenticated.value">
        <v-list-item prepend-icon="mdi-login" title="Login" to="/login"></v-list-item>
        <v-list-item prepend-icon="mdi-account-plus" title="Register" to="/register"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar app class="bg-blue-darken-4" elevation="2">
    
    <v-toolbar-title>Clarista Homestay</v-toolbar-title>
    
    <v-spacer></v-spacer>

    <div class="d-none d-md-flex align-center" v-if="!isOwner">
      <v-btn variant="text" to="/">Home</v-btn>
      <!-- <v-btn variant="text" to="/kamar">Kamar</v-btn> dihapus sementara -->
      <v-btn variant="text" to="/promo">Promo</v-btn>
      <v-btn variant="text" to="/booking">Booking</v-btn>

      <template v-if="!auth.isAuthenticated.value">
        <v-btn variant="text" to="/login">Login</v-btn>
        <v-btn variant="outlined" class="ml-2" to="/register">Register</v-btn>
      </template>

      <v-menu v-if="isCustomer">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="ml-4" variant="tonal">
            <v-icon start>mdi-account-circle</v-icon>
            <span>{{ auth.state.user?.name }}</span>
            <v-icon end>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/pesanan-saya" prepend-icon="mdi-history" title="Riwayat Pesanan" />
          <v-list-item to="/profile" prepend-icon="mdi-account" title="Profil Saya" />
          <v-divider></v-divider>
          <v-list-item @click="auth.logout" prepend-icon="mdi-logout" title="Logout" base-color="error" />
        </v-list>
      </v-menu>
    </div>

    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
  </v-app-bar>
</template>
<script setup>
import { ref, computed } from 'vue';
import * as auth from '../../stores/auth.js';

// State untuk drawer mobile
const drawer = ref(false);

const emit = defineEmits(['toggle-drawer']);

const isOwner = computed(() => auth.isAuthenticated.value && auth.state.user?.role_id== 1);
const isCustomer = computed(() => auth.isAuthenticated.value && auth.state.user?.role_id == 2);

const toggleDrawer = () => {
  emit('toggle-drawer');
};
</script>

<style scoped>


</style>