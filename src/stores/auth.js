// src/stores/auth.js
import apiClient from '../axios';
import router from '../router';
import { defineStore } from 'pinia';

function setAuthHeader(token) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => {
      if (!state.user) return null;
      if (typeof state.user.role === 'string') return state.user.role;
      if (state.user.role_id == 1) return 'owner';
      if (state.user.role_id == 2) return 'customer';
      return 'guest';
    },
  },

  actions: {
    // Fungsi untuk login
    async login(credentials) {
      try {
        const response = await apiClient.post('/login', credentials);

        // After interceptor, response is already { success, message, data }
        if (response.success) {
          const newToken = response.data.access_token;
          const role = response.data.role;

          // Simpan token ke local storage dan state
          localStorage.setItem('token', newToken);
          this.token = newToken;
          setAuthHeader(newToken);

          await this.fetchUser(); // Ambil data user
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
    },

    // Fungsi untuk register
    async register(details) {
      try {
        const response = await apiClient.post('/register', details);

        // After interceptor, response is already { success, message, data }
        if (response.success) {
          // Skenario 1: Backend langsung mengembalikan token setelah register (Auto Login)
          if (response.data.access_token) {
            const newToken = response.data.access_token;

            localStorage.setItem('token', newToken);
            this.token = newToken;
            setAuthHeader(newToken);

            await this.fetchUser(); // Ambil data user

            // Redirect sesuai role
            const role = this.user?.role;
            if (role === 'owner') {
              router.push('/owner');
            } else {
              router.push('/');
            }
          }
          // Skenario 2: Backend hanya mengembalikan pesan sukses (harus login manual)
          else {
            router.push('/login');
          }

          return response.data;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Register failed:', error);
        throw error;
      }
    },

    // Fungsi untuk mengambil data user
    async fetchUser() {
      if (this.token) {
        try {
          const response = await apiClient.get('/user');

          // After interceptor, response is already { success, message, data }
          if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.data));
            this.user = response.data;
          } else {
            this.logout();
          }
        } catch (error) {
          this.logout();
        }
      }
    },

    // Fungsi untuk logout
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
      delete apiClient.defaults.headers.common['Authorization'];
      router.push('/login');
    },
  },
});