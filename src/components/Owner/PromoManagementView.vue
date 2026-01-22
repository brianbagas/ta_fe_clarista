<template>
  <v-container fluid
  >
    <v-card class="elevation-2 ">
      <v-toolbar flat>
        <v-toolbar-title >Management Promo</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        
        <v-btn color="primary" variant="elevated" @click="openAddDialog">
          Tambah Promo
        </v-btn>
      </v-toolbar>

      <v-data-table
        :headers="headers"
        :items="promos"
        :loading="loading"
        class="elevation-4 text-left"
      >
        <template v-slot:[`item.tipe_diskon`]="{ item }">
          <v-chip
            :color="item.tipe_diskon === 'persen' ? 'blue' : 'green'"
            size="small"
            class="text-uppercase "
          >
            {{ item.tipe_diskon }}
          </v-chip>
        </template>

        <template v-slot:[`item.nilai_diskon`]="{ item }">
          <span v-if="item.tipe_diskon === 'persen'">
            {{ item.nilai_diskon }}%
          </span>
          <span v-else>
            {{ formatRupiah(item.nilai_diskon) }}
          </span>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-icon icon="mdi-pencil" size="large"  @click="openEditDialog(item)">
            mdi-pencil
          </v-icon>
          <v-icon icon="mdi-delete" size="large" color="error" @click="openDeleteDialog(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.nama_promo"
                  label="Nama Promo"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.kode_promo"
                  label="Kode Promo"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.tipe_diskon"
                  :items="['persen', 'nominal']"
                  label="Tipe Diskon"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.nilai_diskon"
                  label="Nilai Diskon"
                  type="number"
                  variant="outlined"
                  :prefix="editedItem.tipe_diskon === 'nominal' ? 'Rp' : ''"
                  :suffix="editedItem.tipe_diskon === 'persen' ? '%' : ''"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.berlaku_mulai"
                  label="Berlaku Mulai"
                  type="date"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.berlaku_selesai"
                  label="Berlaku Selesai"
                  type="date"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.deskripsi"
                  label="Deskripsi"
                  rows="3"
                  variant="outlined"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
            Batal
          </v-btn>
          <v-btn color="blue-darken-1" variant="elevated" @click="saveItemApi(editedItem) ">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Yakin ingin menghapus item ini?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">Batal</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteItemApi">Hapus</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
// 1. Import apiClient yang sudah memiliki Interceptor
import apiClient from '../../axios'; // <-- SESUAIKAN PATH INI!


// State Dasar
const loading = ref(false);
const dialog = ref(false);
const dialogDelete = ref(false);
const promos = ref([]);
const editedIndex = ref(-1);
const errorMessage = ref(''); 
const isEditing = ref(false);
// --- KONFIGURASI API UTAMA ---
// Base URL sudah di apiClient, jadi hanya perlu path relatif
const API_URL = 'admin/promo'; 

const formatRupiah = (value) => {
  if (!value) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};
const formTitle = computed(() =>
  editedIndex.value === -1 ? 'Tambah Promo' : 'Edit Promo'
);

// ... (Definisi Headers, defaultItem, editedItem, formTitle, dan formatRupiah tetap sama) ...
// (Saya hilangkan untuk keringkasan, tetapi pastikan kode ini ada di bagian atas Anda)
const headers = [
    { title: 'Nama Promo', key: 'nama_promo' },
    { title: 'Kode Promo', key: 'kode_promo' },
    { title: 'Tipe Diskon', key: 'tipe_diskon' },
    { title: 'Nilai Diskon', key: 'nilai_diskon' },
    { title: 'Berlaku Mulai', key: 'berlaku_mulai' },
    { title: 'Berlaku Selesai', key: 'berlaku_selesai' },
    { title: 'Aksi', key: 'actions', sortable: false },
];

const defaultItem = {
    id: null,
    nama_promo: '',
    kode_promo: '',
    deskripsi: '',
    tipe_diskon: 'persen',
    nilai_diskon: 0,
    berlaku_mulai: new Date().toISOString().substr(0, 10),
    berlaku_selesai: new Date().toISOString().substr(0, 10),
};
const editedItem = reactive({ ...defaultItem });

const fetchPromos = async () => {
    loading.value = true;
    errorMessage.value = '';
     console.log('Error details:');
    try {
        // TIDAK PERLU HEADER OTENTIKASI MANUAL KARENA SUDAH ADA INTERCEPTOR!
        const response = await apiClient.get(API_URL);
        console.log('Error details 2:');
        // Asumsi data promo ada di response.data.data
        promos.value = response.data.data ;
    } catch (error) {
      console.log('Error details 3:');
        console.error('Error fetching data:', error);
        console.log('Error details:', error.response || error);
        errorMessage.value = 'Gagal memuat data promo: ' + (error.message || error.response?.data?.message || 'Terjadi kesalahan server.');
    } finally {
      console.log('Error details 4:');
        loading.value = false;
    }
};


const saveItemApi = async (item) => {
    errorMessage.value = '';
    try {
        let response;
        const dataToSave = { ...item };
        
        if (editedIndex.value > -1) {
            // Logika UPDATE (PUT)
            response = await apiClient.put(`${API_URL}/${item.id}`, dataToSave);
            Object.assign(promos.value[editedIndex.value], response.data.data || response.data); 
        } else {
            // Logika CREATE (POST)
            delete dataToSave.id; // Pastikan ID tidak terkirim saat create
            response = await apiClient.post(API_URL, dataToSave);
            promos.value.push(response.data.data || response.data); 
            dialog.value = false;
        }
    } catch (error) {
        console.error('Error saving data:', error.response || error);
        errorMessage.value = 'Gagal menyimpan promo: ' + (error.response?.data?.message || 'Terjadi kesalahan server.');
        throw error; 
    }
};
const openAddDialog = () => {
  isEditing.value = false;
  editedItem.value = { id_kamar: null, tipe_kamar: '', deskripsi: '', harga: 0 };
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  editedItem.value = { ...item };
  dialog.value = true;
};
const openDeleteDialog = (item) => {
  dialogDelete.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  dialogDelete.value = false;
};
const deleteItemApi = async (id) => {
    errorMessage.value = '';
    try {
        // Logika DELETE
        await apiClient.delete(`${API_URL}/${id}`);
        promos.value.splice(editedIndex.value, 1);
    } catch (error) {
        console.error('Error deleting data:', error.response || error);
        errorMessage.value = 'Gagal menghapus promo: ' + (error.response?.data?.message || 'Terjadi kesalahan server.');
        throw error;
    }
};
onMounted(fetchPromos);

// ... (Semua Event Handlers, Lifecycle hook onMounted, dan Template VUE/Vuetify tetap sama) ...

</script>

