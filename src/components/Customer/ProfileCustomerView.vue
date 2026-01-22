<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <h2 class="text-h4 mb-4">Pengaturan Akun</h2>
        
        <v-card>
          <v-tabs v-model="activeTab" bg-color="primary">
            <v-tab value="profile">Edit Profil</v-tab>
            <v-tab value="security">Keamanan</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              
              <v-window-item value="profile">
                <v-form @submit.prevent="handleUpdate">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        label="Nama Lengkap"
                        v-model="profileData.name"
                        variant="outlined"
                        prepend-inner-icon="mdi-account"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        label="Jenis Kelamin"
                        v-model="profileData.gender"
                        :items="['Laki-laki', 'Perempuan']"
                        variant="outlined"
                        prepend-inner-icon="mdi-gender-male-female"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        label="Email"
                        v-model="profileData.email"
                        type="email"
                        variant="outlined"
                        prepend-inner-icon="mdi-email"
                        hint="Mengubah email mungkin memerlukan verifikasi ulang"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        label="Nomor HP / WhatsApp"
                        v-model="profileData.no_hp"
                        type="tel"
                        variant="outlined"
                        prepend-inner-icon="mdi-phone"
                        hint="Penting untuk konfirmasi reservasi"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <div class="d-flex justify-end mt-4">
                    <v-btn type="submit" color="primary" :loading="loading" size="large">
                      Simpan Perubahan
                    </v-btn>
                  </div>
                </v-form>
              </v-window-item>

              <v-window-item value="security">
                <v-form @submit.prevent="handleChangePassword">
                  <v-text-field
                    label="Password Saat Ini"
                    type="password"
                    variant="outlined"
                    class="mb-2"
                  ></v-text-field>
                  
                  <v-text-field
                    label="Password Baru"
                    type="password"
                    variant="outlined"
                    class="mb-2"
                  ></v-text-field>

                  <v-text-field
                    label="Konfirmasi Password Baru"
                    type="password"
                    variant="outlined"
                  ></v-text-field>

                  <div class="d-flex justify-end mt-4">
                    <v-btn color="error" variant="outlined">Ganti Password</v-btn>
                  </div>
                </v-form>
              </v-window-item>

            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../axios'; // Sesuaikan path
import * as auth from '../../stores/auth.js'; 

const activeTab = ref('profile');
const loading = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });

// Sesuaikan dengan nama kolom di database kamu
const profileData = ref({
  name: '',
  email: '',
  no_hp: '', // Sesuai kolom DB 'no_hp'
  gender: '', // Sesuai kolom DB 'gender'
});

onMounted(() => {
  // Pastikan auth.state.user memiliki data terbaru dari DB
  if (auth.state.user) {
    profileData.value.name = auth.state.user.name;
    profileData.value.email = auth.state.user.email;
    profileData.value.no_hp = auth.state.user.no_hp || ''; // Handle null
    profileData.value.gender = auth.state.user.gender || ''; // Handle null
  }
});

const handleUpdate = async () => {
  loading.value = true;
  try {
    // Pastikan Controller Laravel menangani field no_hp dan gender
    const response = await apiClient.put('/profil', profileData.value);
    
    // Refresh state user
    await auth.fetchUser(); 

    snackbar.value = { show: true, text: 'Profil berhasil diperbarui!', color: 'success' };
  } catch (error) {
    console.error('Update profil gagal:', error);
    snackbar.value = { show: true, text: 'Gagal memperbarui profil.', color: 'error' };
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = () => {
    // Implementasi logika ganti password nanti
    snackbar.value = { show: true, text: 'Fitur ganti password belum tersedia', color: 'info' };
}
</script>