<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NLayoutSider, useDialog } from 'naive-ui'
import List from './List.vue'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
// import { reactive } from 'vue'

const appStore = useAppStore()
const chatStore = useChatStore()

const dialog = useDialog()

const { isMobile } = useBasicLayout()
const show = ref(false)

const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function handleClearAll() {
  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.clearHistoryConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearHistory()
      if (isMobile.value)
        appStore.setSiderCollapsed(true)
    },
  })
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)

// ref绑定初始值
const ids = ref([])

const menuSelect = function (data: any) {
  // 通过value传给子组件
  ids.value = data
  console.log('子组件传过来值了', ids)
}
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="394"
    collapse-mode="transform"
    position="static"
    bordered
    :style="getMobileClass"
    :show-trigger="false"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4 mb-2">
          <div class="add-btn" @click="handleAdd">
            <img
              src="@/assets/7.png"
              alt=""
              style="width: 30px; height: 30px; margin-right: 20px"
            >
            <div>
              {{ $t("chat.newChatButton") }}
            </div>
          </div>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List :ids="ids" />
        </div>
      </main>
    </div>
  </NLayoutSider>
  <!-- <PromptStoreRight v-model:visible="show" /> -->
</template>

<style lang="less" scoped>
::v-deep .n-layout-sider-scroll-container {
  background-image: url(@/assets/13.png);
  background-size: 100% 100%;
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
}
</style>
