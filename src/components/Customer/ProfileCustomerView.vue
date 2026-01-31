<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <h2 class="text-h4 mb-6 text-primary font-weight-bold">Pengaturan Akun</h2>
        
        <v-card class="rounded-lg elevation-2">
          <v-tabs v-model="activeTab" bg-color="primary">
            <v-tab value="profile" prepend-icon="mdi-account-edit">Edit Profil</v-tab>
            <v-tab value="security" prepend-icon="mdi-shield-lock">Keamanan</v-tab>
          </v-tabs>

          <v-card-text class="pa-6">
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
                        class="mb-2"
                        color="primary"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        label="Jenis Kelamin"
                        v-model="profileData.gender"
                        :items="['pria', 'wanita']" 
                        variant="outlined"
                        prepend-inner-icon="mdi-gender-male-female"
                         class="mb-2"
                         color="primary"
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
                        persistent-hint
                         class="mb-2"
                         color="primary"
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
                        persistent-hint
                        @input="profileData.no_hp = profileData.no_hp.replace(/[^0-9]/g, '')"
                         class="mb-2"
                         color="primary"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <div class="d-flex justify-end mt-6">
                    <v-btn type="submit" color="primary" :loading="loading" size="large" variant="elevated">
                      Simpan Perubahan
                    </v-btn>
                  </div>
                </v-form>
              </v-window-item>

              <v-window-item value="security">
                <v-alert type="info" variant="tonal" class="mb-4" icon="mdi-information">
                    Gunakan password yang kuat (minimal 8 karakter).
                </v-alert>

                <v-form @submit.prevent="handleChangePassword" ref="passwordFormRef">
                  <v-text-field
                    label="Password Saat Ini"
                    v-model="passwordForm.current_password"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    prepend-inner-icon="mdi-lock-outline"
                    :rules="[v => !!v || 'Password saat ini wajib diisi']"
                  ></v-text-field>
                  
                  <v-text-field
                    label="Password Baru"
                    v-model="passwordForm.password"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    prepend-inner-icon="mdi-lock-plus"
                    :rules="[
                        v => !!v || 'Password baru wajib diisi',
                        v => v.length >= 8 || 'Minimal 8 karakter'
                    ]"
                  ></v-text-field>

                  <v-text-field
                    label="Konfirmasi Password Baru"
                    v-model="passwordForm.password_confirmation"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    prepend-inner-icon="mdi-lock-check"
                    :rules="[
                        v => !!v || 'Konfirmasi password wajib diisi',
                        v => v === passwordForm.password || 'Password tidak cocok'
                    ]"
                  ></v-text-field>

                  <div class="d-flex justify-end mt-4">
                     <v-btn 
                        type="submit" 
                        color="success" 
                        variant="elevated" 
                        size="large"
                        :loading="passwordLoading"
                    >
                        Update Password
                    </v-btn>
                  </div>
                </v-form>
              </v-window-item>

            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../axios'; 
import * as auth from '../../stores/auth.js'; 

const activeTab = ref('profile');
const loading = ref(false);
const passwordLoading = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });
const passwordFormRef = ref(null);

const profileData = ref({
  name: '',
  email: '',
  no_hp: '', 
  gender: '',
});

const passwordForm = ref({
    current_password: '',
    password: '',
    password_confirmation: ''
});

onMounted(async () => { // Make async to ensure await works if needed, though fetchUser is usually correct
  if (!auth.state.user) {
      await auth.fetchUser();
  }
  
  if (auth.state.user) {
    fillProfileData(auth.state.user);
  }
});

const fillProfileData = (user) => {
    profileData.value.name = user.name;
    profileData.value.email = user.email;
    profileData.value.no_hp = user.no_hp || ''; 
    profileData.value.gender = user.gender || 'pria'; // Default fallback
}

const handleUpdate = async () => {
  loading.value = true;
  try {
    const response = await apiClient.put('/profil', profileData.value);
    
    if (response.success) {
      await auth.fetchUser(); 
      // Update local state just to be sure
      if(auth.state.user) fillProfileData(auth.state.user);
      
      snackbar.value = { show: true, text: response.message || 'Profil berhasil diperbarui!', color: 'success' };
    }
  } catch (error) {
    console.error('Update profil gagal:', error);
    snackbar.value = { show: true, text: error.response?.data?.message || 'Gagal memperbarui profil.', color: 'error' };
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
    const { valid } = await passwordFormRef.value.validate();
    if (!valid) return;

    passwordLoading.value = true;
    try {
        const response = await apiClient.put('/password', passwordForm.value);
        if (response.success) {
            snackbar.value = { show: true, text: 'Password berhasil diubah!', color: 'success' };
            // Reset form
            passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
            passwordFormRef.value.resetValidation();
        }
    } catch (error) {
        console.error('Ganti password gagal:', error);
        snackbar.value = { 
            show: true, 
            text: error.response?.data?.message || 'Gagal mengganti password. Periksa password lama Anda.', 
            color: 'error' 
        };
    } finally {
        passwordLoading.value = false;
    }
}
</script>