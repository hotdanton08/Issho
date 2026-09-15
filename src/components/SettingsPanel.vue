<script setup lang="ts">
defineProps<{ title: string; hideTitle?: boolean }>();
const open = defineModel<boolean>({ required: true });
</script>
<template>
  <q-dialog v-model="open" position="bottom" :aria-label="title">
    <q-card class="settings-panel">
      <header class="panel-header">
        <h2 v-if="!hideTitle">{{ title }}</h2>
        <q-btn flat round icon="close" aria-label="關閉設定" class="icon-button" v-close-popup />
      </header>
      <div class="panel-content"><slot /></div>
      <footer class="panel-footer">
        <slot name="feedback" /><q-btn
          unelevated
          no-caps
          color="primary"
          label="完成"
          class="primary-button"
          v-close-popup
        />
      </footer>
    </q-card>
  </q-dialog>
</template>
