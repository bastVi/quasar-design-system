<script setup lang="ts">
import { ref } from 'vue'

const optionSingle = ref('compact')
const optionMultiple = ref(['motion', 'contrast'])
const checkbox = ref(true)
const radio = ref('air')
const toggle = ref(true)
const file = ref<File | null>(null)
const inputReadonly = ref('Tokenized readonly input')
const inputError = ref('Needs attention')
const inputDisabled = ref('Disabled input')
const selectReadonly = ref('Comfortable')
const selectError = ref('Compact')
const selectDisabled = ref('Touch')
const slider = ref(62)
const range = ref({ min: 24, max: 78 })
const color = ref('#6366f1')
const date = ref('2029/08/17')
const time = ref('10:30')
const popupLabel = ref('Editable label')

const selectOptions = ['Compact', 'Comfortable', 'Touch']

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
          <div class="catalog-label">QInput states</div>
          <div class="catalog-stack">
            <div data-test="qds-catalog-input-readonly">
              <q-input v-model="inputReadonly" label="Readonly" outlined readonly />
            </div>
            <div data-test="qds-catalog-input-error">
              <q-input v-model="inputError" label="Error" outlined error error-message="Visible validation message" />
            </div>
            <div data-test="qds-catalog-input-disabled">
              <q-input v-model="inputDisabled" label="Disabled" outlined disable />
            </div>
          </div>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QSelect states</div>
          <div class="catalog-stack">
            <div data-test="qds-catalog-select-readonly">
              <q-select v-model="selectReadonly" :options="selectOptions" label="Readonly" outlined readonly />
            </div>
            <div data-test="qds-catalog-select-error">
              <q-select v-model="selectError" :options="selectOptions" label="Error" outlined error error-message="Visible selection message" />
            </div>
            <div data-test="qds-catalog-select-disabled">
              <q-select v-model="selectDisabled" :options="selectOptions" label="Disabled" outlined disable />
            </div>
          </div>
        </div>

        <div class="catalog-demo" data-test="qds-catalog-option-group">
          <div class="catalog-label">QOptionGroup</div>
          <q-option-group v-model="optionSingle" data-test="qds-catalog-option-radio" :options="optionChoices" color="primary" />
          <q-separator spaced />
          <q-option-group
            v-model="optionMultiple"
            data-test="qds-catalog-option-checkbox"
            :options="checkboxChoices"
            color="accent"
            type="checkbox"
          />
          <q-separator spaced />
          <div class="catalog-stack">
            <q-checkbox v-model="checkbox" data-test="qds-catalog-checkbox" color="primary" label="Checkbox proof" />
            <q-radio v-model="radio" data-test="qds-catalog-radio" val="air" color="primary" label="Radio proof" />
            <q-toggle v-model="toggle" data-test="qds-catalog-toggle" color="primary" label="Toggle proof" />
          </div>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QFile</div>
          <div data-test="qds-catalog-file">
            <q-file v-model="file" label="Choose local file" outlined clearable counter display-value="token-proof.pdf" />
          </div>
        </div>

        <div class="catalog-demo">
          <div class="catalog-label">QSlider &amp; QRange</div>
          <div class="catalog-stack catalog-stack--relaxed">
            <q-slider v-model="slider" data-test="qds-catalog-slider" :min="0" :max="100" label label-always markers />
            <q-range v-model="range" data-test="qds-catalog-range" :min="0" :max="100" label label-always markers />
          </div>
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
