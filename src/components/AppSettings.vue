<script setup lang="ts">
import SettingsPanel from './SettingsPanel.vue';
import { useSettingsStore } from '../stores/settings';
const open = defineModel<boolean>({ required: true });
const store = useSettingsStore();
</script>
<template>
  <SettingsPanel v-model="open" title="App 設定">
    <div class="audio-setting">
      <q-icon name="volume_up" size="26px" /><span>音效</span
      ><q-toggle
        v-model="store.settings.soundEnabled"
        aria-label="音效"
        :label="store.settings.soundEnabled ? 'ON' : 'OFF'"
        color="primary"
      />
    </div>
    <div class="audio-setting">
      <q-icon name="record_voice_over" size="26px" /><span>日文語音</span
      ><q-toggle
        v-model="store.settings.japaneseSpeechEnabled"
        aria-label="日文語音"
        :label="store.settings.japaneseSpeechEnabled ? 'ON' : 'OFF'"
        color="primary"
      />
    </div>
  </SettingsPanel>
</template>
