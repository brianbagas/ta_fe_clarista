// src/auth.js
import { reactive, computed } from 'vue';
import apiClient from '../axios';
import router from '../router';
import { defineStore } from 'pinia';

// State dibuat reaktif agar komponen bisa "melihat" perubahannya
export const state = reactive({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
});

// Computed property untuk memeriksa status login
export const isAuthenticated = computed(() => !!state.token);

// Computed property untuk normalisasi Role (String)
// Ini solusi agar konsisten: baik data dari Login (ada string) atau fetchUser (cuma ID) tetap terbaca string
export const userRole = computed(() => {
  const user = state.user;
  if (!user) return null;

  // Prioritas 1: Jika sudah ada string 'role' (misal dari response login awal)
  if (user.role && typeof user.role === 'string') {
    return user.role;
  }

  // Prioritas 2: Mapping manual dari role_id
  if (user.role_id == 1) return 'owner';
  if (user.role_id == 2) return 'customer'; // Asumsi 2 adalah customer

  return 'guest';
});
function setAuthHeader(token) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}
// Fungsi untuk login
export async function login(credentials) {
  try {
    const response = await apiClient.post('/login', credentials);

    // After interceptor, response is already { success, message, data }
    if (response.success) {
      const newToken = response.data.access_token;
      const role = response.data.role;

      // Simpan token ke local storage dan state
      localStorage.setItem('token', newToken);
      state.token = newToken;

      await fetchUser(); // Ambil data user
      console.log('Login successful:', role);

      if (role === 'owner') {
        router.push('/owner'); // Redirect ke dashboard owner
      } else {
        router.push('/'); // Redirect ke halaman utama
      }
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error; // Lempar error agar komponen bisa menanganinya
  }
}

// Fungsi untuk register
export async function register(details) {
  // Mirip dengan fungsi login, panggil API register
  // dan simpan token jika berhasil
  try {
    const response = await apiClient.post('/register', details);

    // After interceptor, response is already { success, message, data }
    if (response.success) {
      // Skenario 1: Backend langsung mengembalikan token setelah register (Auto Login)
      if (response.data.access_token) {
        const newToken = response.data.access_token;

        localStorage.setItem('token', newToken);
        state.token = newToken;
        setAuthHeader(newToken);

        await fetchUser(); // Ambil data user

        // Redirect sesuai role
        const role = state.user?.role;
        if (role === 'owner') {
          router.push('/owner');
        } else {
          router.push('/');
        }
      }
      // Skenario 2: Backend hanya mengembalikan pesan sukses (harus login manual)
      else {
        // Arahkan ke halaman login
        router.push('/login');
      }

      return response.data; // Kembalikan data agar komponen Vue bisa menampilkan alert sukses
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Register failed:', error);
    throw error; // Lempar error ke komponen untuk ditampilkan (misal: email sudah ada)
  }
}

// Fungsi untuk mengambil data user
export async function fetchUser() {
  if (state.token) {
    try {
      const response = await apiClient.get('/user');

      // After interceptor, response is already { success, message, data }
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.data));
        state.user = response.data;
      } else {
        // Jika response tidak success, logout
        logout();
      }
    } catch (error) {
      // Jika token tidak valid, logout
      logout();
    }
  }
}

// Fungsi untuk logout
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.token = null;
  state.user = null;
  delete apiClient.defaults.headers.common['Authorization'];
  router.push('/login');
}