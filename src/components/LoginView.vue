<template>
  <div class="login-container">
    
    <v-card class="login-card" elevation="0">
      <div class="login-header">
        <h2>Selamat Datang Kembali</h2>
        <p>Silakan masuk ke akun Clarista Homestay Anda</p>
      </div>

      <v-form @submit.prevent="handleLogin">
        
        <div class="form-group">
          <label class="input-label">Email Address</label>
          <v-text-field
            v-model="email"
            placeholder="contoh@email.com"
            variant="outlined"
            density="comfortable"
            color="primary"
            bg-color="white"
            hide-details="auto"
            class="custom-field"
            rounded="lg"
          ></v-text-field>
        </div>

        <div class="form-group">
          <label class="input-label">Password</label>
          <v-text-field
            v-model="password"
            type="password"
            placeholder="Masukkan password Anda"
            variant="outlined"
            density="comfortable"
            color="primary"
            bg-color="white"
            hide-details="auto"
            class="custom-field"
            rounded="lg"
          ></v-text-field>
        </div>

        <v-btn 
          type="submit" 
          block 
          flat
          height="48"
          color="#1565C0"
          class="btn-login text-capitalize"
        >
          Login
        </v-btn>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </v-form>
      
      <div class="login-footer">
        <p>Belum punya akun? <a href="/register">Daftar disini</a></p>
      </div>
    </v-card>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { login } from '../stores/auth'; 

const email = ref('');
const password = ref('');
const error = ref(null);

const handleLogin = async () => {
  error.value = null;
  try {
    await login({ 
      email: email.value, 
      password: password.value 
    });
  } catch (e) {
    error.value = 'Email atau password yang Anda masukkan salah.';
  }
};
</script>

<style scoped>
/* 1. Layout Halaman */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px); 
  background-color: #f4f6f8;
  padding: 40px 20px;
}

/* 2. Desain Card */
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 40px !important; /* Force padding v-card */
  border-radius: 12px !important;
  background-color: #ffffff;
  /* Menggunakan shadow custom sesuai desain sebelumnya */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
  border: none;
}

/* 3. Tipografi Header */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-weight: 700;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

/* 4. Styling Label Input */
.form-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

/* Override style Vuetify agar border abu-abunya pas */
:deep(.v-field__outline__start),
:deep(.v-field__outline__end),
:deep(.v-field__outline__notch) {
  border-color: #ddd !important;
}

/* Saat fokus, warna border mengikuti props 'color="primary"' */
:deep(.v-field--focused .v-field__outline__start),
:deep(.v-field--focused .v-field__outline__end),
:deep(.v-field--focused .v-field__outline__notch) {
  border-color: #1976D2 !important; 
}

/* 5. Styling Tombol */
.btn-login {
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 10px;
  color: white !important;
  letter-spacing: 0.5px; /* Sedikit spacing agar lebih mudah dibaca */
}

/* 6. Pesan Error & Footer */
.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #ffcdd2;
}

.login-footer {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #1565C0;
  text-decoration: none;
  font-weight: 600;
}
</style>