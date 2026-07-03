<script setup lang="ts">
import { ref } from 'vue'

const optionSingle = ref('compact')
const optionMultiple = ref(['motion', 'contrast'])
const file = ref<File | null>(null)
const color = ref('#6366f1')
const date = ref('2029/08/17')
const time = ref('10:30')
const popupLabel = ref('Editable label')

const optionChoices = [
  { label: 'Compact cards', value: 'compact' },
  { label: 'Comfortable cards', value: 'comfortable' },
  { label: 'Large touch targets', value: 'touch' },
]

const checkboxChoices = [
  { label: 'Motion', value: 'motion' },
  { label: 'Contrast', value: 'contrast' },
  { label: 'Density', value: 'density' },
]
</script>

<template>
  <q-card class="catalog-card q-pa-lg">
    <div class="text-h6 qds-display q-mb-md">Forms, pickers &amp; editing</div>
    <q-form class="catalog-form">
      <div class="catalog-grid catalog-grid--three">
        <div class="catalog-demo">
          <div class="catalog-label">QOptionGroup</div>
          <q-option-group v-model="optionSingle" :options="optionChoices" color="primary" />
          <q-separator spaced />
          <q-option-group v-model="optionMultiple" :options="checkboxChoices" color="accent" type="checkbox" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QFile</div>
          <q-file v-model="file" label="Choose local file" outlined clearable counter />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QColor</div>
          <q-color v-model="color" default-view="palette" class="catalog-picker" data-test="qds-catalog-color" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QDate</div>
          <q-date v-model="date" flat bordered class="catalog-picker" data-test="qds-catalog-date" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QTime</div>
          <q-time v-model="time" flat bordered format24h class="catalog-picker" data-test="qds-catalog-time" />
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QPopupEdit</div>
          <div class="catalog-edit-target">
            {{ popupLabel }}
            <q-popup-edit v-model="popupLabel" buttons v-slot="scope">
              <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </div>
        </div>
      </div>
    </q-form>
  </q-card>
</template>
