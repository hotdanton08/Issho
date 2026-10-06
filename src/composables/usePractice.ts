import { computed, ref } from 'vue';
import type { PracticeSession } from '../types/practice';
import type { Particle, Settings } from '../types/settings';
import { createSession, sessionScore, submitAnswer } from '../services/practice';

export function usePractice() {
  const session = ref<PracticeSession | null>(null);
  const index = ref(0);
  const question = computed(() => session.value?.questions[index.value]);
  const feedback = computed(() => session.value?.answers[index.value]);
  const finished = computed(
    () => !!session.value && index.value === session.value.questions.length,
  );
  const score = computed(() => (session.value ? sessionScore(session.value) : 0));
  const progress = computed(() =>
    session.value ? session.value.answers.length / session.value.questions.length : 0,
  );
  function start(settings: Settings) {
    session.value = createSession(settings);
    index.value = 0;
  }
  function answer(particle: Particle) {
    if (session.value && !feedback.value && !finished.value) submitAnswer(session.value, particle);
  }
  function next() {
    if (feedback.value) index.value++;
  }
  function leave() {
    session.value = null;
    index.value = 0;
  }
  return {
    session,
    index,
    question,
    feedback,
    finished,
    score,
    progress,
    start,
    answer,
    next,
    leave,
  };
}
