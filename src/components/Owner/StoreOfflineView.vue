<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        
        <div class="mb-4">
            <h2 class="text-left text-h4 font-weight-bold text-primary">Input Walk-in Guest</h2>
            <p class="text-left text-subtitle-1 text-grey">{{ isCheckInToday ? 'Transaksi langsung dan Check-in otomatis' : 'Reservasi offline untuk tanggal mendatang' }}</p>
        </div>

        <v-card class="mb-6" elevation="2">
            <v-card-title class="bg-grey-lighten-4 text-left">
                <v-icon icon="mdi-calendar-clock" start></v-icon>
               Cek Jadwal
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
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model="form.check_out"
                            label="Tanggal Check-out"
                            type="date"
                            :min="minCheckOut"
                            variant="outlined"
                            hide-details="auto"
                            density="compact"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                         <div class="text-caption text-grey">Durasi:</div>
                        <div class="font-weight-bold text-primary">{{ durasi }} Malam</div>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-btn 
                            color="primary" 
                            block 
                            @click="checkAvailability" 
                            :loading="loading"
                            :disabled="durasi < 1"
                            prepend-icon="mdi-magnify">
                            Cek
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Room Selection - Multi Select with Quantity -->
        <div v-if="rooms.length > 0" class="mb-6 animate__animated animate__fadeIn">
            <h3 class="text-h6 mb-3">
                Pilih Tipe Kamar 
                <v-chip v-if="selectedRooms.length > 0" color="primary" size="small" class="ml-2">
                    {{ selectedRooms.length }} tipe dipilih
                </v-chip>
            </h3>
            <v-row>
                <v-col v-for="room in rooms" :key="room.id" cols="12" md="4">
                    <v-card 
                        :disabled="!room.is_available" 
                        :color="isRoomSelected(room) ? 'primary-lighten-5' : ''"
                        :class="isRoomSelected(room) ? 'border-primary' : ''"
                        class="h-100 d-flex flex-column"
                        style="border: 2px solid transparent; transition: all 0.2s"
                        elevation="2"
                    >
                        <v-img
                            v-if="room.images && room.images.length > 0"
                            :src="room.images[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop'" 
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
                            
                            <!-- Quantity Stepper -->
                            <div v-if="room.is_available" class="mt-4">
                                <div class="text-caption text-grey mb-1">Jumlah Unit</div>
                                <div class="d-flex align-center justify-center ga-2">
                                    <v-btn
                                        icon
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        :disabled="getRoomQuantity(room) <= 0"
                                        @click="decrementRoom(room)"
                                    >
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                    <div class="text-h6 mx-3" style="min-width: 40px; text-align: center;">
                                        {{ getRoomQuantity(room) }}
                                    </div>
                                    <v-btn
                                        icon
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        :disabled="getRoomQuantity(room) >= room.sisa_kamar"
                                        @click="incrementRoom(room)"
                                    >
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </v-card-text>

                        <v-card-actions>
                            <v-btn 
                                block 
                                :color="isRoomSelected(room) ? 'primary' : 'grey-darken-1'" 
                                :variant="isRoomSelected(room) ? 'flat' : 'outlined'"
                                @click="toggleRoom(room)"
                                :disabled="!room.is_available"
                            >
                                <v-icon start>{{ isRoomSelected(room) ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                                {{ isRoomSelected(room) ? `${getRoomQuantity(room)} Unit Dipilih` : 'Tambah ke Pesanan' }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <!-- Summary & Guest Form -->
        <v-slide-y-transition>
            <v-card v-if="selectedRooms.length > 0" class="mb-10 border-t-4 border-primary" elevation="4">
                <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-account-details" color="primary" class="mr-2"></v-icon>
                    Data Tamu & Pembayaran
                </v-card-title>
                <v-divider></v-divider>
                
                <v-card-text class="pt-5">
                    <v-row>
                        <v-col cols="12" md="4" class="bg-grey-lighten-4 rounded pa-4">
                            <h4 class="text-subtitle-2 text-uppercase text-grey mb-3">Ringkasan Pesanan</h4>
                            
                            <!-- List all selected rooms -->
                            <div v-for="(item, index) in selectedRooms" :key="index" class="mb-3">
                                <div class="d-flex justify-space-between align-center">
                                    <strong>{{ item.room.nama_kamar }}</strong>
                                    <v-btn icon size="x-small" variant="text" @click="removeRoom(item.room)">
                                        <v-icon size="small">mdi-close</v-icon>
                                    </v-btn>
                                </div>
                                <div class="text-caption text-grey">
                                    {{ item.qty }} unit × {{ formatRupiah(item.room.harga) }} × {{ durasi }} malam
                                </div>
                                <div class="text-body-2 text-right">
                                    {{ formatRupiah(item.room.harga * item.qty * durasi) }}
                                </div>
                            </div>
                            
                            <v-divider class="my-3"></v-divider>
                            
                            <div class="d-flex justify-space-between mb-2">
                                <span>Check-in:</span>
                                <span>{{ form.check_in }}</span>
                            </div>
                            <div class="d-flex justify-space-between mb-2">
                                <span>Check-out:</span>
                                <span>{{ form.check_out }}</span>
                            </div>
                            <div class="d-flex justify-space-between mb-2">
                                <span>Durasi:</span>
                                <span>{{ durasi }} Malam</span>
                            </div>
                            
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex justify-space-between text-h6 text-primary">
                                <span>Total Bayar:</span>
                                <strong>{{ formatRupiah(totalHarga) }}</strong>
                            </div>
                            <div class="mt-4">
                                <v-chip :color="isCheckInToday ? 'success' : 'info'" label size="small" class="w-100 justify-center">
                                    <v-icon start>{{ isCheckInToday ? 'mdi-check-circle' : 'mdi-calendar-clock' }}</v-icon>
                                    {{ isCheckInToday ? 'Auto LUNAS & Check-in' : 'Reservasi Terkonfirmasi' }}
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
                                :color="isCheckInToday ? 'success' : 'primary'" 
                                size="large" 
                                block 
                                @click="submitWalkIn"
                                :loading="processing"
                                :prepend-icon="isCheckInToday ? 'mdi-cash-register' : 'mdi-calendar-check'"
                            >
                                {{ isCheckInToday ? 'PROSES CHECK-IN SEKARANG' : 'BUAT RESERVASI OFFLINE' }}
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
import { ref, computed } from 'vue';
import axios from '../../axios';

// --- STATE ---
const loading = ref(false);
const processing = ref(false);
const rooms = ref([]);
const selectedRooms = ref([]); // Array of { room: object, qty: number }

// Form Input
const form = ref({
    check_in: new Date().toLocaleDateString('en-CA'),
    check_out: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toLocaleDateString('en-CA');
    })(),
    nama_pemesan: '',
    no_hp: '',
});

// Snackbar untuk notifikasi
const snackbar = ref({
    show: false,
    color: '',
    text: ''
});

// --- COMPUTED ---
// Hitung durasi dari selisih tanggal
const durasi = computed(() => {
    if (!form.value.check_in || !form.value.check_out) return 0;
    
    const checkIn = new Date(form.value.check_in);
    const checkOut = new Date(form.value.check_out);
    const diffTime = checkOut - checkIn;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

// Hitung total harga dari semua kamar yang dipilih
const totalHarga = computed(() => {
    return selectedRooms.value.reduce((total, item) => {
        return total + (item.room.harga * item.qty * durasi.value);
    }, 0);
});

const minDate = computed(() => {
    return new Date().toLocaleDateString('en-CA');
});

// Minimal checkout = check-in + 1 hari
const minCheckOut = computed(() => {
    if (!form.value.check_in) return minDate.value;
    
    const date = new Date(form.value.check_in);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-CA');
});

const isCheckInToday = computed(() => {
    if (!form.value.check_in) return true;
    const today = new Date().toLocaleDateString('en-CA');
    return form.value.check_in === today;
});

// --- FUNCTIONS ---

// Check if room is selected
const isRoomSelected = (room) => {
    return selectedRooms.value.some(item => item.room.id_kamar === room.id_kamar);
};

// Get quantity for a room
const getRoomQuantity = (room) => {
    const found = selectedRooms.value.find(item => item.room.id_kamar === room.id_kamar);
    return found ? found.qty : 0;
};

// Update room quantity
const updateRoomQuantity = (room, qty) => {
    const quantity = parseInt(qty) || 0;
    const index = selectedRooms.value.findIndex(item => item.room.id_kamar === room.id_kamar);
    
    if (quantity > 0 && quantity <= room.sisa_kamar) {
        if (index >= 0) {
            selectedRooms.value[index].qty = quantity;
        } else {
            selectedRooms.value.push({ room, qty: quantity });
        }
    } else if (quantity === 0 && index >= 0) {
        selectedRooms.value.splice(index, 1);
    }
};

// Increment room quantity (for stepper +)
const incrementRoom = (room) => {
    const currentQty = getRoomQuantity(room);
    if (currentQty < room.sisa_kamar) {
        updateRoomQuantity(room, currentQty + 1);
    }
};

// Decrement room quantity (for stepper -)
const decrementRoom = (room) => {
    const currentQty = getRoomQuantity(room);
    if (currentQty > 0) {
        updateRoomQuantity(room, currentQty - 1);
    }
};

// Toggle room selection
const toggleRoom = (room) => {
    const index = selectedRooms.value.findIndex(item => item.room.id_kamar === room.id_kamar);
    if (index >= 0) {
        selectedRooms.value.splice(index, 1);
    } else {
        selectedRooms.value.push({ room, qty: 1 });
    }
};

// Remove room from selection
const removeRoom = (room) => {
    const index = selectedRooms.value.findIndex(item => item.room.id_kamar === room.id_kamar);
    if (index >= 0) {
        selectedRooms.value.splice(index, 1);
    }
};

// 1. Cek Ketersediaan (GET)
const checkAvailability = async () => {
    if (!form.value.check_in || !form.value.check_out || durasi.value < 1) {
        showSnackbar('error', 'Mohon isi tanggal check-in dan check-out dengan benar');
        return;
    }

    loading.value = true;
    selectedRooms.value = []; // Reset pilihan jika cek ulang

    try {
        const response = await axios.get('/cek-ketersediaan', {
            params: {
                check_in: form.value.check_in,
                check_out: form.value.check_out
            }
        });
        
        if (response.success) {
            rooms.value = response.data;
            
            if(rooms.value.length === 0) {
                showSnackbar('warning', 'Tidak ada data kamar ditemukan.');
            }
        } else {
            showSnackbar('error', response.message || 'Gagal mengecek ketersediaan.');
        }
    } catch (error) {
        console.error(error);
        showSnackbar('error', error.response?.data?.message || 'Gagal mengecek ketersediaan.');
    } finally {
        loading.value = false;
    }
};

// 2. Submit Walk-in (POST)
const submitWalkIn = async () => {
    if (!form.value.nama_pemesan || !form.value.no_hp) {
        showSnackbar('error', 'Nama dan No HP Tamu wajib diisi!');
        return;
    }

    if (selectedRooms.value.length === 0) {
        showSnackbar('error', 'Pilih minimal satu kamar!');
        return;
    }

    processing.value = true;

    try {
        // Payload sesuai Controller storeOffline yang baru (array kamars)
        const payload = {
            nama_pemesan: form.value.nama_pemesan,
            no_hp: form.value.no_hp,
            check_in_date: form.value.check_in,
            durasi: durasi.value,
            kamars: selectedRooms.value.map(item => ({
                kamar_id: item.room.id_kamar,
                jumlah_kamar: item.qty
            }))
        };

        const response = await axios.post('/admin/pemesanan-offline', payload);

        if (response.success) {
            showSnackbar('success', response.message || 'Transaksi berhasil!');
            resetForm();
        }
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || 'Terjadi kesalahan sistem.';
        showSnackbar('error', msg);
    } finally {
        processing.value = false;
    }
};

const resetForm = () => {
    selectedRooms.value = [];
    rooms.value = [];
    form.value.nama_pemesan = '';
    form.value.no_hp = '';
};

const showSnackbar = (color, text) => {
    snackbar.value = { show: true, color, text };
};

const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
};
</script>
<style scoped>
.border-primary {
    border: 2px solid #1976D2 !important;
}
</style>