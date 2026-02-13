<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    class="elevation-1 text-left"
  >
    <template v-slot:[`item.actions`]="{ item }">
      <v-btn
        color="success"
        size="small"
        class="me-2"
        variant="text"
        prepend-icon="mdi-restore"
        @click="$emit('restore', item)"
      >
        Restore
      </v-btn>
      <v-btn
        color="error"
        size="small"
        variant="text"
        prepend-icon="mdi-delete-forever"
        @click="$emit('force-delete', item)"
      >
        Hapus
      </v-btn>
    </template>
    
    <!-- Custom Formatters -->
    <template v-slot:[`item.harga`]="{ item }">
      Rp {{ new Intl.NumberFormat('id-ID').format(item.harga) }}
    </template>
    <template v-slot:[`item.total_bayar`]="{ item }">
      Rp {{ new Intl.NumberFormat('id-ID').format(item.total_bayar) }}
    </template>
    <template v-slot:[`item.jumlah_bayar`]="{ item }">
      Rp {{ new Intl.NumberFormat('id-ID').format(item.jumlah_bayar) }}
    </template>
  </v-data-table>
</template>

<script setup>
defineProps(['headers', 'items', 'loading']);
defineEmits(['restore', 'force-delete']);
</script>
