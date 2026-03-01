<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="text-left">
        <h1 class="text-h4 font-weight-bold" style="color: #333333;">Management Promo</h1>
        <p class="text-grey-darken-1">Kelola promo dan diskon untuk pelanggan.</p>
      </div>
      <v-btn color="primary" elevation="2" prepend-icon="mdi-plus" @click="openAddDialog">
        Tambah Promo
      </v-btn>
    </div>

    <v-card elevation="0" border rounded="lg">

      <v-data-table
        :headers="headers"
        :items="promos"
        :loading="loading"
        class="elevation-4 text-left"
      >
        <template v-slot:[`item.tipe_diskon`]="{ item }">
          <v-chip
            :color="item.tipe_diskon === 'persen' ? 'primary' : 'green'"
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

        <template v-slot:[`item.min_transaksi`]="{ item }">
          {{ formatRupiah(item.min_transaksi) }}
        </template>

        <template v-slot:[`item.kuota`]="{ item }">
           {{ item.kuota ? item.kuota : 'Unlimited' }}
        </template>

        <template v-slot:[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'grey'"
            size="small"
          >
            {{ item.is_active ? 'Aktif' : 'Non-Aktif' }}
          </v-chip>
        </template>

        <template v-slot:[`item.berlaku_mulai`]="{ item }">
          {{ formatDate(item.berlaku_mulai) }}
        </template>

        <template v-slot:[`item.berlaku_selesai`]="{ item }">
          {{ formatDate(item.berlaku_selesai) }}
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
                  v-model="editedItem.min_transaksi"
                  label="Minimal Transaksi"
                  type="number"
                  variant="outlined"
                  prefix="Rp"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.kuota"
                  label="Kuota (Kosongkan jika Unlimited)"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                 <v-switch
                  v-model="editedItem.is_active"
                  :label="`Status: ${editedItem.is_active ? 'Aktif' : 'Non-Aktif'}`"
                  color="success"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.berlaku_mulai"
                  label="Berlaku Mulai"
                  type="date"
                  variant="outlined"
                  :min="todayDate"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.berlaku_selesai"
                  label="Berlaku Selesai"
                  type="date"
                  variant="outlined"
                  :min="editedItem.berlaku_mulai || todayDate"
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
          <v-btn color="primary" variant="text" @click="closeDialog">
            Batal
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="saveItemApi(editedItem) ">
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
          <v-btn color="primary" variant="text" @click="closeDialog">Batal</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteItemApi">Hapus</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import apiClient from '../../axios'; 


// State Dasar
const loading = ref(false);
const dialog = ref(false);
const dialogDelete = ref(false);
const promos = ref([]);
const editedIndex = ref(-1);
const errorMessage = ref(''); 
const isEditing = ref(false);
const API_URL = 'admin/promo'; 

const todayDate = computed(() => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().substring(0, 10);
});

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
    { title: 'Min. Transaksi', key: 'min_transaksi' },
    { title: 'Kuota', key: 'kuota' },
    { title: 'Terpakai', key: 'kuota_terpakai' },
    { title: 'Status', key: 'is_active' },
    { title: 'Berlaku Mulai', key: 'berlaku_mulai' },
    { title: 'Berlaku Selesai', key: 'berlaku_selesai' },
    { title: 'Aksi', key: 'actions', sortable: false },
];

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const defaultItem = {
    id: null,
    nama_promo: '',
    kode_promo: '',
    deskripsi: '',
    tipe_diskon: 'persen',
    nilai_diskon: 0,
    min_transaksi: 0,
    kuota: null,
    kuota_terpakai: 0,
    is_active: true,
    berlaku_mulai: new Date().toISOString().substring(0, 10),
    berlaku_selesai: new Date().toISOString().substring(0, 10),
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
        // Data promo ada di response.data (karena interceptor di axios.js sudah meng-unwrap response.data level axios)
        promos.value = response.data;
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
            if (response.success) {
                Object.assign(promos.value[editedIndex.value], response.data);
                dialog.value = false;
            }
        } else {
            // Logika CREATE (POST)
            delete dataToSave.id; // Pastikan ID tidak terkirim saat create
            response = await apiClient.post(API_URL, dataToSave);
            if (response.success) {
                promos.value.push(response.data);
                dialog.value = false;
            }
        }
    } catch (error) {
        console.error('Error saving data:', error.response || error);
        errorMessage.value = error.response?.data?.message || 'Gagal menyimpan promo';
        throw error; 
    }
};
const openAddDialog = () => {
  isEditing.value = false;
  editedIndex.value = -1;
  Object.assign(editedItem, defaultItem);
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  editedIndex.value = promos.value.indexOf(item); 
  
  // Create a copy of the item
  const itemToEdit = { ...item };
  
  // Format dates to YYYY-MM-DD for input type="date"
  if (itemToEdit.berlaku_mulai) {
    itemToEdit.berlaku_mulai = new Date(itemToEdit.berlaku_mulai).toISOString().substring(0, 10);
  }
  if (itemToEdit.berlaku_selesai) {
    itemToEdit.berlaku_selesai = new Date(itemToEdit.berlaku_selesai).toISOString().substring(0, 10);
  }

  Object.assign(editedItem, itemToEdit);
  dialog.value = true;
};
const openDeleteDialog = (item) => {
  editedIndex.value = promos.value.indexOf(item);
  Object.assign(editedItem, item);
  dialogDelete.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  dialogDelete.value = false;
  nextTick(() => {
    Object.assign(editedItem, defaultItem);
    editedIndex.value = -1;
  });
};

const deleteItemApi = async () => {
    errorMessage.value = '';
    const id = editedItem.id;
    if (!id) return;

    try {
        // Logika DELETE
        await apiClient.delete(`${API_URL}/${id}`);
        // promos.value.splice(editedIndex.value, 1); // Opsional: hapus manual
        await fetchPromos(); // Refresh data supaya status sinkron
        dialogDelete.value = false;
    } catch (error) {
        console.error('Error deleting data:', error.response || error);
        errorMessage.value = 'Gagal menghapus promo: ' + (error.response?.data?.message || 'Terjadi kesalahan server.');
    }
};
onMounted(fetchPromos);

// ... (Semua Event Handlers, Lifecycle hook onMounted, dan Template VUE/Vuetify tetap sama) ...

</script>

