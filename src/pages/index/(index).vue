<script setup lang="ts">
import { ref } from 'vue';
import PracticeSettings from '../../components/PracticeSettings.vue';
import AppSettings from '../../components/AppSettings.vue';
import { useSettingsStore } from '../../stores/settings';
const store = useSettingsStore();
const practiceOpen = ref(false);
const appOpen = ref(false);
</script>
<template>
  <q-page class="home-page">
    <header class="home-header">
      <div class="brand">
        <span class="brand-mark" lang="ja">いっしょ</span>
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
        <div
          class="lesson-emblem"
          :class="{ 'multiple-lessons': store.settings.selectedLessons.length !== 1 }"
        >
          <template v-if="store.settings.selectedLessons.length === 1">
            <h1 :aria-label="store.lessonLabel">{{ store.settings.selectedLessons[0] }}</h1>
          </template>
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
        />
        <p v-if="store.issue" id="start-hint" class="start-hint" role="status">
          {{ store.issue }}
        </p>
      </div>
    </main>
    <footer class="home-footer">
      <q-btn flat no-caps class="tune-button" aria-label="練習設定" @click="practiceOpen = true"
        ><q-icon name="tune" size="27px"
      /></q-btn>
      <p v-if="store.storageUnavailable" class="inline-hint" role="status">
        目前無法儲存設定，重新開啟後可能不會保留。
      </p>
    </footer>
    <PracticeSettings v-model="practiceOpen" /><AppSettings v-model="appOpen" />
  </q-page>
</template>
