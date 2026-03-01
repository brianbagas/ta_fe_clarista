<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="text-left">
        <h1 class="text-h4 font-weight-bold" style="color: #333333;">Manajemen Kamar</h1>
        <p class="text-grey-darken-1">Kelola tipe kamar, harga, dan ketersediaan homestay.</p>
      </div>
      <v-btn color="primary" elevation="2" prepend-icon="mdi-plus" @click="openAddDialog">
        Tambah Tipe Kamar
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = null">
      {{ error }}
    </v-alert>

    <v-row v-if="!loading">
      <v-col cols="12" v-if="kamars.length === 0" class="text-center mt-10">
        <v-icon size="100" color="grey-darken-2">mdi-bed-empty</v-icon>
        <h3 class="text-h5 text-grey mt-4">Belum ada tipe kamar</h3>
        <p class="text-grey">Silakan tambahkan tipe kamar baru untuk memulai.</p>
      </v-col>

      <v-col v-for="kamar in kamars" :key="kamar.id_kamar" cols="12" sm="6" md="4" lg="3">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            class="h-100 rounded-lg transition-swing d-flex flex-column"
          >
            <v-img
              v-if="kamar.thumbnail && kamar.thumbnail !== 'null'"
              height="200px"
              :src="kamar.thumbnail"
              cover
              class="align-end"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
                </div>
              </template>
              <template v-slot:error>
                <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3 flex-column">
                  <v-icon size="48" color="grey-darken-2">mdi-image-off</v-icon>
                  <div class="text-caption text-grey mt-2">No Image</div>
                </div>
              </template>
            </v-img>
            <v-sheet
              v-else
              height="200px"
              color="grey-lighten-3"
              class="d-flex align-center justify-center flex-column"
            >
              <v-icon size="48" color="grey-darken-2">mdi-image-off</v-icon>
              <div class="text-caption text-grey mt-2">No Image Available</div>
            </v-sheet>

            <v-card-item>
              <div class="d-flex justify-space-between align-start">
                <v-card-title class="font-weight-bold pt-0">{{ kamar.tipe_kamar }}</v-card-title>
                <v-chip size="small" color="success" variant="flat" class="font-weight-bold">
                  Active
                </v-chip>
              </div>
              <v-card-subtitle class="text-primary text-h6 mt-1 font-weight-bold">
                {{ formatCurrency(kamar.harga) }} <span class="text-caption text-grey">/ malam</span>
              </v-card-subtitle>
            </v-card-item>

            <v-card-text class="text-medium-emphasis flex-grow-1">
              <div class="text-truncate-3-lines">
                {{ kamar.deskripsi || 'Tidak ada deskripsi tersedia.' }}
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4 flex-wrap gap-2">
                 <v-btn
                variant="outlined"
                color="secondary"
                class="flex-grow-1 mb-2"
                prepend-icon="mdi-format-list-bulleted"
                @click="openUnitDialog(kamar)"
              >
                List Unit
              </v-btn>
              <v-btn
                variant="tonal"
                color="primary"
                class="flex-grow-1 mb-2"
                prepend-icon="mdi-pencil"
                @click="openEditDialog(kamar)"
              >
                Edit Info
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- Section Daftar Kamar Kotor -->
    <div v-if="dirtyUnits.length > 0" class="mt-8 mb-4 text-left">
      <v-divider class="mb-6"></v-divider>
      <h2 class="text-h5 font-weight-bold text-error mb-2 d-flex align-center">
        <v-icon icon="mdi-broom" color="grey-darken-2" class="mr-2"></v-icon>
        Daftar Kamar Kotor (Perlu Dibersihkan)
      </h2>
      <p class="text-subtitle-2 text-medium-emphasis mb-4">Unit kamar di bawah ini berstatus kotor dan belum siap untuk check-in.</p>
      
      <v-card variant="flat" class="border" rounded="lg">
        <v-table>
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="text-left font-weight-bold">Nomor Unit</th>
              <th class="text-left font-weight-bold">Tipe Kamar</th>
              <th class="text-left font-weight-bold">Status Saat Ini</th>
              <th class="text-left font-weight-bold">Terakhir Update</th>
              <th class="text-right font-weight-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unit in dirtyUnits" :key="unit.id">
              <td class="font-weight-bold text-body-1">{{ unit.nomor_unit }}</td>
              <td>{{ unit.kamar?.tipe_kamar || 'Unknown' }}</td>
              <td>
                <v-chip color="error" variant="flat" size="small" class="text-uppercase font-weight-bold">
                  {{ unit.status_unit }}
                </v-chip>
              </td>
              <td class="text-grey-darken-1">{{ new Date(unit.updated_at).toLocaleString('id-ID') }}</td>
              <td class="text-right">
                <v-btn
                  color="success"
                  size="small"
                  variant="flat"
                  prepend-icon="mdi-check-circle"
                  @click="markAsClean(unit.id)"
                  :loading="loadingAction === unit.id"
                >
                  Sudah Dibersihkan
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </div>

    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <span>{{ isEditing ? 'Edit Informasi Kamar' : 'Tambah Kamar Baru' }}</span>
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 mt-2">
          <v-form ref="form" v-model="valid">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  label="Tipe Kamar"
                  v-model="editedItem.tipe_kamar"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-bed"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  label="Deskripsi & Fasilitas"
                  v-model="editedItem.deskripsi"
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  rows="3"
                  auto-grow
                ></v-textarea>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  label="Harga per Malam"
                  v-model="editedItem.harga"
                  type="number"
                  prefix="Rp"
                  :rules="[rules.required, rules.positive]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
               <v-col cols="12" md="6" v-if="!isEditing">
                <v-text-field
                  label="Jumlah Unit Kamar"
                  v-model="editedItem.jumlah_total"
                  type="number"
                  :rules="[rules.required, rules.positive]"
                  prepend-inner-icon="mdi-home-plus"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                 <h4 class="text-subtitle-2 mb-2">Foto Saat Ini</h4>
                 <div v-if="editedItem.images && editedItem.images.length > 0" class="d-flex flex-wrap gap-2">
                    <div v-for="img in editedItem.images" :key="img.id" class="position-relative" style="width: 100px; height: 100px;">
                        <v-img :src="img.url" cover class="rounded-lg border" height="100%"></v-img>
                        <v-btn
                          icon="mdi-close"
                          size="x-small"
                          color="error"
                          variant="flat"
                          class="position-absolute"
                          style="top: -5px; right: -5px;"
                          @click="deleteImage(img.id)"
                        ></v-btn>
                    </div>
                 </div>
                 <p v-else class="text-caption text-grey">Belum ada foto.</p>
              </v-col>

               <v-col cols="12">
                <v-file-input
                  label="Foto Kamar (Bisa pilih banyak)"
                  multiple
                  @change="onFileChange"
                  accept="image/*"
                  chips
                  show-size
                  prepend-inner-icon="mdi-camera"
                  variant="outlined"
                  hint="Kosongkan jika tidak ingin mengubah foto"
                  persistent-hint
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
          <small class="text-caption text-grey">*Wajib diisi</small>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            v-if="isEditing"
            color="error"
            variant="text"
            prepend-icon="mdi-delete"
            @click="confirmDeleteDialog = true"
          >
            Hapus Kamar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="closeDialog">Batal</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            elevation="2"
            :loading="saving"
            @click="saveItem"
            :disabled="!valid"
          >
            Simpan Data
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Hapus Kamar?</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus tipe kamar <strong>{{ editedItem.tipe_kamar }}</strong>? Tindakan ini tidak dapat dibatalkan.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="confirmDeleteDialog = false">Batal</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteItem" :loading="deleting">Ya, Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>

    <ManageKamarUnitsView 
        v-model="unitDialog" 
        :kamar="selectedKamarForUnits" 
    />

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../axios';

import ManageKamarUnitsView from './ManageKamarUnitsView.vue'; // Import component baru

// State
const kamars = ref([]);
const dirtyUnits = ref([]); // State untuk daftar kamar kotor
const loading = ref(true);
const loadingAction = ref(null); // Untuk loading button per row
const error = ref(null);
const saving = ref(false); // Loading state saat simpan
const deleting = ref(false); // Loading state saat hapus
const dialog = ref(false);
const confirmDeleteDialog = ref(false);
const isEditing = ref(false);
const valid = ref(false);
const form = ref(null);

const unitDialog = ref(false);
const selectedKamarForUnits = ref(null);
const selectedImageFiles = ref([]); // State ARRAY buat banyak file
const deletedImageIds = ref([]); // State ARRAY untuk ID gambar yang akan dihapus

// Snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Form Data
const editedItem = ref({
  id_kamar: null,
  tipe_kamar: '',
  deskripsi: '',
  harga: 0,
  jumlah_total: 1, 
  imageFile: null, // Untuk menampung file upload
});

// Validation Rules
const rules = {
  required: value => !!value || 'Field ini wajib diisi.',
  positive: value => value >= 0 || 'Harga tidak boleh negatif.',
};

// Utilities
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

const showNotification = (text, color = 'success') => {
  snackbar.value = { show: true, text, color };
};

// API Actions
const fetchKamars = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/kamar');
    if (response.success) {
      kamars.value = response.data;
    } else {
      error.value = response.message || 'Gagal memuat data kamar.';
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal memuat data kamar.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchDirtyUnits = async () => {
  try {
    const response = await apiClient.get('/admin/kamar-dirty');
    if (response.success) {
      dirtyUnits.value = response.data;
    }
  } catch (err) {
    console.error('Gagal memuat data kamar kotor:', err);
  }
};

const markAsClean = async (unitId) => {
  loadingAction.value = unitId;
  try {
    const response = await apiClient.put(`/admin/kamar-units/${unitId}`, {
      // Endpoint ini mengharapkan logika setAvailable
      // Berdasarkan PenempatanKamarController::setAvailable
    });
    
    if (response.success) {
      showNotification('Status kamar berhasil diperbarui menjadi Available', 'success');
      // Refresh list
      await fetchDirtyUnits();
      // Optional: Refresh list kamar utama juga kalau status available mempengaruhi count
      await fetchKamars();
    } else {
       showNotification(response.message || 'Gagal mengubah status kamar.', 'error');
    }
  } catch (err) {
    console.error('Gagal update status:', err);
    showNotification(err.response?.data?.message || 'Gagal mengubah status kamar.', 'error');
  } finally {
    loadingAction.value = null;
  }
};

const saveItem = async () => {
  // Cek validasi form dulu
  const { valid } = await form.value.validate();
  if (!valid) return;

  saving.value = true;
  
  // PENTING: Gunakan FormData untuk support upload file (Laravel butuh ini)
  let formData = new FormData();
  formData.append('tipe_kamar', editedItem.value.tipe_kamar);
  formData.append('deskripsi', editedItem.value.deskripsi || '');
  formData.append('harga', editedItem.value.harga);
  
  // Handle Multiple Files
  if (selectedImageFiles.value.length > 0) {
      // Loop dan append sebagai array (gambar_kamar[])
      for (let i = 0; i < selectedImageFiles.value.length; i++) {
        formData.append('gambar_kamar[]', selectedImageFiles.value[i]);
      }
  }

  // Handle Deletion (Deferred)
  if (deletedImageIds.value.length > 0) {
      for (let i = 0; i < deletedImageIds.value.length; i++) {
        formData.append('deleted_images[]', deletedImageIds.value[i]);
      }
  }

  // Jika metode PUT di Laravel kadang bermasalah dengan FormData, gunakan trik _method
  if (isEditing.value) {
      formData.append('_method', 'PUT'); 
  }

  try {
    let response;
    if (isEditing.value) {
      response = await apiClient.post(`/admin/kamar/${editedItem.value.id_kamar}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      formData.append('jumlah_total', editedItem.value.jumlah_total);
      response = await apiClient.post('/admin/kamar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    if (response.success) {
      showNotification(response.message);
      closeDialog();
      await fetchKamars();
    } else {
      showNotification(response.message || 'Gagal menyimpan data.', 'error');
    }
  } catch (err) {
    console.error('Gagal menyimpan:', err);
    showNotification(err.response?.data?.message || 'Gagal menyimpan data.', 'error');
  } finally {
    saving.value = false;
  }
};

const deleteItem = async () => {
  deleting.value = true;
  try {
    const response = await apiClient.delete(`/admin/kamar/${editedItem.value.id_kamar}`);
    if (response.success) {
      showNotification(response.message);
      confirmDeleteDialog.value = false;
      closeDialog();
      await fetchKamars();
    } else {
      showNotification(response.message || 'Gagal menghapus data.', 'error');
    }
  } catch (err) {
    console.error('Gagal menghapus:', err);
    showNotification(err.response?.data?.message || 'Gagal menghapus data.', 'error');
  } finally {
    deleting.value = false;
  }
};

const deleteImage = (imageId) => {
    // Cuma tandai delete secara lokal, jangan panggil API dulu
    if(!deletedImageIds.value.includes(imageId)) {
        deletedImageIds.value.push(imageId);
    }
    // Sembunyikan dari UI
    editedItem.value.images = editedItem.value.images.filter(img => img.id !== imageId);
};

const onFileChange = (event) => {
  // Ambil FileList lalu convert ke Array jika perlu, atau simpan langsung
  const files = event.target.files; 
  if (files && files.length > 0) {
    selectedImageFiles.value = files; 
  }
};

// Dialog Handlers
const openAddDialog = () => {
  isEditing.value = false;
  editedItem.value = { id_kamar: null, tipe_kamar: '', deskripsi: '', harga: 0, jumlah_total: 1 };
  selectedImageFiles.value = []; // Reset array
  deletedImageIds.value = []; // Reset delete list
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  // Clone item agar tidak merubah tampilan tabel secara langsung saat mengetik
  editedItem.value = { ...item }; 
  // IMPORTANT: Deep clone images if necessary, but handled by Vue reactivity mostly ok for filter
  // But if we modify inside editedItem, we should accept that
  if (!editedItem.value.images) editedItem.value.images = [];
  
  selectedImageFiles.value = []; // Reset array
  deletedImageIds.value = []; // Reset delete list
  dialog.value = true;
};

const openUnitDialog = (item) => {
    selectedKamarForUnits.value = item;
    unitDialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  // Reset form validation
  if(form.value) form.value.resetValidation();
};

onMounted(() => {
  fetchKamars();
  fetchDirtyUnits();
});
</script>

<script>
// Separate script block for imports if needed, but setup script matches best
</script>

<style scoped>
/* Helper class untuk membatasi deskripsi menjadi 3 baris */
.text-truncate-3-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 4.5em; /* Menjaga tinggi card tetap konsisten */
}
</style>