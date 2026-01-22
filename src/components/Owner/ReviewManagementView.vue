<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-star-cog"></v-icon> &nbsp;
        Manajemen Review Pelanggan

        <v-spacer></v-spacer>

        <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewDialog">
          Tambah Review
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table-server
        v-model:items-per-page="options.itemsPerPage"
        :headers="headers"
        :items="reviews"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        class="elevation-1"
        item-value="id"
        @update:options="options = $event"
      >
        <template v-slot:[`item.rating`]="{ value }">
          <v-rating
            :model-value="value"
            color="amber"
            density="compact"
            size="small"
            readonly
          ></v-rating>
        </template>

        <template v-slot:[`item.komentar`]="{ value }">
          <div class="text-truncate" style="max-width: 300px;">
            {{ value }}
          </div>
        </template>

        <template v-slot:[`item.status`]="{ value }">
          <v-chip :color="getStatusColor(value)" size="small">
            {{ value }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-icon class="me-2" size="small" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" @click="deleteItem(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.user_name"
                  label="Nama User"
                  readonly
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.komentar"
                  label="Komentar"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <p class="text-subtitle-1">Rating</p>
                <v-rating
                  v-model="editedItem.rating"
                  color="amber"
                  density="default"
                ></v-rating>
              </v-col>
              <v-col cols="12" sm="6">
                 <v-select
                    v-model="editedItem.status"
                    :items="['disetujui', 'pending', 'ditolak']"
                    label="Status"
                    variant="outlined"
                  ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="close">
            Batal
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="save">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Anda yakin ingin menghapus review ini?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Batal</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="deleteItemConfirm">HAPUS</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted,computed,watch } from 'vue';
import apiClient from '../../axios';

// State untuk Data Table
const reviews = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const search = ref('');
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'created_at', order: 'desc' }],
});

// State untuk Dialog
const dialog = ref(false);
const dialogDelete = ref(false);
const editedItem = ref({
  id: null,
  user_name: '',
  rating: 0,
  komentar: '',
  status: 'pending',
});
const defaultItem = { ...editedItem.value };
const editedIndex = ref(-1);

const formTitle = computed(() => (editedIndex.value === -1 ? 'Tambah Review Baru' : 'Edit Review'));

// Headers untuk Data Table
const headers = [
  { title: 'User', key: 'user.name', sortable: false },
  { title: 'Rating', key: 'rating' },
  { title: 'Komentar', key: 'komentar', sortable: false },
  { title: 'Status', key: 'status' },
  { title: 'Tanggal', key: 'created_at' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

// CRUD Functions
const fetchReviews = async () => {
  loading.value = true;
  try {
    const { page, itemsPerPage, sortBy } = options.value;
    const response = await apiClient.get('admin/review', {
      params: {
        page,
        per_page: itemsPerPage,
        sort_by: sortBy[0]?.key,
        sort_order: sortBy[0]?.order,
      }
    });
    reviews.value = response.data;
    totalItems.value = response.data.total;
  } catch (error) {
    console.error("Gagal mengambil data review:", error);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  try {
    if (editedIndex.value > -1) {
      // Update
      await apiClient.put(`admin/review/${editedItem.value.id}`, editedItem.value);
    } else {
      // Create (Manual)
      await apiClient.post('admin/review', editedItem.value);
    }
    close();
    fetchReviews(); // Refresh data
  } catch (error) {
    console.error("Gagal menyimpan review:", error);
  }
};

const deleteItemConfirm = async () => {
  try {
    await apiClient.delete(`admin/review/${editedItem.value.id}`);
    closeDelete();
    fetchReviews(); // Refresh data
  } catch (error) {
    console.error("Gagal menghapus review:", error);
  }
};

// Dialog handlers
const openNewDialog = () => {
  editedItem.value = { ...defaultItem };
  editedIndex.value = -1;
  dialog.value = true;
};

const editItem = (item) => {
  editedIndex.value = reviews.value.indexOf(item);
  editedItem.value = { ...item, user_name: item.user?.name }; // Ambil nama user
  dialog.value = true;
};

const deleteItem = (item) => {
  editedIndex.value = reviews.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const close = () => {
  dialog.value = false;
  editedItem.value = { ...defaultItem };
  editedIndex.value = -1;
};

const closeDelete = () => {
  dialogDelete.value = false;
  editedItem.value = { ...defaultItem };
  editedIndex.value = -1;
};

// Helper function
const getStatusColor = (status) => {
  if (status === 'disetujui') return 'green';
  if (status === 'ditolak') return 'red';
  return 'orange';
};

// Watch for changes in table options (pagination, sorting)
watch(options, fetchReviews, { deep: true, immediate: true });
</script>