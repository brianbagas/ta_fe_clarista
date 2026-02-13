<template>
  <v-navigation-drawer
    expand-on-hover
    permanent
    rail
    app
    color="bg-blue-darken-4"
    theme="dark"
  >
    <v-list>
      <v-list-item
        prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
        :subtitle="auth.state.user?.email"
        :title="auth.state.user?.name"
        to="/profile" 
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/owner"></v-list-item>
      <v-list-item prepend-icon="mdi-bed" title="Kelola Kamar" to="/admin/kamar"></v-list-item>
      <v-list-item prepend-icon="mdi-ticket-percent" title="Kelola Promo" to="/admin/promo"></v-list-item>
      <v-list-item prepend-icon="mdi-file-document-edit" title="Kelola Konten" to="/admin/konten"></v-list-item>
      <v-list-item prepend-icon="mdi-order-bool-ascending-variant" title="Daftar Pesanan" to="/admin/pesanan"></v-list-item>
      <v-list-item prepend-icon="mdi-file-document" title="Laporan" to="/admin/laporan" color="primary"></v-list-item>
      
      <v-divider class="my-2"></v-divider>
      
      <v-list-item prepend-icon="mdi-delete-restore" title="Data Terhapus" to="/admin/hapus-data" color="error"></v-list-item>

      <!-- <v-list-item prepend-icon="mdi-cash-check" title="Verifikasi Pembayaran" to="/admin/verifikasi-pembayaran"></v-list-item> -->
      <v-list-item prepend-icon="mdi-star" title="Review" to="/admin/review"></v-list-item>
      <v-list-item prepend-icon="mdi-account-plus" title="Walk-in Guest" to="/admin/storeOffline"></v-list-item>
    </v-list>

    <template v-slot:append>
        <div class="pa-2">
            <v-list density="compact" nav>
                <v-list-item 
                    prepend-icon="mdi-logout" 
                    title="Logout" 
                    @click="auth.logout" 
                    class="text-error"
                ></v-list-item>
            </v-list>
        </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
// Sesuaikan path ini dengan implementasi Anda
import * as auth from '../../stores/auth.js'; // <-- Impor auth.js
</script>