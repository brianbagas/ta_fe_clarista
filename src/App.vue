<script setup>
import { useAuthStore } from './stores/auth';
import Header from './components/Menu/Header.vue';
import Footer from './components/Menu/Footer.vue';
import { ref, onMounted, computed } from 'vue';
import Sidebar from './components/Menu/Sidebar.vue';

const auth = useAuthStore();

onMounted(() => {
  auth.fetchUser();
});

const drawer = ref(true);
const isOwner = computed(() => auth.isAuthenticated && auth.userRole === 'owner');

</script>

<template>
  <v-app>
      <Sidebar v-if="isOwner"/>


    <Header @toggle-drawer="drawer = !drawer" />
  <div>
    <v-main>    
      <router-view />
    </v-main>

  </div>
  <Footer />
  </v-app>

</template>

<style scoped>
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
  a:hover{
  }
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */


</style>
