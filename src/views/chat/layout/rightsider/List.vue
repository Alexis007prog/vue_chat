<script setup lang="ts">
import { computed } from 'vue'
import { NInput, NPopconfirm, NScrollbar } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { debounce } from '@/utils/functions/debounce'

const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = useChatStore()

const dataSources = computed(() => chatStore.history)

async function handleSelect({ uuid }: Chat.History) {
  if (isActive(uuid))
    return

  if (chatStore.active)
    chatStore.updateHistory(chatStore.active, { isEdit: false })
  await chatStore.setActive(uuid)

  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleEdit({ uuid }: Chat.History, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  chatStore.updateHistory(uuid, { isEdit })
}

function handleDelete(index: number) {
  // event?.stopPropagation()
  chatStore.deleteHistory(index)
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

const handleDeleteDebounce = debounce(handleDelete, 600)

function handleEnter({ uuid }: Chat.History, isEdit: boolean, event: KeyboardEvent) {
  event?.stopPropagation()
  if (event.key === 'Enter')
    chatStore.updateHistory(uuid, { isEdit })
}

function isActive(uuid: number) {
  return chatStore.active === uuid
}
</script>

<template>
  <NScrollbar class="px-10">
    <div class="flex flex-col gap-4 text-sm">
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t("common.noData") }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) of dataSources" :key="index">
          <a
            class="relative flex items-center gap-4 px-6 break-all cursor-pointer item"
            :class="isActive(item.uuid) && ['active']"
            @click="handleSelect(item)"
          >
            <div
              class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap"
            >
              <NInput
                v-if="item.isEdit"
                v-model:value="item.title"
                size="tiny"
                @keypress="handleEnter(item, false, $event)"
              />
              <span v-else class="title">{{ item.title }}</span>
            </div>
            <div v-if="isActive(item.uuid)" class="absolute z-10 flex visible right-6">
              <template v-if="item.isEdit">
                <button class="p-1" @click="handleEdit(item, false, $event)">
                  <SvgIcon icon="ri:save-line" :style="{ fontSize: '23px' }" />
                </button>
              </template>
              <template v-else>
                <NPopconfirm
                  placement="bottom"
                  @positive-click="handleDeleteDebounce(index, $event)"
                >
                  <template #trigger>
                    <button class="p-1">
                      <img
                        src="@/assets/19.png"
                        alt=""
                        @click="handleEdit(item, true, $event)"
                      >
                    </button>
                  </template>
                  {{ $t("chat.deleteHistoryConfirm") }}
                </NPopconfirm>
                <button class="p-1 ml-2">
                  <img
                    src="@/assets/18.png"
                    alt=""
                    @click="handleDelete(item)"
                  >
                </button>
              </template>
            </div>
          </a>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>

<style lang="less" scoped>
::v-deep .n-input {
  height: 40px;
  background-color: #00000000;
  input {
    height: 40px;
  }
}
img {
  width: 23px;
  height: 23px;
  cursor: pointer;
}
.item {
  height: 68px;
  border-radius: 15px;
  background-color: #e8effc;
  border: 2px solid #e8effc;
  &.active {
    border: 2px solid #96b0f3;
  }
}
.title {
  font-size: 15px;
  font-weight: 500;
}
</style>
