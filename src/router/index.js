import { createRouter, createWebHistory } from 'vue-router';
import HomepageView from '../components/HomepageView.vue'; // Updated filename
import RoomListPublic from '../components/Kamar.vue';
import LoginView from '../components/LoginView.vue';
import RegisterView from '../components/RegisterView.vue'; // Updated filename
import PromoView from '../components/PromoView.vue'; // Updated filename
import KelolaKamarView from '../components/Owner/KelolaKamarView.vue'; // Updated filename
import KelolaHomestayView from '../components/KelolaHomestayView.vue'; // Updated filename
import ProfileCustomerView from '../components/Customer/ProfileCustomerView.vue';
import RiwayatPemesananView from '../components/Customer/RiwayatPemesananView.vue'; // Updated filename
import DetailPemesananView from '../components/Customer/DetailPemesananView.vue';
import DetailPemesananOwnerView from '../components/Owner/DetailPemesananOwnerView.vue';
import ListPemesananView from '../components/Owner/ListPemesananView.vue';
import BookingView from '../components/Customer/BookingView.vue';
import UnggahBuktiBayarView from '../components/Customer/UnggahBuktiBayarView.vue';
import VerifikasiPembayaranView from '../components/Owner/VerifikasiPembayaranView.vue';
import CreateReviewView from '../components/Customer/CreateReviewView.vue';
import ReviewManagementView from '../components/Owner/ReviewManagementView.vue';
import PromoManagementView from '../components/Owner/PromoManagementView.vue';
import LaporanView from '../components/Owner/LaporanView.vue';
import HapusDataView from '../components/Owner/HapusDataView.vue';
import DashboardOwnerView from '../components/Owner/DashboardOwnerView.vue';
import NotFoundView from '../components/NotFoundView.vue';
import StoreOfflineView from '../components/Owner/StoreOfflineView.vue';
import KalenderDataView from '../components/Owner/KalenderOkupansiView.vue';

const routes = [
  {
    path: '/',
    name: 'HomepageView',
    component: HomepageView,
  },
  {
    path: '/owner',
    name: 'OwnerDashboard',
    component: DashboardOwnerView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  /* 
  {
    path: '/kamar',
    name: 'Kamar',
    component: RoomListPublic,
  },
  */
  {
    path: '/promo',
    name: 'Promo',
    component: PromoView,
  },
  {
    path: '/admin/kamar',
    name: 'KelolaKamar',
    component: KelolaKamarView,
  },

  {
    path: '/admin/konten',
    name: 'KelolaKonten',
    component: KelolaHomestayView,

  },

  {
    path: '/profile',
    name: 'Profile',
    component: ProfileCustomerView,
  },
  {
    path: '/admin/laporan',
    name: 'Laporan',
    component: LaporanView,
  },
  {
    path: '/pesanan-saya',
    name: 'RiwayatPesanan',
    component: RiwayatPemesananView,
    meta: { requiresAuth: true }
  },

  {
    path: '/pesanan-saya/:id',
    name: 'DetailPesanan',
    component: DetailPemesananView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/pesanan-saya/:id',
    name: 'DetailPesananOwner',
    component: DetailPemesananOwnerView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/pesanan',
    name: 'DaftarPesanan',
    component: ListPemesananView,
  },
  {
    path: '/admin/promo',
    name: 'AdminDaftarPromo',
    component: PromoManagementView,
  },
  {
    path: '/booking',
    name: 'Booking',
    component: BookingView,
  },
  {
    path: '/pesanan-saya/:id/bayar',
    name: 'BayarPesanan',
    component: UnggahBuktiBayarView,
  },
  {
    path: '/admin/verifikasi-pembayaran/:id',
    name: 'VerifikasiPembayaran',
    component: VerifikasiPembayaranView,
    meta: { requiresAuth: true, requiresOwner: true }
  },
  {
    path: '/pesanan-saya/:id/review',
    name: 'TulisReview',
    component: CreateReviewView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/review',
    name: 'KelolaReview',
    component: ReviewManagementView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/hapus-data',
    name: 'HapusData',
    component: HapusDataView,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  },
  {
    path: '/admin/storeOffline',
    name: 'StoreOffline',
    component: StoreOfflineView,
  },
  {
    path: '/admin/kalender-data',
    name: 'KalenderData',
    component: KalenderDataView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard enabled
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    // const userRole = localStorage.getItem('userRole'); // Adjust based on your auth store

    if (!token) {
      next('/login');
    }
    // Uncomment and adjust logic if role based protection is needed
    // else if (to.meta.requiredRole && to.meta.requiredRole !== userRole) {
    //   alert('Anda tidak memiliki izin untuk mengakses halaman ini.');
    //   next('/');
    // } 
    else {
      next();
    }
  } else {
    next();
  }
});

export default router;