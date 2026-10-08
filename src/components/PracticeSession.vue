<script setup lang="ts">
import { usePractice } from '../composables/usePractice';
import { usePracticeAudio } from '../composables/usePracticeAudio';
import { useAiCopy } from '../composables/useAiCopy';
import { computed } from 'vue';
import type { Settings } from '../types/settings';

const props = defineProps<{ settings: Settings }>();
const emit = defineEmits<{ leave: [] }>();
const { session, index, question, feedback, finished, score, progress, start, answer, next } =
  usePractice();
start(props.settings);
const { speechEnabled, speechSupported, speechError, playEffect, playSentence, stopAudio } =
  usePracticeAudio(() => props.settings);
const { copying, copied, copyError, manualText, copyForAi, resetCopy } = useAiCopy(
  () => session.value,
  () => finished.value,
);
const title = computed(() =>
  question.value?.type === 'usage'
    ? '這個助詞表示什麼？'
    : question.value?.type === 'error'
      ? '這句話的助詞對嗎？'
      : '選出適合的助詞',
);
const sentenceParts = computed(() => question.value?.example.sentenceWithBlank.split('（　）'));
function restart() {
  resetCopy();
  stopAudio();
  if (session.value) start(session.value.settings);
}
function submitChoice(choice: string) {
  if (feedback.value || finished.value) return;
  const result = answer(choice);
  if (result) playEffect(result.correct ? 'correct' : 'incorrect');
}
function advance() {
  if (!feedback.value) return;
  stopAudio();
  next();
  if (finished.value) playEffect('complete');
}
function speakAnswer() {
  if (feedback.value && question.value) playSentence(question.value.example.correctSentence);
}
function selectExport(event: FocusEvent) {
  if (event.target instanceof HTMLTextAreaElement) event.target.select();
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
        <h1>{{ title }}</h1>
        <p class="question-sentence" lang="ja">
          <template v-if="question.type === 'usage'"
            >{{ sentenceParts?.[0]
            }}<mark :aria-label="`助詞 ${question.example.particle}`">{{
              question.example.particle
            }}</mark
            >{{ sentenceParts?.[1] }}</template
          ><template v-else>{{ question.sentence }}</template>
        </p>
        <div
          class="answer-choices"
          :class="{
            'text-choices': question.type === 'usage',
            'error-choices': question.type === 'error',
          }"
          aria-label="答案選項"
        >
          <q-btn
            v-for="particle in question.choices"
            :key="particle"
            unelevated
            no-caps
            class="answer-button"
            :class="{
              'answer-correct': feedback && particle === question.correctAnswer,
              'answer-wrong': feedback && particle === feedback.answer && !feedback.correct,
            }"
            :disable="!!feedback"
            :label="question.type === 'error' ? undefined : particle"
            :icon="
              question.type === 'error'
                ? particle === '沒問題'
                  ? 'radio_button_unchecked'
                  : 'close'
                : undefined
            "
            :aria-label="
              question.type === 'error'
                ? particle === '沒問題'
                  ? '正確句子'
                  : '錯誤句子'
                : particle
            "
            :lang="question.type === 'particle' ? 'ja' : 'zh-Hant'"
            @click="submitChoice(particle)"
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
          <q-btn
            v-if="speechEnabled && speechSupported"
            flat
            round
            icon="volume_up"
            class="speech-button"
            aria-label="播放正確日文句子"
            @click="speakAnswer"
          />
        </div>
        <p class="feedback-answer">
          {{ feedback.correct ? '' : '正解：'
          }}<q-icon
            v-if="question.type === 'error'"
            :name="question.correctAnswer === '沒問題' ? 'radio_button_unchecked' : 'close'"
            size="26px"
            :aria-label="question.correctAnswer === '沒問題' ? '正確句子' : '錯誤句子'"
          /><span v-else :lang="question.type === 'particle' ? 'ja' : 'zh-Hant'">{{
            question.correctAnswer
          }}</span>
        </p>
        <p v-if="question.type === 'error'" class="feedback-correction" lang="ja">
          {{
            question.correctAnswer === '有問題'
              ? `${question.example.wrongVariant?.wrongParticle} → ${question.example.particle}`
              : question.example.particle
          }}
        </p>
        <p v-if="question.type !== 'usage'" class="feedback-usage">
          {{ question.example.shortExplanation }}
        </p>
        <p v-if="speechEnabled && (!speechSupported || speechError)" class="speech-hint">
          {{ speechSupported ? speechError : '此瀏覽器不支援語音播放' }}
        </p>
        <q-btn
          unelevated
          no-caps
          color="primary"
          label="繼續"
          class="primary-button"
          @click="advance"
        />
      </section>
    </template>
    <main v-else class="completion-main">
      <q-icon name="task_alt" class="completion-icon" color="primary" />
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
      <q-btn
        outline
        no-caps
        color="primary"
        :icon="copied ? 'check' : 'content_copy'"
        :label="copied ? '已複製' : '複製給 AI'"
        :loading="copying"
        :disable="copying"
        class="ai-copy-button"
        @click="copyForAi"
      />
      <p v-if="copyError" class="copy-status" role="status" aria-live="polite">
        {{ copyError }}
      </p>
      <textarea
        v-if="manualText"
        :value="manualText"
        readonly
        rows="5"
        class="manual-export"
        aria-label="手動複製練習紀錄"
        @focus="selectExport"
      />
      <q-btn flat no-caps label="回首頁" class="completion-home" @click="emit('leave')" />
    </main>
  </q-page>
</template>
