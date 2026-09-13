<script setup lang="ts">
import { ref } from 'vue';
import PracticeSettings from '../../components/PracticeSettings.vue';
import AppSettings from '../../components/AppSettings.vue';
import { useSettingsStore } from '../../stores/settings';
const store = useSettingsStore();
const practiceOpen = ref(false);
const appOpen = ref(false);
const startNotice = ref(false);
</script>
<template>
  <q-page class="home-page">
    <header class="home-header">
      <div class="brand">
        <span class="brand-mark" lang="ja">いっしょ</span
        ><span class="brand-caption">日文助詞練習</span>
      </div>
      <q-btn
        flat
        round
        icon="settings"
        aria-label="App 設定"
        class="icon-button"
        @click="appOpen = true"
      />
    </header>
    <main class="home-main">
      <section class="practice-summary" aria-label="目前練習設定">
        <p class="eyebrow">這次，一起練習</p>
        <div
          class="lesson-emblem"
          :class="{ 'multiple-lessons': store.settings.selectedLessons.length !== 1 }"
        >
          <template v-if="store.settings.selectedLessons.length === 1"
            ><span class="lesson-kicker">LESSON</span>
            <h1>{{ store.settings.selectedLessons[0] }}</h1>
            <span class="lesson-unit">第 {{ store.settings.selectedLessons[0] }} 課</span></template
          >
          <template v-else
            ><q-icon name="auto_stories" size="36px" />
            <h1>{{ store.settings.selectedLessons.length }} <small>課</small></h1></template
          >
        </div>
        <p v-if="store.settings.selectedLessons.length !== 1" class="lesson-summary">
          {{ store.lessonLabel }}
        </p>
        <div class="home-particles" lang="ja">
          <span v-for="particle in store.settings.selectedParticles" :key="particle">{{
            particle
          }}</span>
          <p v-if="!store.settings.selectedParticles.length">尚未選擇助詞</p>
        </div>
        <div class="mode-pill">
          <q-icon :name="store.mode.icon" size="19px" />{{ store.mode.label }}
        </div>
      </section>
      <div class="start-area">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="play_arrow"
          label="開始"
          class="primary-button start-button"
          :disable="!!store.issue"
          :aria-describedby="store.issue ? 'start-hint' : undefined"
          @click="startNotice = true"
        />
        <p id="start-hint" class="start-hint" role="status">
          {{ store.issue || (startNotice ? '練習即將開放，先選好你想練的內容。' : '') }}
        </p>
      </div>
    </main>
    <footer class="home-footer">
      <q-btn flat no-caps class="tune-button" aria-label="練習設定" @click="practiceOpen = true"
        ><q-icon name="tune" size="27px" /><span>練習設定</span></q-btn
      >
      <p v-if="store.storageUnavailable" class="inline-hint" role="status">
        目前無法儲存設定，重新開啟後可能不會保留。
      </p>
    </footer>
    <PracticeSettings v-model="practiceOpen" /><AppSettings v-model="appOpen" />
  </q-page>
</template>
