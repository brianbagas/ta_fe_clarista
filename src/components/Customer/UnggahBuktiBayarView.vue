<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="7">
        <v-card variant="outlined" class="rounded-lg border-opacity-50">
          <div class="pa-4 bg-grey-lighten-5 border-b">
            <div class="text-h6 font-weight-bold text-blue-grey-darken-3">Metode Pembayaran</div>
            <div class="text-body-2 text-grey-darken-1">Pilih metode transfer untuk menyelesaikan pesanan</div>
          </div>
          
          <!-- SELECTION CARD / BUTTON -->
          <div class="px-4 py-4">
            <v-card
                variant="outlined"
                class="pa-4 d-flex align-center justify-space-between cursor-pointer transition-swing"
                :class="form.bank_tujuan ? 'border-primary bg-blue-lighten-5' : 'border-opacity-50'"
                @click="paymentDialog = true"
                ripple
            >
                <div class="d-flex align-center">
                    <v-avatar color="white" class="mr-4 border" rounded="lg">
                        <v-icon color="primary">{{ getSelectedBankLogo }}</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-caption text-grey-darken-1 font-weight-bold mb-1 letter-spacing-1">
                            METODE PEMBAYARAN
                        </div>
                        <div class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3">
                            {{ form.bank_tujuan ? form.bank_tujuan : 'Pilih Bank / E-Wallet' }}
                        </div>
                    </div>
                </div>
                <v-icon color="primary">mdi-chevron-right</v-icon>
            </v-card>
          </div>

          <!-- SELECTED BANK DETAILS -->
          <v-expand-transition>
            <div v-if="selectedBankDetail" class="px-4 mb-4">
                <v-sheet class="bg-blue-grey-lighten-5 rounded-lg pa-4 border border-opacity-25">
                    <div class="d-flex align-start">
                        <div class="flex-grow-1">
                            <div class="text-caption text-grey-darken-2 font-weight-bold mb-1 letter-spacing-1">
                                NOMOR REKENING
                            </div>
                            <div class="text-h5 font-weight-bold text-blue-grey-darken-4 tracking-wide text-truncate font-monospace">
                                {{ selectedBankDetail.nomor_rekening }}
                            </div>
                            <div class="text-body-2 text-grey-darken-2 mt-1 font-weight-medium">
                                a.n {{ selectedBankDetail.atas_nama }}
                            </div>
                        </div>
                        <v-btn
                            icon="mdi-content-copy"
                            variant="text"
                            color="primary"
                            @click="copyToClipboard(selectedBankDetail.nomor_rekening)"
                            density="comfortable"
                        ></v-btn>
                    </div>
                    
                    <v-divider class="my-3"></v-divider>
                    
                    <div class="d-flex align-center text-caption text-grey-darken-1">
                        <v-icon start size="small" icon="mdi-information-outline" class="mr-2"></v-icon>
                        Pastikan nominal transfer sesuai total tagihan.
                    </div>
                </v-sheet>
            </div>
          </v-expand-transition>

          <v-divider></v-divider>

          <!-- PAYMENT METHOD DIALOG -->
          <v-dialog v-model="paymentDialog" max-width="500" scrollable>
            <v-card class="rounded-xl">
                <v-card-title class="d-flex justify-space-between align-center px-4 py-3 bg-grey-lighten-5 border-b">
                    <div class="text-subtitle-1 font-weight-bold">Pilih Metode Pembayaran</div>
                    <v-btn icon="mdi-close" variant="text" size="small" @click="paymentDialog = false"></v-btn>
                </v-card-title>
                
                <v-card-text class="pa-0" style="max-height: 400px;">
                    <v-list lines="two" class="pa-2">
                        <template v-for="(bank, index) in bankAccounts" :key="bank.id">
                            <v-list-item
                                @click="selectBank(bank)"
                                class="rounded-lg mb-2 pa-3"
                                :class="{ 'bg-blue-lighten-5': form.bank_tujuan === bank.nama_bank }"
                                rounded
                                density="comfortable"
                            >
                                <template v-slot:prepend>
                                    <v-avatar color="grey-lighten-4" class="rounded-lg mr-3" size="48">
                                        <v-icon size="24" color="grey-darken-2">{{ bank.logo_path || 'mdi-bank' }}</v-icon>
                                    </v-avatar>
                                </template>
                                
                                <v-list-item-title class="font-weight-bold text-body-2">
                                    {{ bank.nama_bank }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="mt-1 d-flex align-center text-caption">
                                    <span class="text-grey-darken-3 font-weight-medium">{{ bank.nomor_rekening }}</span>
                                    <span class="mx-1 text-grey">•</span>
                                    <span class="text-grey">{{ bank.atas_nama }}</span>
                                </v-list-item-subtitle>
                                
                                <template v-slot:append>
                                    <v-icon 
                                        v-if="form.bank_tujuan === bank.nama_bank"
                                        color="primary"
                                        icon="mdi-check-circle"
                                    ></v-icon>
                                </template>
                            </v-list-item>
                        </template>
                        
                        <div v-if="bankAccounts.length === 0" class="text-center pa-4 text-grey text-caption">
                            Belum ada metode pembayaran tersedia.
                        </div>
                    </v-list>
                </v-card-text>
            </v-card>
          </v-dialog>
          
          <v-card-text class="pt-4">
            <v-form ref="formRef" v-model="valid">
                <div class="text-subtitle-2 font-weight-bold mb-3">Konfirmasi Pembayaran</div>

                <v-row>
                    <v-col cols="12">
                        <v-text-field
                          v-model="form.nama_pengirim"
                          label="Nama Pengirim"
                          placeholder="Nama pemilik rekening"
                          variant="outlined"
                          :rules="[rules.required]"
                          class="mb-3"
                        ></v-text-field>
                    </v-col>
                </v-row>



                <v-file-input
                  @change="onFileChange"
                  label="Bukti Bayar (Screenshot/Foto)"
                  variant="outlined"
                  accept="image/png, image/jpeg, image/jpg"
                  prepend-icon="mdi-camera"
                  :rules="[rules.requiredFile]"
                  show-size
                  hint="Pastikan tulisan terbaca jelas"
                ></v-file-input>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card variant="outlined">
          <v-card-title class="text-h5">Ringkasan Pesanan</v-card-title>
          <div v-if="loading">
            <v-skeleton-loader type="list-item-two-line@3"></v-skeleton-loader>
          </div>
          <div v-else-if="pesanan">
             <v-card-text>
                Check-in: {{ new Date(pesanan.tanggal_check_in).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
                <br>
                Check-out: {{ new Date(pesanan.tanggal_check_out).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
             </v-card-text>
             <v-divider></v-divider>
             <v-list density="compact">
                <v-list-item v-for="detail in pesanan.detail_pemesanans" :key="detail.id">
                    <v-list-item-title class="text-body-2">{{ detail.jumlah_kamar }}x {{ detail.kamar.tipe_kamar }}</v-list-item-title>
                    <template v-slot:append>
                        <span class="text-body-2">Rp {{ new Intl.NumberFormat('id-ID').format(detail.harga_per_malam * detail.jumlah_kamar * durasiMalam) }}</span>
                    </template>
                </v-list-item>
             </v-list>
             
             <v-divider class="my-2 border-dashed"></v-divider>
             
             <div class="px-4 py-2">
                 <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="text-grey-darken-1">Subtotal ({{ durasiMalam }} Malam)</span>
                    <span>Rp {{ new Intl.NumberFormat('id-ID').format(subTotal) }}</span>
                 </div>
                 
                 <div v-if="nilaiDiskon > 0" class="d-flex justify-space-between text-body-2 text-green mb-1">
                    <span>
                        <v-icon icon="mdi-ticket-percent" start size="small"></v-icon>
                        Diskon ({{ pesanan.promo?.kode_promo }})
                    </span>
                    <span>- Rp {{ new Intl.NumberFormat('id-ID').format(nilaiDiskon) }}</span>
                 </div>
             </div>

             <v-divider></v-divider>
             <v-card-text class="d-flex justify-space-between text-h6 bg-grey-lighten-4">
                <strong>Total Bayar</strong>
                <strong class="text-primary">Rp {{ new Intl.NumberFormat('id-ID').format(pesanan.total_bayar) }}</strong>
             </v-card-text>
          </div>
          <v-card-actions class="pa-4">
            <v-btn
              color="primary"
              :loading="uploadLoading"
              :disabled="!valid || !buktiBayarFile"
              block
              size="large"
              @click="handleUpload"
            >
              Konfirmasi Pembayaran
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../axios';

const route = useRoute();
const router = useRouter();

const pesanan = ref(null);
const bankAccounts = ref([]);
const buktiBayarFile = ref(null);
const loading = ref(true);
const uploadLoading = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });
const pesananId = route.params.id;
const valid = ref(false);
const formRef = ref(null);

const form = reactive({
    jumlah_bayar: '',
    bank_tujuan: '', 
    nama_pengirim: '',
});

const rules = {
  required: value => !!value || 'Field ini wajib diisi.',
  requiredFile: value => !!value || 'File bukti bayar wajib diunggah.',
  numeric: value => !isNaN(parseFloat(value)) && isFinite(value) || 'Harus berupa angka.',
};

// --- Computed Properties untuk Kalkulasi Harga ---
const durasiMalam = computed(() => {
    if (!pesanan.value) return 0;
    const checkIn = new Date(pesanan.value.tanggal_check_in);
    const checkOut = new Date(pesanan.value.tanggal_check_out);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimal 1 malam
});

const subTotal = computed(() => {
    if (!pesanan.value || !pesanan.value.detail_pemesanans) return 0;
    return pesanan.value.detail_pemesanans.reduce((total, detail) => {
        return total + (detail.harga_per_malam * detail.jumlah_kamar * durasiMalam.value);
    }, 0);
});

const nilaiDiskon = computed(() => {
    if (!pesanan.value) return 0;
    // Diskon adalah selisih Subtotal - Total Bayar
    // (Asumsi: total_bayar di DB sudah net setelah diskon)
    return Math.max(0, subTotal.value - parseFloat(pesanan.value.total_bayar));
});

const selectedBankDetail = computed(() => {
    return bankAccounts.value.find(b => b.nama_bank === form.bank_tujuan);
});

const getSelectedBankLogo = computed(() => {
    return selectedBankDetail.value?.logo_path || 'mdi-bank';
});

const paymentDialog = ref(false);

const selectBank = (bank) => {
    form.bank_tujuan = bank.nama_bank;
    paymentDialog.value = false;
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    snackbar.value = { show: true, text: 'Nomor rekening disalin!', color: 'info' };
};

onMounted(async () => {
  try {
    // Parallel Fetching
    const [pesananRes, banksRes] = await Promise.all([
        apiClient.get(`/pemesanan/${pesananId}`),
        apiClient.get('/bank-accounts')
    ]);

    if (pesananRes.success) {
      pesanan.value = pesananRes.data;
      form.jumlah_bayar = pesanan.value.total_bayar;
    } else {
        throw new Error(pesananRes.message);
    }

    if (banksRes.success && banksRes.data.length > 0) {
        bankAccounts.value = banksRes.data;
        // Default select the first bank if available
        form.bank_tujuan = bankAccounts.value[0].nama_bank; 
    }
    
  } catch (err) {
    console.error('Gagal memuat data:', err);
    snackbar.value = { show: true, text: 'Gagal memuat data pesanan/bank', color: 'error' };
  } finally {
    loading.value = false;
  }
});

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    buktiBayarFile.value = file;
  }
};

const handleUpload = async () => {
    // Validasi Manual Tambahan
    if (!buktiBayarFile.value) {
        snackbar.value = { show: true, text: 'Silakan pilih file bukti bayar.', color: 'warning' };
        return;
    }

    // Validasi form vuetify
    const { valid: isValid } = await formRef.value.validate();
    if (!isValid) return;

    uploadLoading.value = true;
    const formData = new FormData();
    
    // Append File
    formData.append('bukti_bayar', buktiBayarFile.value);
    
    // Append Data Form
    formData.append('jumlah_bayar', form.jumlah_bayar);
    formData.append('bank_tujuan', form.bank_tujuan);
    formData.append('nama_pengirim', form.nama_pengirim);

  try {
    const response = await apiClient.post(`/pemesanan/${pesananId}/pembayaran`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    
    if (response.success) {
      snackbar.value = { show: true, text: response.message || 'Pembayaran berhasil dikirim!', color: 'success' };
      
      setTimeout(() => {
        router.push('/pesanan-saya');
      }, 2000);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Gagal mengunggah bukti bayar.';
    console.error('Upload gagal:', error);
    snackbar.value = { show: true, text: errorMessage, color: 'error' };
  } finally {
    uploadLoading.value = false;
  }
};
</script>