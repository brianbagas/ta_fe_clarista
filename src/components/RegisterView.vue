<template>
  <v-container class="register-wrapper" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        
        <v-card class="pa-4 rounded-lg" elevation="4">
          <v-card-title class="text-center text-h5 font-weight-bold text-primary mb-2">
            Buat Akun Baru
          </v-card-title>
          
          <v-card-subtitle class="text-center mb-6">
            Bergabunglah dengan Clarista Homestay
          </v-card-subtitle>

          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              
              <v-text-field
                v-model="name"
                label="Nama Lengkap"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                color="primary"
                placeholder="Masukkan nama lengkap"
                class="mb-2"
                required
              ></v-text-field>

              <v-text-field
                v-model="no_hp"
                label="Nomor HP"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                color="primary"
                type="tel"
                placeholder="Contoh: 08123456789"
                class="mb-2"
                required
                @input="no_hp = no_hp.replace(/[^0-9]/g, '')"
              ></v-text-field>

              <v-select
                v-model="gender"
                label="Jenis Kelamin"
                prepend-inner-icon="mdi-gender-male-female"
                :items="['pria', 'wanita']"
                variant="outlined"
                color="primary"
                class="mb-2"
                required
              ></v-select>

              <v-text-field
                v-model="email"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                color="primary"
                placeholder="email@contoh.com"
                class="mb-2"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="visible ? 'text' : 'password'"
                @click:append-inner="visible = !visible"
                variant="outlined"
                color="primary"
                placeholder="Minimal 8 karakter"
                class="mb-2"
                required
              ></v-text-field>

              <v-text-field
                v-model="password_confirmation"
                label="Konfirmasi Password"
                prepend-inner-icon="mdi-lock-check"
                type="password"
                variant="outlined"
                color="primary"
                placeholder="Ulangi password Anda"
                class="mb-4"
                required
                :error-messages="passwordMatchError"
              ></v-text-field>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                density="compact"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="isLoading"
                class="text-capitalize font-weight-bold"
              >
                Daftar Sekarang
              </v-btn>

            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center mt-2">
            <span class="text-body-2 text-grey-darken-1">
              Sudah punya akun? 
              <router-link to="/login" class="text-decoration-none text-primary font-weight-bold">
                Masuk disini
              </router-link>
            </span>
          </v-card-actions>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const name = ref('')
const email = ref('')
const no_hp = ref('')
const gender = ref(null)
const password = ref('')
const password_confirmation = ref('')
const error = ref(null)
const isLoading = ref(false)
const visible = ref(false) // Untuk fitur show/hide password

// Computed property untuk validasi realtime kesamaan password (UX improvement)
const passwordMatchError = computed(() => {
  if (password_confirmation.value && password.value !== password_confirmation.value) {
    return "Password tidak cocok"
  }
  return ""
})

const handleRegister = async () => {
  error.value = null
  
  // Validasi sederhana
  if (password.value !== password_confirmation.value) {
    error.value = "Password dan Konfirmasi Password tidak cocok."
    return
  }

  if (password.value.length < 8) {
      error.value = "Password minimal 8 karakter."
      return
  }
  
  if (!no_hp.value || !gender.value) {
      error.value = "Mohon lengkapi semua data."
      return
  }

  isLoading.value = true

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      no_hp: no_hp.value,
      gender: gender.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    })
    // Redirect biasanya ditangani di store, atau tambahkan router.push di sini
    
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
        error.value = e.response.data.message 
    } else {
        error.value = 'Gagal melakukan registrasi. Terjadi kesalahan jaringan.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-wrapper {
  /* Ini adalah kunci layout fix: */
  /* Mengatur tinggi minimal container agar mengisi layar yang kosong antara header & footer */
  min-height: calc(100vh - 150px); 
  display: flex;
  align-items: center;
  background-color: #f5f5f5; /* Background abu muda agar card menonjol */
}
</style>