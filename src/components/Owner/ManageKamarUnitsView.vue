<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-toolbar color="primary" title="Kelola Unit Kamar"></v-toolbar>
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4 mt-2">
          <h3 class="text-h6">{{ kamar?.tipe_kamar }}</h3>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
            Tambah Unit
          </v-btn>
        </div>

        <v-data-table
          :headers="headers"
          :items="units"
          :loading="loading"
        >
          <template v-slot:[`item.status_unit`]="{ item }">
            <v-chip :color="getStatusColor(item.status_unit)" size="small" class="text-uppercase">
              {{ getStatusLabel(item.status_unit) }}
            </v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn icon="mdi-pencil" variant="text" size="small" color="blue" @click="openEditDialog(item)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="dialog = false">Tutup</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Dialog Add/Edit Unit -->
    <v-dialog v-model="formDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ isEditing ? 'Edit Status Unit' : 'Tambah Unit Baru' }}</v-card-title>
        <v-card-text>
           <v-form ref="form" v-model="valid" @submit.prevent="saveUnit">
            <v-text-field
              v-model="editedItem.nomor_unit"
              label="Nama/Nomor Unit"
              :rules="[v => !!v || 'Harus diisi']"
              variant="outlined"
              :disabled="isEditing" 
            ></v-text-field>

            <v-select
              v-model="editedItem.status_unit"
              label="Status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
            ></v-select>
           </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="formDialog = false">Batal</v-btn>
          <v-btn color="primary" @click="saveUnit" :loading="saving">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

     <!-- Dialog Delete Confirm -->
     <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Hapus Unit?</v-card-title>
        <v-card-text>Yakin ingin menghapus unit {{ itemToDelete?.nomor_unit }}?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="error" @click="deleteUnit" :loading="deleting">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import apiClient from '../../axios';

const props = defineProps({
  modelValue: Boolean,
  kamar: Object
});

const emit = defineEmits(['update:modelValue']);

const dialog = ref(false);
const units = ref([]);
const loading = ref(false);
const formDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);
const valid = ref(false);

const editedItem = ref({ id: null, nomor_unit: '', status_unit: 'available' });
const itemToDelete = ref(null);

const headers = [
  { title: 'Nama Unit', key: 'nomor_unit' },
  { title: 'Status', key: 'status_unit' },
  { title: 'Aksi', key: 'actions', sortable: false },
];

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val && props.kamar) {
    fetchUnits();
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const fetchUnits = async () => {
  if (!props.kamar) return;
  loading.value = true;
  try {
    const response = await apiClient.get('/kamar-units', { params: { kamar_id: props.kamar.id_kamar } });
    if (response.success) {
      units.value = response.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  if (status === 'available') return 'success';
  if (status === 'unavailable') return 'error';
  if (status === 'kotor') return 'orange';
  return 'warning'; // maintenance
};

const statusOptions = [
    { title: 'Available', value: 'available' },
    { title: 'Unavailable', value: 'unavailable' },
    { title: 'Kotor', value: 'kotor' },
    { title: 'Maintenance', value: 'maintenance' },
];

const getStatusLabel = (status) => {
    const found = statusOptions.find(o => o.value === status);
    return found ? found.title : status;
};

const openAddDialog = () => {
    isEditing.value = false;
    editedItem.value = { 
        id: null, 
        nomor_unit: '', 
        status_unit: 'available',
        kamar_id: props.kamar.id_kamar 
    };
    formDialog.value = true;
};

const openEditDialog = (item) => {
    isEditing.value = true;
    editedItem.value = { ...item };
    formDialog.value = true;
};

const confirmDelete = (item) => {
    itemToDelete.value = item;
    deleteDialog.value = true;
};

const saveUnit = async () => {
    saving.value = true;
    try {
        if (isEditing.value) {
            // Update
             await apiClient.put(`/kamar-units/${editedItem.value.id}`, {
                status_unit: editedItem.value.status_unit
             });
        } else {
            // Create
            if(!editedItem.value.kamar_id) editedItem.value.kamar_id = props.kamar.id_kamar;
            await apiClient.post('/kamar-units', editedItem.value);
        }
        formDialog.value = false;
        fetchUnits();
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Gagal menyimpan');
    } finally {
        saving.value = false;
    }
};

const deleteUnit = async () => {
    if (!itemToDelete.value) return;
    deleting.value = true;
    try {
        await apiClient.delete(`/kamar-units/${itemToDelete.value.id}`);
        deleteDialog.value = false;
        fetchUnits();
    } catch (error) {
         console.error(error);
         alert(error.response?.data?.message || 'Gagal menghapus');
    } finally {
        deleting.value = false;
    }
};
</script>
