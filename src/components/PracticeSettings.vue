<script setup lang="ts">
import SettingsPanel from './SettingsPanel.vue';
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { MODES, PARTICLES } from '../types/settings';
const open = defineModel<boolean>({ required: true });
const store = useSettingsStore();
const lessonsOpen = ref(true);
const particlesOpen = ref(false);
function toggleAllLessons() {
  lessonsOpen.value = true;
  store.toggleAllLessons();
}
function toggleAllParticles() {
  particlesOpen.value = true;
  store.toggleAllParticles();
}
</script>
<template>
  <SettingsPanel v-model="open" title="練習設定" hide-title>
    <div class="settings-section bulk-selection-section">
      <q-expansion-item
        v-model="lessonsOpen"
        label="範圍"
        :caption="store.lessonLabel"
        icon="auto_stories"
        header-class="section-header"
      >
        <div class="lesson-grid" aria-label="課程多選">
          <q-btn
            v-for="lesson in 25"
            :key="lesson"
            round
            unelevated
            class="lesson-button selection-button"
            :class="{ selected: store.settings.selectedLessons.includes(lesson) }"
            :aria-label="`第 ${lesson} 課`"
            :aria-pressed="store.settings.selectedLessons.includes(lesson)"
            @click="store.toggleLesson(lesson)"
          >
            {{ lesson
            }}<q-icon
              v-if="store.settings.selectedLessons.includes(lesson)"
              name="check"
              class="selection-check"
            />
          </q-btn>
        </div>
      </q-expansion-item>
      <q-btn
        unelevated
        class="select-all-button"
        :class="{ selected: store.allLessonsSelected }"
        no-caps
        :label="store.allLessonsSelected ? '清空' : '全選'"
        :aria-pressed="store.allLessonsSelected"
        :aria-label="store.allLessonsSelected ? '取消全選課程' : '全選課程'"
        @click="toggleAllLessons"
      />
    </div>
    <div class="settings-section bulk-selection-section">
      <q-expansion-item
        v-model="particlesOpen"
        label="助詞"
        :caption="store.particleLabel"
        icon="translate"
        header-class="section-header"
      >
        <div class="particle-grid" aria-label="助詞多選">
          <q-btn
            v-for="particle in PARTICLES"
            :key="particle"
            unelevated
            no-caps
            class="particle-button selection-button"
            :class="{ selected: store.settings.selectedParticles.includes(particle) }"
            :aria-label="particle"
            :aria-pressed="store.settings.selectedParticles.includes(particle)"
            @click="store.toggleParticle(particle)"
          >
            <span lang="ja">{{ particle }}</span
            ><q-icon
              v-if="store.settings.selectedParticles.includes(particle)"
              name="check"
              class="selection-check"
            />
          </q-btn>
        </div>
      </q-expansion-item>
      <q-btn
        unelevated
        class="select-all-button"
        :class="{ selected: store.allParticlesSelected }"
        no-caps
        :label="store.allParticlesSelected ? '清空' : '全選'"
        :aria-pressed="store.allParticlesSelected"
        :aria-label="store.allParticlesSelected ? '取消全選助詞' : '全選助詞'"
        @click="toggleAllParticles"
      />
    </div>
    <q-expansion-item
      label="模式"
      :caption="store.mode.label"
      icon="widgets"
      header-class="section-header"
      class="settings-section"
    >
      <div class="mode-grid" aria-label="練習模式">
        <q-btn
          v-for="mode in MODES"
          :key="mode.value"
          unelevated
          no-caps
          class="mode-button selection-button"
          :class="{ selected: store.settings.practiceMode === mode.value }"
          :aria-pressed="store.settings.practiceMode === mode.value"
          @click="store.settings.practiceMode = mode.value"
        >
          <q-icon :name="mode.icon" size="24px" /><span>{{ mode.label }}</span
          ><q-icon
            v-if="store.settings.practiceMode === mode.value"
            name="check"
            class="selection-check"
          />
        </q-btn>
      </div>
    </q-expansion-item>
    <template #feedback
      ><p v-if="store.issue" class="inline-hint" role="status">{{ store.issue }}</p></template
    >
  </SettingsPanel>
</template>
