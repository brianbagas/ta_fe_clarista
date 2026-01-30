<template>
  <v-container>
    <h1 class="text-h4 mb-4">Manajemen Halaman Publik</h1>

    <v-card>
      <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="hero">Hero Section</v-tab>
        <v-tab value="kontak">Info Kontak & Lokasi</v-tab>
        <v-tab value="galeri">Galeri Fasilitas</v-tab>
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
                    label="Link Google Maps"
                    v-model="content.link_gmaps"
                    class="mt-4"
                ></v-text-field>
                <v-btn type="submit" color="primary" :loading="loading">Simpan Info Kontak</v-btn>
             </v-form>
          </v-window-item>


        </v-window>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
        {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../axios';
import { state } from '../stores/auth';
import { fetchUser } from '../stores/auth';
onMounted(() => {
  fetchUser();
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

onMounted(fetchContent);

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