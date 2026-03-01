<template>
  <v-container class="py-10">
    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg mb-6">
          <v-card-title class="text-h5 font-weight-bold pa-5 bg-white text-black text-left">
            Reservasi
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <v-alert v-if="!auth.isAuthenticated" color="grey-lighten-1" variant="tonal" class="mb-6 text-black">
              <div class="d-flex align-center justify-space-between">
                <span>Silakan login terlebih dahulu untuk melakukan pemesanan.</span>
                <v-btn color="warning" size="small" to="/login">Login</v-btn>
              </div>
            </v-alert>

            <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4" @click:close="errorMessage = ''">
              {{ errorMessage }}
            </v-alert>

            <v-form ref="formRef">
              <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                <v-icon start color="grey-darken-2">mdi-calendar-range</v-icon>
                Pilih Tanggal
              </h3>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.checkIn"
                    label="Tanggal Check In"
                    type="date"
                    variant="outlined"
                    :min="today"
                    required
                    @change="handleDateChange"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.checkOut"
                    label="Tanggal Check Out"
                    type="date"
                    variant="outlined"
                    :min="form.checkIn || today"
                    required
                    @change="handleDateChange"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <h3 class="text-h6 font-weight-bold mb-2 d-flex align-center">
                <v-icon start color="grey-darken-2">mdi-bed</v-icon>
                Pilih Tipe Kamar
              </h3>
              
              <v-alert v-if="!isDateSelected" type="grey-lighten-1" variant="tonal" class="mb-4 text-black ">
                Silakan pilih tanggal Check-in dan Check-out terlebih dahulu untuk melihat ketersediaan kamar.
              </v-alert>

              <div v-if="isFetchingRooms" class="text-center py-10">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-2 text-grey">Mengecek ketersediaan...</p>
              </div>

              <v-row v-else>
                <v-col v-for="kamar in filteredRooms" :key="kamar.id_kamar" cols="12">
                  <v-card variant="outlined" class="rounded-lg overflow-hidden border-opacity-50">
                    <v-row no-gutters>
                      <v-col cols="12" sm="4">
                        <v-img 
                          v-if="kamar.thumbnail && kamar.thumbnail !== 'null'" 
                          :src="kamar.thumbnail" 
                          height="100%" 
                          cover 
                          class="bg-grey-lighten-2"
                        >
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0 text-center justify-center">
                              <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                            </v-row>
                          </template>
                          <template v-slot:error>
                            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3 w-100 flex-column">
                              <v-icon size="40" color="grey-lighten-1">mdi-image-off</v-icon>
                            </div>
                          </template>
                        </v-img>
                        
                        <v-sheet
                          v-else
                          height="100%"
                          color="grey-lighten-3"
                          class="d-flex align-center justify-center flex-column"
                        >
                           <v-icon size="40" color="grey-lighten-1">mdi-image-off</v-icon>
                        </v-sheet>
                      </v-col>

                      <v-col cols="12" sm="5" class="pa-4">
                        <div class="text-h6 font-weight-bold mb-1">{{ kamar.tipe_kamar }}</div>
                        <div class="d-flex gap-2 mb-3">
                          <v-icon size="small" color="grey">mdi-wifi</v-icon>
                          <v-icon size="small" color="grey">mdi-snowflake</v-icon>
                          <v-icon size="small" color="grey">mdi-television</v-icon>
                        </div>
                        <div class="text-primary font-weight-bold">
                          Rp {{ formatPrice(kamar.harga) }} <span class="text-caption text-grey-darken-2">/ malam</span>
                        </div>
                        
                        <div class="text-caption mt-1" :class="kamar.sisa_kamar < 3 ? 'text-grey-lighten-1 font-weight-bold' : 'text-green'">
                          <span v-if="kamar.sisa_kamar > 0">Tersedia {{ kamar.sisa_kamar }} unit</span>
                          <span v-else class="text-red">Habis Terjual!</span>
                        </div>
                      </v-col>

                      <v-col cols="12" sm="3" class="pa-4 d-flex align-center justify-center bg-grey-lighten-5">
                        <div class="d-flex align-center">
                          <v-btn 
                            icon="mdi-minus" size="x-small" variant="flat" 
                            @click="updateQuantity(kamar.id_kamar, -1)"
                            :disabled="getQuantity(kamar.id_kamar) <= 0"
                          ></v-btn>
                          
                          <div class="mx-4 font-weight-bold text-h6">{{ getQuantity(kamar.id_kamar) }}</div>
                          
                          <v-btn 
                            icon="mdi-plus" size="x-small" variant="flat" color="primary"
                            @click="updateQuantity(kamar.id_kamar, 1)"
                            :disabled="getQuantity(kamar.id_kamar) >= kamar.sisa_kamar || kamar.sisa_kamar === 0"
                          ></v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <h3 class="text-subtitle-1 font-weight-bold mb-2">Voucher & Promo</h3>
              <v-row no-gutters>
                <v-col cols="12" sm="9">
                    <v-text-field
                        v-model="form.kodePromo"
                        label="Kode Promo (Opsional)"
                        placeholder="CONTOH: PROMONYAMAN"
                        variant="outlined"
                        prepend-inner-icon="mdi-ticket-percent"
                        :disabled="appliedPromo !== null" 
                        hide-details="auto"
                        @keyup.enter="applyPromo"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3" class="pl-sm-3 mt-3 mt-sm-0">
                    <v-btn 
                        v-if="!appliedPromo"
                        block 
                        height="56" 
                        color="grey-lighten-5" 
                        @click="applyPromo"
                        :loading="isCheckingPromo"
                        :disabled="!form.kodePromo || selectedKamarsData.length === 0"
                    >
                        Terapkan
                    </v-btn>
                    <v-btn 
                        v-else
                        block 
                        height="56" 
                        color="error" 
                        variant="outlined"
                        @click="removePromo"
                    >
                        Hapus
                    </v-btn>
                </v-col>
              </v-row>
              
              <div v-if="promoMessage" class="mt-2 text-caption" :class="promoError ? 'text-red' : 'text-green font-weight-bold'">
                 {{ promoMessage }}
              </div>

            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="rounded-lg sticky-summary bg-grey-darken-3" elevation="4">
          <v-card-title class="pa-4 font-weight-bold text-left">Ringkasan Pesanan</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between mb-4">
              <span class="text-white">Durasi Menginap:</span>
              <span class="font-weight-bold">{{ diffNights }} Malam</span>
            </div>

            <v-divider class="mb-4 border-dashed"></v-divider>

            <div v-if="selectedKamarsData.length === 0" class="text-center py-4 text-grey text-body-2 italic">
              {{ isDateSelected ? 'Belum ada kamar terpilih' : 'Pilih tanggal dahulu' }}
            </div>
            <div v-for="item in selectedKamarsData" :key="item.id" class="mb-3">
              <div class="d-flex justify-space-between text-body-2">
                <span>{{ item.tipe_kamar }} (x{{ item.jumlah }})</span>
                <span>Rp {{ formatPrice(item.subtotal) }}</span>
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2 text-grey-darken-1">Subtotal:</span>
                <span class="text-body-1 font-weight-medium">Rp {{ formatPrice(subTotalRaw) }}</span>
            </div>

            <div v-if="appliedPromo" class="d-flex justify-space-between align-center mb-2 text-green">
                <span class="text-body-2 font-weight-bold">
                    <v-icon start size="small">mdi-ticket-confirmation</v-icon>
                    Diskon ({{ appliedPromo.kode_promo }})
                </span>
                <span class="text-body-1 font-weight-bold">- Rp {{ formatPrice(appliedPromo.nilai_potongan) }}</span>
            </div>

            <v-divider class="my-3 border-dashed"></v-divider>

            <div class="d-flex justify-space-between align-center mb-6">
              <span class="text-h6 font-weight-bold">Total Bayar:</span>
              <span class="text-h5 font-weight-bold text-white">Rp {{ formatPrice(grandTotal) }}</span>
            </div>

            <v-btn
              block color="primary" size="x-large"
              class="text-capitalize font-weight-bold"
              :loading="isLoading"
              :disabled="!isFormValid"
              @click="submitReservation"
            >
              Konfirmasi Reservasi
            </v-btn>
            <p class="text-center text-caption text-grey mt-3">
              Dengan mengklik tombol, Anda menyetujui S&K Clarista Homestay.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRoute and useRouter
import axios from '../../axios'; // Pastikan path ini sesuai
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();

const route = useRoute(); // Initialize route
const router = useRouter(); // Initialize router

const isLoading = ref(false);
const isFetchingRooms = ref(false);
const errorMessage = ref('');
const listMasterKamar = ref([]);
const cart = ref({}); 

// State Khusus Promo
const isCheckingPromo = ref(false);
const appliedPromo = ref(null); // Menyimpan objek promo dari backend
const promoMessage = ref('');
const promoError = ref(false);

const form = reactive({ checkIn: '', checkOut: '', kodePromo: '' });
const today = new Date().toISOString().split('T')[0];

onMounted(() => {
    if (route.query.checkIn && route.query.checkOut) {
        form.checkIn = route.query.checkIn;
        form.checkOut = route.query.checkOut;
        fetchAvailability();
    }
});

// --- LOGIC PERHITUNGAN ---

const isDateSelected = computed(() => !!(form.checkIn && form.checkOut));

const filteredRooms = computed(() => {
  return listMasterKamar.value.filter(kamar => kamar.sisa_kamar > 0);
});

const diffNights = computed(() => {
  if (!form.checkIn || !form.checkOut) return 0;
  const start = new Date(form.checkIn);
  const end = new Date(form.checkOut);
  if (end <= start) return 0;
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const selectedKamarsData = computed(() => {
  return listMasterKamar.value
    .filter(k => k.id_kamar && cart.value[k.id_kamar] && cart.value[k.id_kamar] > 0)
    .map(k => ({
      id: k.id_kamar,
      tipe_kamar: k.tipe_kamar,
      jumlah: cart.value[k.id_kamar],
      subtotal: parseFloat(k.harga) * cart.value[k.id_kamar] * diffNights.value
    }));
});

// Hitung Subtotal Murni (Tanpa Diskon)
const subTotalRaw = computed(() => {
    return selectedKamarsData.value.reduce((acc, item) => acc + item.subtotal, 0);
});

// Hitung Grand Total (Dikurangi Promo jika ada)
const grandTotal = computed(() => {
  const discount = appliedPromo.value ? parseFloat(appliedPromo.value.nilai_potongan) : 0;
  // Pastikan tidak minus
  return Math.max(0, subTotalRaw.value - discount);
});

const isFormValid = computed(() => {
  return (
    auth.isAuthenticated &&
    diffNights.value > 0 &&
    selectedKamarsData.value.length > 0
  );
});

// --- WATCHER UNTUK RESET PROMO ---
// Jika user mengubah kamar/tanggal setelah pasang promo, kita reset
// karena syarat minimal transaksi mungkin berubah.
watch([cart, () => form.checkIn, () => form.checkOut], () => {
    if (appliedPromo.value) {
        removePromo();
        promoMessage.value = 'Pesanan berubah, silakan terapkan ulang kode promo.';
        promoError.value = true;
    }
}, { deep: true });

// --- API FUNCTIONS ---

const fetchAvailability = async () => {
  if (!form.checkIn || !form.checkOut || diffNights.value <= 0) {
    listMasterKamar.value = [];
    return;
  }
  isFetchingRooms.value = true;
  errorMessage.value = '';
  
  // Reset cart jika tanggal berubah (supaya data bersih)
  cart.value = {}; 
  removePromo(); // Reset promo juga

  try {
    const response = await axios.get('/cek-ketersediaan', {
      params: { check_in: form.checkIn, check_out: form.checkOut }
    });
    if (response.success) {
      listMasterKamar.value = response.data;
    } else {
      errorMessage.value = response.message || "Gagal memuat data.";
      listMasterKamar.value = [];
    }
  } catch (error) {
    console.error("Error:", error);
    errorMessage.value = error.response?.data?.message || "Gagal memuat data.";
    listMasterKamar.value = [];
  } finally {
    isFetchingRooms.value = false;
  }
};

const handleDateChange = () => {
    // Watcher di atas akan handle reset cart & promo, tapi fetch harus dipanggil
    if(form.checkIn && form.checkOut) fetchAvailability();
};

// --- LOGIC PROMO BARU ---

const applyPromo = async () => {
    if (!form.kodePromo) return;
    if (selectedKamarsData.value.length === 0) {
        alert("Pilih kamar terlebih dahulu!");
        return;
    }

    isCheckingPromo.value = true;
    promoMessage.value = '';
    promoError.value = false;

    try {
        const payload = {
            kode_promo: form.kodePromo,
            total_transaksi: subTotalRaw.value // Kirim total saat ini ke BE
        };

        const response = await axios.post('/promo/check', payload);
        
        if (response.success) {
            // Simpan data promo dari backend
            appliedPromo.value = response.data;
            promoMessage.value = `Promo berhasil digunakan! Hemat Rp ${formatPrice(appliedPromo.value.nilai_potongan)}`;
            promoError.value = false;
        } else {
            appliedPromo.value = null;
            promoError.value = true;
            promoMessage.value = response.message || "Kode promo tidak valid / syarat tidak terpenuhi.";
        }
    } catch (error) {
        appliedPromo.value = null;
        promoError.value = true;
        promoMessage.value = error.response?.data?.message || "Kode promo tidak valid / syarat tidak terpenuhi.";
    } finally {
        isCheckingPromo.value = false;
    }
};

const removePromo = () => {
    appliedPromo.value = null;
    form.kodePromo = '';
    promoMessage.value = '';
    promoError.value = false;
};

// --- HELPER FUNCTIONS ---

const updateQuantity = (id, amount) => {
  if (!id) return;

  const current = cart.value[id] || 0;
  const newValue = current + amount;
  
  const kamar = listMasterKamar.value.find(k => k.id_kamar === id); // Pastikan key ID sesuai API (id_kamar atau id)
  
  if (amount > 0 && kamar && newValue > kamar.sisa_kamar) {
    alert("Stok maksimal tercapai!");
    return;
  }

  if (newValue > 0) {
    cart.value = { ...cart.value, [id]: newValue };
  } else {
    const newCart = { ...cart.value };
    delete newCart[id];
    cart.value = newCart;
  }
};

const getQuantity = (id) => {
    if(!id) return 0;
    return cart.value[id] || 0;
};

const formatPrice = (v) => new Intl.NumberFormat('id-ID').format(v);

const submitReservation = async () => {
  if(!confirm("Pastikan pesanan sudah benar. Lanjutkan?")) return;
  isLoading.value = true;
  try {
    const payload = {
      tanggal_check_in: form.checkIn,
      tanggal_check_out: form.checkOut,
      kamars: Object.keys(cart.value).map(id => ({ 
          kamar_id: id, 
          jumlah_kamar: cart.value[id] 
      })),
      // Kirim kode promo jika ada yang diaplikasikan
      kode_promo: appliedPromo.value ? appliedPromo.value.kode_promo : null 
    };
    
    const response = await axios.post('/pemesanan', payload);
    if (response.success) {
      // Redirect to Upload Payment Proof page
      cart.value = {};
      removePromo();
      router.push({ name: 'BayarPesanan', params: { id: response.data.id } });
    }
  } catch (error) {
    // Handle specific error promo habis saat last second
    if (error.response?.status === 409) {
        alert(error.response.data.message);
        removePromo(); // Paksa user cek ulang promo
    } else if (error.response?.status === 422) {
        // Show validation errors details
        const errors = error.response.data.errors;
        let msg = "Validasi Gagal:\n";
        for (const key in errors) {
            msg += `- ${errors[key][0]}\n`;
        }
        alert(msg);
        errorMessage.value = msg;
    } else {
        errorMessage.value = error.response?.data?.message || "Gagal memproses pesanan.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.sticky-summary {
  position: -webkit-sticky;
  position: sticky;
  top: 100px;
  z-index: 99;
}
.border-dashed {
  border-style: dashed !important;
}
.gap-2 {
    gap: 8px;
}
</style>