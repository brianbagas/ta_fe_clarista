<template>
  <v-container>
    <h1 class="text-h4 mb-4 text-left">Manajemen Halaman Publik</h1>

    <v-card>
      <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="hero">Hero Section</v-tab>
        <v-tab value="kontak">Info Kontak & Lokasi</v-tab>
        <v-tab value="bank">Rekening Bank</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="hero">
            <v-form @submit.prevent="saveContent">
              <v-text-field
                label="Teks Headline (Opsional)"
                v-model="content.hero_title"
                hint="Teks utama yang muncul di atas gambar"
              ></v-text-field>
               <v-text-field
                label="Teks Sub-Headline (Opsional)"
                v-model="content.hero_subtitle"
                hint="Teks pendukung di bawah headline"
                class="mt-4"
              ></v-text-field>
              <v-file-input
                label="Ganti Gambar Banner Utama"
                @change="onFileChange"
                accept="image/*"
                class="mt-4"
              ></v-file-input>
              <v-btn type="submit" color="primary" :loading="loading">Simpan Perubahan Hero</v-btn>
            </v-form>
          </v-window-item>

          <v-window-item value="kontak">
             <v-form @submit.prevent="saveContent">
                <v-textarea
                    label="Alamat Lengkap"
                    v-model="content.alamat"
                    rows="3"
                ></v-textarea>
                <v-text-field
                    label="Nomor Telepon"
                    v-model="content.telepon"
                    class="mt-4"
                ></v-text-field>
                <v-text-field
                    label="Alamat Email"
                    v-model="content.email"
                    class="mt-4"
                ></v-text-field>
                <v-text-field
                    label="Link Embed Google Maps (dari Share -> Embed a map)"
                    v-model="content.link_gmaps"
                    hint="Pastikan link yang dimasukkan adalah link dari src='...' pada tab Embed a map di Google Maps"
                    persistent-hint
                    class="mt-4"
                ></v-text-field>
                <v-btn type="submit" color="primary" :loading="loading">Simpan Info Kontak</v-btn>
             </v-form>
          </v-window-item>

          <!-- TAB REKENING BANK -->
          <v-window-item value="bank">
             <div class="d-flex justify-space-between text-left mb-4">
                <h3 class="text-h6">Daftar Rekening Bank</h3>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openBankDialog()">Tambah Bank</v-btn>
             </div>

             <v-table>
                <thead>
                    <tr>
                        <th class="text-left">Nama Bank</th>
                        <th class="text-left">Nomor Rekening</th>
                        <th class="text-left">Atas Nama</th>
                        <th class="text-left">Status</th>
                        <th class="text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody class="text-left">
                    <tr v-for="bank in bankList" :key="bank.id">
                        <td>{{ bank.nama_bank }}</td>
                        <td>{{ bank.nomor_rekening }}</td>
                        <td>{{ bank.atas_nama }}</td>
                        <td>
                            <v-chip size="small" :color="bank.is_active ? 'success' : 'grey'">
                                {{ bank.is_active ? 'Aktif' : 'Non-Aktif' }}
                            </v-chip>
                        </td>
                        <td>
                            <v-btn icon="mdi-pencil" size="small" variant="text" color="blue" @click="openBankDialog(bank)"></v-btn>
                            <v-btn icon="mdi-delete" size="small" variant="text" color="red" @click="confirmDeleteBank(bank)"></v-btn>
                        </td>
                    </tr>
                    <tr v-if="bankList.length === 0">
                        <td colspan="5" class="text-center py-4 text-grey">Belum ada data rekening bank.</td>
                    </tr>
                </tbody>
             </v-table>
          </v-window-item>

        </v-window>
      </v-card-text>
    </v-card>

    <v-dialog v-model="bankDialog.show" max-width="500">
        <v-card>
            <v-card-title>{{ bankDialog.isEdit ? 'Edit Rekening Bank' : 'Tambah Rekening Bank' }}</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveBank">
                    <v-text-field v-model="bankForm.nama_bank" label="Nama Bank" required></v-text-field>
                    <v-text-field v-model="bankForm.nomor_rekening" label="Nomor Rekening" required class="mt-2"></v-text-field>
                    <v-text-field v-model="bankForm.atas_nama" label="Atas Nama" required class="mt-2"></v-text-field>
                    <v-switch v-model="bankForm.is_active" label="Status Aktif" color="primary" class="mt-2"></v-switch>
                    
                    <div class="d-flex justify-end mt-4">
                        <v-btn variant="text" @click="bankDialog.show = false">Batal</v-btn>
                        <v-btn type="submit" color="primary" :loading="bankDialog.loading">Simpan</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog.show" max-width="400">
        <v-card>
            <v-card-title class="text-h6">Konfirmasi Hapus</v-card-title>
            <v-card-text>Apakah Anda yakin ingin menghapus rekening ini?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="deleteDialog.show = false">Batal</v-btn>
                <v-btn color="error" :loading="deleteDialog.loading" @click="deleteBank">Hapus</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
        {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import apiClient from '../axios';
import { state } from '../stores/auth';
import { fetchUser } from '../stores/auth';

onMounted(() => {
  fetchUser();
  fetchContent();
  fetchBanks();
});

const tab = ref(null);
const loading = ref(false);
const error = ref(null);
const content = ref({});
const heroImageFile = ref(null);

const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
});

// --- BANK ACCOUNT STATE & LOGIC ---
const bankList = ref([]);
const bankDialog = reactive({
    show: false,
    isEdit: false,
    loading: false,
    id: null
});
const bankForm = reactive({
    nama_bank: '',
    nomor_rekening: '',
    atas_nama: '',
    is_active: true
});
const deleteDialog = reactive({
    show: false,
    loading: false,
    id: null
});

const fetchBanks = async () => {
    try {
        const response = await apiClient.get('/admin/bank-accounts');
        if (response.success) {
            bankList.value = response.data;
        }
    } catch (err) {
        console.error("Failed to fetch banks", err);
    }
};

const openBankDialog = (bank = null) => {
    bankDialog.show = true;
    bankDialog.isEdit = !!bank;
    bankDialog.loading = false;
    
    if (bank) {
        bankDialog.id = bank.id;
        bankForm.nama_bank = bank.nama_bank;
        bankForm.nomor_rekening = bank.nomor_rekening;
        bankForm.atas_nama = bank.atas_nama;
        bankForm.is_active = !!bank.is_active;
    } else {
        bankDialog.id = null;
        bankForm.nama_bank = '';
        bankForm.nomor_rekening = '';
        bankForm.atas_nama = '';
        bankForm.is_active = true;
    }
};

const saveBank = async () => {
    bankDialog.loading = true;
    try {
        let response;
        if (bankDialog.isEdit) {
            response = await apiClient.put(`/admin/bank-accounts/${bankDialog.id}`, bankForm);
        } else {
            response = await apiClient.post('/admin/bank-accounts', bankForm);
        }

        if (response.success) {
            snackbar.value = { show: true, text: 'Data bank berhasil disimpan!', color: 'success' };
            bankDialog.show = false;
            fetchBanks();
        }
    } catch (err) {
        snackbar.value = { show: true, text: err.response?.data?.message || 'Gagal menyimpan data.', color: 'error' };
    } finally {
        bankDialog.loading = false;
    }
};

const confirmDeleteBank = (bank) => {
    deleteDialog.id = bank.id;
    deleteDialog.show = true;
};

const deleteBank = async () => {
    deleteDialog.loading = true;
    try {
        const response = await apiClient.delete(`/admin/bank-accounts/${deleteDialog.id}`);
        if (response.success) {
            snackbar.value = { show: true, text: 'Rekening bank berhasil dihapus!', color: 'success' };
            deleteDialog.show = false;
            fetchBanks();
        }
    } catch (err) {
        snackbar.value = { show: true, text: 'Gagal menghapus data.', color: 'error' };
    } finally {
        deleteDialog.loading = false;
    }
};
// ----------------------------------

const fetchContent = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/content/homepage');
    if (response.success) {
      content.value = response.data;
    }
  } catch (err) {
    console.error(err);
    snackbar.value = { show: true, text: err.response?.data?.message || 'Gagal memuat konten.', color: 'error' };
  } finally {
    loading.value = false;
  }
};

const onFileChange = (event) => {
    heroImageFile.value = event.target.files[0];
};

const saveContent = async () => {
    loading.value = true;
    
    // Kita gunakan FormData karena ada upload file
    const formData = new FormData();
    for (const key in content.value) {
        if (content.value[key] !== null) {
            formData.append(key, content.value[key]);
        }
    }
    if (heroImageFile.value) {
        formData.append('hero_image', heroImageFile.value);
    }

    try {
        const response = await apiClient.post('/content/homepage/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.success) {
            snackbar.value = { show: true, text: response.message || 'Konten berhasil diperbarui!', color: 'success' };
            await fetchContent(); // Muat ulang konten
        }
    } catch (err) {
        console.error(err);
        snackbar.value = { show: true, text: err.response?.data?.message || 'Gagal memperbarui konten.', color: 'error' };
    } finally {
        loading.value = false;
    }
};
</script>