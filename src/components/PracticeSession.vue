<script setup lang="ts">
import { usePractice } from '../composables/usePractice';
import type { Settings } from '../types/settings';

const props = defineProps<{ settings: Settings }>();
const emit = defineEmits<{ leave: [] }>();
const { session, index, question, feedback, finished, score, progress, start, answer, next } =
  usePractice();
start(props.settings);
function restart() {
  if (session.value) start(session.value.settings);
}
</script>

<template>
  <q-page class="practice-page">
    <header class="practice-header">
      <q-btn
        flat
        round
        icon="close"
        class="icon-button"
        aria-label="離開練習"
        @click="emit('leave')"
      />
      <q-linear-progress
        :value="progress"
        :animation-speed="0"
        rounded
        size="12px"
        color="primary"
        aria-label="練習進度"
      />
    </header>
    <template v-if="!finished && question">
      <main class="question-main">
        <p class="question-count">{{ index + 1 }} / {{ session?.questions.length }}</p>
        <h1>選出適合的助詞</h1>
        <p class="question-sentence" lang="ja">{{ question.example.sentenceWithBlank }}</p>
        <div class="answer-choices" aria-label="答案選項">
          <q-btn
            v-for="particle in question.choices"
            :key="particle"
            unelevated
            no-caps
            class="answer-button"
            :class="{
              'answer-correct': feedback && particle === question.example.particle,
              'answer-wrong': feedback && particle === feedback.answer && !feedback.correct,
            }"
            :disable="!!feedback"
            :label="particle"
            lang="ja"
            @click="answer(particle)"
          />
        </div>
      </main>
      <section
        v-if="feedback"
        class="answer-feedback"
        :class="{ incorrect: !feedback.correct }"
        role="status"
        aria-live="polite"
      >
        <div class="feedback-title">
          <q-icon :name="feedback.correct ? 'check_circle' : 'cancel'" size="26px" />
          <strong>{{ feedback.correct ? '正確！' : '不對' }}</strong>
        </div>
        <p class="feedback-answer">
          {{ feedback.correct ? '' : '正解：'
          }}<span lang="ja">{{ question.example.particle }}</span>
        </p>
        <p class="feedback-usage">{{ question.example.shortExplanation }}</p>
        <q-btn
          unelevated
          no-caps
          color="primary"
          label="繼續"
          class="primary-button"
          @click="next"
        />
      </section>
    </template>
    <main v-else class="completion-main">
      <q-icon name="task_alt" size="84px" color="primary" />
      <h1>完成！</h1>
      <p class="completion-score">
        {{ score }} <span>/ {{ session?.questions.length }}</span>
      </p>
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="play_arrow"
        label="再來一組"
        class="primary-button"
        @click="restart"
      />
      <q-btn flat no-caps label="回首頁" class="completion-home" @click="emit('leave')" />
    </main>
  </q-page>
</template>
