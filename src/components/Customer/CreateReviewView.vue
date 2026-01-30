<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 mb-4">Tulis Ulasan</h1>

        <v-card v-if="pesanan" variant="outlined" class="mb-6">
          <v-list-item>
            <v-list-item-title class="font-weight-bold">
              Pesanan pada {{ new Date(pesanan.created_at).toLocaleDateString('id-ID') }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Total: Rp {{ new Intl.NumberFormat('id-ID').format(pesanan.total_bayar) }}
            </v-list-item-subtitle>
             <template v-slot:append>
                <v-chip color="success" label>SUKSES</v-chip>
            </template>
          </v-list-item>
        </v-card>

        <v-card>
          <v-card-text>
            <v-form @submit.prevent="submitReview">
              <div class="text-subtitle-1 font-weight-bold mb-2">Rating Anda</div>
              <v-rating
                v-model="rating"
                hover
                half-increments
                clearable
                color="yellow-darken-3"
                size="x-large"
              ></v-rating>

              <div class="text-subtitle-1 font-weight-bold mt-6 mb-2">Bagikan Pengalaman Anda</div>
              <v-textarea
                v-model="komentar"
                label="Ceritakan pengalaman menginap Anda di sini..."
                variant="outlined"
                rows="5"
                auto-grow
              ></v-textarea>

              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="rating === 0"
                block
                class="mt-4"
              >
                Simpan Review
              </v-btn>
            </v-form>
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
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../axios';

const route = useRoute();
const router = useRouter();

const pesanan = ref(null);
const rating = ref(0);
const komentar = ref('');
const loading = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });
const pesananId = route.params.id;

onMounted(async () => {
  try {
    const response = await apiClient.get(`/pemesanan/${pesananId}`);
    if (response.success) {
      pesanan.value = response.data;
    }
  } catch (err) {
    console.error('Gagal memuat data pesanan:', err);
  }
});

const submitReview = async () => {
  loading.value = true;
  try {
    const response = await apiClient.post('/review', {
      pemesanan_id: pesananId,
      rating: rating.value,
      komentar: komentar.value,
    });
    
    if (response.success) {
      snackbar.value = { show: true, text: response.message || 'Review berhasil dikirim', color: 'success' };
      
      setTimeout(() => {
        router.push('/pesanan-saya');
      }, 2000);
    }
  } catch (error) {
    console.error('Gagal mengirim review:', error.response?.data);
    snackbar.value = { show: true, text: error.response?.data?.message || 'Gagal mengirim review.', color: 'error' };
  } finally {
    loading.value = false;
  }
};
</script>