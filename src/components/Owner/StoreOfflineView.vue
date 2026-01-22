<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        
        <div class="mb-4">
            <h2 class="text-h4 font-weight-bold text-primary">Input Walk-in Guest</h2>
            <p class="text-subtitle-1 text-grey">Transaksi langsung dan Check-in otomatis</p>
        </div>

        <v-card class="mb-6" elevation="2">
            <v-card-title class="bg-grey-lighten-4">
                <v-icon icon="mdi-calendar-clock" start></v-icon>
                Langkah 1: Cek Jadwal
            </v-card-title>
            <v-card-text class="pt-4">
                <v-row align ="center">
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model="form.check_in"
                            label="Tanggal Check-in"
                            type="date"
                            :min="minDate"
                            variant="outlined"
                            hide-details="auto"
                            density="compact"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.durasi"
                            label="Durasi (Malam)"
                            type="number"
                            min="1"
                            variant="outlined"
                            hide-details="auto"
                            density="compact"
                            suffix="Malam"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                         <div class="text-caption text-grey">Checkout:</div>
                        <div class="font-weight-bold">{{ calculatedCheckOut }}</div>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-btn 
                            color="primary" 
                            block 
                            @click="checkAvailability" 
                            :loading="loading"
                            prepend-icon="mdi-magnify">
                            Cek
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <div v-if="rooms.length > 0" class="mb-6 animate__animated animate__fadeIn">
            <h3 class="text-h6 mb-3">Pilih Tipe Kamar</h3>
            <v-row>
                <v-col v-for="room in rooms" :key="room.id" cols="12" md="4">
                    <v-card 
                        :disabled="!room.is_available" 
                        :color="selectedRoom?.id === room.id ? 'primary-lighten-5' : ''"
                        :class="selectedRoom?.id === room.id ? 'border-primary' : ''"
                        class="h-100 d-flex flex-column"
                        style="border: 2px solid transparent; transition: all 0.2s"
                        @click="room.is_available ? selectRoom(room) : null"
                        elevation="2"
                    >
                        <v-img
                            v-if="room.images && room.images.length > 0"
                            :src="room.images[0].url || '/placeholder.jpg'" 
                            height="150"
                            cover
                        ></v-img>
                        <v-sheet v-else color="grey-lighten-2" height="150" class="d-flex align-center justify-center">
                            <v-icon size="50" color="grey">mdi-bed</v-icon>
                        </v-sheet>

                        <v-card-item>
                            <v-card-title>{{ room.nama_kamar }}</v-card-title>
                            <v-card-subtitle>
                                <span class="text-primary font-weight-bold">{{ formatRupiah(room.harga) }}</span> / malam
                            </v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="flex-grow-1">
                            <div class="d-flex justify-space-between align-center mt-2">
                                <v-chip :color="room.sisa_kamar ? 'success' : 'error'" size="small">
                                    {{ room.sisa_kamar ? 'Tersedia' : 'Penuh' }}
                                </v-chip>
                                <span class="text-caption">Sisa: <strong>{{ room.sisa_kamar }}</strong> unit</span>
                            </div>
                        </v-card-text>

                        <v-card-actions>
                            <v-btn 
                                block 
                                :color="selectedRoom?.id === room.id ? 'primary' : 'grey-darken-1'" 
                                :variant="selectedRoom?.id === room.id ? 'flat' : 'outlined'"
                            >
                                {{ selectedRoom?.id === room.id ? 'Dipilih' : 'Pilih Kamar Ini' }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <v-slide-y-transition>
            <v-card v-if="selectedRoom" class="mb-10 border-t-4 border-primary" elevation="4">
                <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-account-details" color="primary" class="mr-2"></v-icon>
                    Langkah 3: Data Tamu & Pembayaran
                </v-card-title>
                <v-divider></v-divider>
                
                <v-card-text class="pt-5">
                    <v-row>
                        <v-col cols="12" md="4" class="bg-grey-lighten-4 rounded pa-4">
                            <h4 class="text-subtitle-2 text-uppercase text-grey mb-3">Ringkasan</h4>
                            <div class="d-flex justify-space-between mb-2">
                                <span>Tipe Kamar:</span>
                                <strong>{{ selectedRoom.nama_kamar }}</strong>
                            </div>
                            <div class="d-flex justify-space-between mb-2">
                                <span>Check-in:</span>
                                <span>{{ form.check_in }}</span>
                            </div>
                            <div class="d-flex justify-space-between mb-2">
                                <span>Durasi:</span>
                                <span>{{ form.durasi }} Malam</span>
                            </div>
                             <div class="d-flex justify-space-between mb-2">
                                <span>Harga/Malam:</span>
                                <span>{{ formatRupiah(selectedRoom.harga) }}</span>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex justify-space-between text-h6 text-primary">
                                <span>Total Bayar:</span>
                                <strong>{{ formatRupiah(totalHarga) }}</strong>
                            </div>
                            <div class="mt-4">
                                <v-chip color="success" label size="small" class="w-100 justify-center">
                                    <v-icon start>mdi-check-circle</v-icon>
                                    Auto LUNAS (Walk-in)
                                </v-chip>
                            </div>
                        </v-col>

                        <v-col cols="12" md="8">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model="form.nama_pemesan"
                                        label="Nama Lengkap Tamu"
                                        variant="outlined"
                                        prepend-inner-icon="mdi-account"
                                        :rules="[v => !!v || 'Nama wajib diisi']"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model="form.no_hp"
                                        label="Nomor WhatsApp / HP"
                                        variant="outlined"
                                        type="number"
                                        prepend-inner-icon="mdi-whatsapp"
                                        :rules="[v => !!v || 'No HP wajib diisi']"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-alert
                                        type="info"
                                        variant="tonal"
                                        density="compact"
                                        icon="mdi-information"
                                        class="mb-4"
                                    >
                                        Akun user akan dibuat otomatis berdasarkan No HP jika belum terdaftar.
                                    </v-alert>
                                </v-col>
                            </v-row>

                            <v-btn 
                                color="success" 
                                size="large" 
                                block 
                                @click="submitWalkIn"
                                :loading="processing"
                                prepend-icon="mdi-cash-register"
                            >
                                PROSES CHECK-IN SEKARANG
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-slide-y-transition>

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
import { ref, computed, onMounted } from 'vue';
import axios from '../../axios';
// Sesuaikan import format rupiah jika kamu punya helper sendiri, 
// atau gunakan function simple di bawah.

// --- STATE ---
const loading = ref(false);
const processing = ref(false);
const rooms = ref([]); // Menyimpan hasil cek ketersediaan
const selectedRoom = ref(null); // Menyimpan kamar yang dipilih admin

// Form Input
const form = ref({
    check_in: new Date().toLocaleDateString('en-CA'), // Default hari ini
    durasi: 1, // Default 1 malam
    nama_pemesan: '',
    no_hp: '',
    jumlah_kamar: 1, // Default 1 kamar
});

// Snackbar untuk notifikasi
const snackbar = ref({
    show: false,
    color: '',
    text: ''
});

// --- COMPUTED ---
// Menghitung tanggal checkout otomatis untuk dikirim ke API Cek Ketersediaan
const calculatedCheckOut = computed(() => {
    if (!form.value.check_in || !form.value.durasi) return '';
    
    const date = new Date(form.value.check_in);
    date.setDate(date.getDate() + parseInt(form.value.durasi));
    return date.toISOString().substr(0, 10);
});

// Hitung total harga real-time
const totalHarga = computed(() => {
    if (!selectedRoom.value) return 0;
    return selectedRoom.value.harga * form.value.durasi * form.value.jumlah_kamar;
});

// --- FUNCTIONS ---

// 1. Cek Ketersediaan (GET)
const checkAvailability = async () => {
    if (!form.value.check_in || form.value.durasi < 1) {
        showSnackbar('error', 'Mohon isi tanggal dan durasi dengan benar');
        return;
    }

    loading.value = true;
    selectedRoom.value = null; // Reset pilihan jika cek ulang

    try {
        // PENTING: Gunakan params untuk GET request
        const response = await axios.get('/cek-ketersediaan', {
            params: {
                check_in: form.value.check_in,
                check_out: calculatedCheckOut.value // Kirim tgl checkout hasil hitungan
            }
        });
        
        rooms.value = response.data.data; // Sesuaikan dengan struktur JSON controller
        
        if(rooms.value.length === 0) {
            showSnackbar('warning', 'Tidak ada data kamar ditemukan.');
        }

    } catch (error) {
        console.error(error);
        showSnackbar('error', 'Gagal mengecek ketersediaan.');
    } finally {
        loading.value = false;
    }
};

// 2. Pilih Kamar
const selectRoom = (room) => {
    selectedRoom.value = room;
    // Scroll otomatis ke bawah agar admin melihat form tamu
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
};

// 3. Submit Walk-in (POST)
const submitWalkIn = async () => {
    if (!form.value.nama_pemesan || !form.value.no_hp) {
        showSnackbar('error', 'Nama dan No HP Tamu wajib diisi!');
        return;
    }

    processing.value = true;

    try {
        // Payload sesuai Controller storeOffline
        const payload = {
            nama_pemesan: form.value.nama_pemesan,
            no_hp: form.value.no_hp,
            kamar_id: selectedRoom.value.id_kamar, // atau id_kamar
            check_in: form.value.check_in,
            durasi: parseInt(form.value.durasi),
            jumlah_kamar: parseInt(form.value.jumlah_kamar)
        };

        const response = await axios.post('/admin/pemesanan-offline', payload);

        showSnackbar('success', 'Check-in Berhasil! Transaksi tersimpan.');
        
        // Reset Form setelah sukses
        resetForm();

    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || 'Terjadi kesalahan sistem.';
        showSnackbar('error', msg);
    } finally {
        processing.value = false;
    }
};

const resetForm = () => {
    selectedRoom.value = null;
    rooms.value = [];
    form.value.nama_pemesan = '';
    form.value.no_hp = '';
    // Tanggal tidak direset agar admin bisa input tamu berikutnya dengan cepat
};

const showSnackbar = (color, text) => {
    snackbar.value = { show: true, color, text };
};

const minDate = computed(() => {
    return new Date().toLocaleDateString('en-CA');
});
// Helper Format Rupiah
const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
};
</script>
<style scoped>
.border-primary {
    border: 2px solid #1976D2 !important; /* Sesuaikan warna primary */
}
</style>