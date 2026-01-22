<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Manajemen Kamar</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Kelola tipe kamar, harga, dan ketersediaan homestay.</p>
      </div>
      <v-btn color="primary" elevation="2" prepend-icon="mdi-plus" size="large" @click="openAddDialog">
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
        <v-icon size="100" color="grey-lighten-2">mdi-bed-empty</v-icon>
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
              height="200px"
              :src="kamar.gambar_url || 'https://placehold.co/600x400?text=No+Image'"
              cover
              class="align-end"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
                </div>
              </template>
            </v-img>

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

            <v-card-actions class="pa-4">
              <v-btn
                variant="tonal"
                color="primary"
                block
                prepend-icon="mdi-pencil"
                @click="openEditDialog(kamar)"
              >
                Manage & Edit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

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

               <v-col cols="12" md="6">
                <v-file-input
                  label="Foto Kamar"
                  v-model="editedItem.imageFile"
                  accept="image/*"
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

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../axios';

// State
const kamars = ref([]);
const loading = ref(true);
const error = ref(null);
const saving = ref(false); // Loading state saat simpan
const deleting = ref(false); // Loading state saat hapus
const dialog = ref(false);
const confirmDeleteDialog = ref(false);
const isEditing = ref(false);
const valid = ref(false);
const form = ref(null);

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
    kamars.value = response.data.data;
  } catch (err) {
    error.value = 'Gagal memuat data kamar.';
    console.error(err);
  } finally {
    loading.value = false;
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
  
  // Hanya append file jika user memilih gambar baru
  if (editedItem.value.imageFile) {
      // Pastikan backend menghandle 'gambar_kamar'
      formData.append('gambar_kamar', editedItem.value.imageFile[0]); 
  }

  // Jika metode PUT di Laravel kadang bermasalah dengan FormData, gunakan trik _method
  if (isEditing.value) {
      formData.append('_method', 'PUT'); 
  }

  try {
    if (isEditing.value) {
      // Perhatikan URL dan payload (gunakan formData)
      await apiClient.post(`/admin/kamar/${editedItem.value.id_kamar}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Data kamar berhasil diperbarui');
    } else {
      formData.append('jumlah_total', editedItem.value.jumlah_total);
      await apiClient.post('/admin/kamar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Kamar baru beserta unitnya berhasil ditambahkan');
    }
    closeDialog();
    await fetchKamars();
  } catch (err) {
    console.error('Gagal menyimpan:', err);
    showNotification('Gagal menyimpan data. Cek koneksi atau input.', 'error');
  } finally {
    saving.value = false;
  }
};

const deleteItem = async () => {
  deleting.value = true;
  try {
    await apiClient.delete(`/admin/kamar/${editedItem.value.id_kamar}`);
    showNotification('Kamar berhasil dihapus');
    confirmDeleteDialog.value = false;
    closeDialog();
    await fetchKamars();
  } catch (err) {
    console.error('Gagal menghapus:', err);
    showNotification('Gagal menghapus data.', 'error');
  } finally {
    deleting.value = false;
  }
};

// Dialog Handlers
const openAddDialog = () => {
  isEditing.value = false;
  editedItem.value = { id_kamar: null, tipe_kamar: '', deskripsi: '', harga: 0, jumlah_total: 1, imageFile: null };
  dialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  // Clone item agar tidak merubah tampilan tabel secara langsung saat mengetik
  editedItem.value = { ...item, imageFile: null }; 
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  // Reset form validation
  if(form.value) form.value.resetValidation();
};

onMounted(fetchKamars);
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