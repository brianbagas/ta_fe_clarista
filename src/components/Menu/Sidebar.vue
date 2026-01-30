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
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/owner"></v-list-item>
      <v-list-item prepend-icon="mdi-bed" title="Kelola Kamar" to="/admin/kamar"></v-list-item>
      <v-list-item prepend-icon="mdi-ticket-percent" title="Kelola Promo" to="/admin/promo"></v-list-item>
      <v-list-item prepend-icon="mdi-file-document-edit" title="Kelola Konten" to="/admin/konten"></v-list-item>
      <v-list-item prepend-icon="mdi-file-document-edit" title="Daftar Pesanan" to="/admin/pesanan"></v-list-item>
      <v-list-item prepend-icon="mdi-chart-bar" title="Laporan" to="/admin/laporan"></v-list-item>
      <v-list-item prepend-icon="mdi-cash-check" title="Verifikasi Pembayaran" to="/admin/verifikasi-pembayaran"></v-list-item>
      <v-list-item prepend-icon="mdi-cash-check" title="Review" to="/admin/review"></v-list-item>
      <v-list-item prepend-icon="mdi-account-plus" title="Walk-in Guest" to="/admin/storeOffline"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
// Sesuaikan path ini dengan implementasi Anda
import * as auth from '../../stores/auth.js'; // <-- Impor auth.js
</script>