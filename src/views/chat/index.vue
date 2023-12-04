<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { NAutoComplete, NButton, NInput, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, usePromptStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'
import { useStore } from '@/store/storeP.ts'
let controller = new AbortController()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()

const chatStore = useChatStore()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

const { uuid } = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() =>
  dataSources.value.filter(item => !item.inversion && !!item.conversationOptions),
)

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

// 添加PromptStore
const promptStore = usePromptStore()

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

function handleSubmit() {
  onConversation()
}

async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: message,
    inversion: true,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: null },
  })
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext
    = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: '思考中',
    loading: true,
    inversion: false,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } },
  })
  scrollToBottom()

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        checkArr: store.$state.checkArr,
        model: store.$state.model,
        configId: store.$state.configId,
        promptId: store.$state.keyword.id,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(+uuid, dataSources.value.length - 1, {
              dateTime: new Date().toLocaleString(),
              text: lastText + (data.text ?? ''),
              inversion: false,
              error: false,
              loading: true,
              conversationOptions: {
                conversationId: data.conversationId,
                parentMessageId: data.id,
              },
              requestOptions: { prompt: message, options: { ...options } },
            })

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(+uuid, dataSources.value.length - 1, {
        loading: false,
      })
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(+uuid, dataSources.value.length - 1, {
        text: `${currentChat.text}\n[${errorMessage}]`,
        error: false,
        loading: false,
      })
      return
    }

    updateChat(+uuid, dataSources.value.length - 1, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    })
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(+uuid, index, {
    dateTime: new Date().toLocaleString(),
    text: '',
    inversion: false,
    error: false,
    loading: true,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } },
  })

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        promptId: store.$state.promptId,
        checkArr: store.$state.checkArr,
        model: store.$state.model,
        configId: store.$state.configId,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          console.log(xhr)
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(+uuid, index, {
              dateTime: new Date().toLocaleString(),
              text: lastText + (data.text ?? ''),
              inversion: false,
              error: false,
              loading: true,
              conversationOptions: {
                conversationId: data.conversationId,
                parentMessageId: data.id,
              },
              requestOptions: { prompt: message, options: { ...options } },
            })

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(+uuid, index, {
        loading: false,
      })
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(+uuid, index, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    })
  }
  finally {
    loading.value = false
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(+uuid)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value
      .filter((item: { key: string }) =>
        item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase()),
      )
      .map((obj: { value: any }) => {
        return {
          label: obj.value,
          value: obj.value,
        }
      })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }

  return []
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value) {
    classes = [
      'sticky',
      'left-0',
      'bottom-0',
      'right-0',
      'p-2',
      'pr-3',
      'overflow-hidden',
    ]
  }
  return classes
})

onMounted(() => {
  scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
// 侦听到的数据
const store = useStore()

const keyword = ref({})

// watch(
//   () => store.$state.checkArr,
//   (newCheckArr, oldCheckArr) => {
//     // 处理 checkArrReturn 的变化
//     console.log(newCheckArr)
//     // checkArr.value = newCheckArr
//   },
//   { deep: true },
// )

const checkArr = computed(() => {
  console.log(store.$state.checkArr)
  return store.$state.checkArr
})

watch(
  () => store.$state.keyword,
  (newKeyword, oldKeyword) => {
    // 处理 checkArrReturn 的变化
    keyword.value = newKeyword
  },
  { deep: true },
)

function handleClose(index: number) {
  const checkArr1 = JSON.parse(JSON.stringify(checkArr.value))

  checkArr1.splice(index, 1)

  store.TEXT_SYNCHR(true)
  store.TEXT_UPDATE(checkArr1)
}

function handleKeywordClose(val) {
  store.SET_KEYWORD({})
}
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @handle-clear="handleClear"
    />
    <main
      class="flex-1 overflow-hidden"
      :class="{
        'px-4': !isMobile,
        'pt-3': !isMobile,
      }"
    >
      <div
        :class="{
          msgContent: !isMobile,
        }"
      >
        <div v-if="!isMobile" class="header-box">
          <div>MeSmile Al</div>
          <div v-if="loading" class="tag">
            正在解答中...
          </div>
        </div>
        <div id="scrollRef" ref="scrollRef" class="overflow-hidden overflow-y-auto">
          <div
            id="image-wrapper"
            class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
            :class="[isMobile ? 'p-2' : 'p-4']"
          >
            <template v-if="!dataSources.length">
              <div
                class="flex items-center justify-center mt-4 text-center text-neutral-300"
              >
                <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                <span>Aha~</span>
              </div>
            </template>
            <template v-else>
              <div>
                <Message
                  v-for="(item, index) of dataSources"
                  :key="index"
                  :date-time="item.dateTime"
                  :text="item.text"
                  :inversion="item.inversion"
                  :error="item.error"
                  :loading="item.loading"
                  @regenerate="onRegenerate(index)"
                  @delete="handleDelete(index)"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
    <footer v-if="!isMobile" :class="footerClass" class="footer-box">
      <div v-if="loading" class="sticky bottom-0 left-0 flex justify-center mb-5">
        <NButton type="warning" @click="handleStop">
          <template #icon>
            <SvgIcon icon="ri:stop-circle-line" />
          </template>
          {{ t("common.stopResponding") }}
        </NButton>
      </div>
      <div style="margin-bottom: 10px" class="max-w-screen-xl m-auto">
        <el-tag
          v-for="(tag, index) in checkArr"
          :key="index"
          style="margin-left: 10px"
          class="mx-1"
          closable
          :disable-transitions="false"
          @close="handleClose(index)"
        >
          {{ tag.name }}
        </el-tag>
        <el-tag
          v-if="keyword.id"
          style="margin-left: 10px"
          class="mx-1"
          closable
          :disable-transitions="false"
          @close="handleKeywordClose(keyword)"
        >
          {{ keyword.name }}
        </el-tag>
      </div>
      <div class="w-full max-w-screen-xl m-auto footer">
        <HoverButton v-if="!isMobile" class="mr-2" @click="handleClear">
          <img src="@/assets/21.png" class="icon" alt="">
        </HoverButton>
        <HoverButton v-if="!isMobile" class="mr-2" @click="handleExport">
          <img src="@/assets/23.png" class="icon" alt="">
        </HoverButton>
        <HoverButton class="mr-2" @click="toggleUsingContext">
          <img src="@/assets/22.png" class="icon" alt="">
        </HoverButton>
        <div class="complete">
          <NAutoComplete
            v-model:value="prompt"
            :options="searchOptions"
            :render-label="renderOption"
          >
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
        </div>
        <img
          src="@/assets/24.png"
          class="send"
          :class="{ disabled: buttonDisabled }"
          @click="handleSubmit"
        >
      </div>
    </footer>
    <footer v-else :class="footerClass">
      <div style="margin-left: 150px">
        <el-tag
          v-for="(tag, index) in checkArr"
          :key="index"
          style="margin-left: 10px"
          class="mx-1"
          closable
          :disable-transitions="false"
          @close="handleClose(index)"
        >
          {{ tag.name }}
        </el-tag>
        <el-tag
          v-if="keyword.id"
          style="margin-left: 10px"
          class="mx-1"
          closable
          :disable-transitions="false"
          @close="handleKeywordClose(keyword)"
        >
          {{ keyword.name }}
        </el-tag>
      </div>
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <HoverButton v-if="!isMobile" @click="handleClear">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:delete-bin-line" />
            </span>
          </HoverButton>
          <HoverButton v-if="!isMobile" @click="handleExport">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:download-2-line" />
            </span>
          </HoverButton>
          <HoverButton @click="toggleUsingContext">
            <span
              class="text-xl"
              :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }"
            >
              <SvgIcon icon="ri:chat-history-line" />
            </span>
          </HoverButton>
          <NAutoComplete
            v-model:value="prompt"
            :options="searchOptions"
            :render-label="renderOption"
          >
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.msgContent {
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  background-color: #eff2f7;
  height: 100%;
  display: flex;
  flex-flow: column;
}
.header-box {
  height: 83px;
  background: linear-gradient(-1deg, rgba(24, 94, 255, 0.08), rgba(255, 255, 255, 0));
  font-size: 22px;
  font-family: PingFang SC;
  font-weight: 500;
  color: #333333;
  line-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  .tag {
    padding: 0 18px;
    background: #ffffff;
    border: 1px solid #185eff;
    border-radius: 14px;
    font-size: 14px;
    font-family: PingFang SC;
    font-weight: 500;
    color: #185eff;
    line-height: 27px;
    margin-left: 11px;
  }
}
::v-deep .n-input__placeholder {
  color: rgba(194, 194, 194, 1) !important;
}
::v-deep textarea {
  color: rgb(51, 54, 57) !important;
}
.icon {
  width: 28px;
  height: 28px;
}
.footer-box {
  width: calc(100% - 2rem);
  padding: 27px 51px;
  background: linear-gradient(-1deg, rgba(24, 94, 255, 0.46), #eff2f7, #eff2f7);
  border-radius: 0 0 20px 20px;
  margin: 0 1rem 1rem;

  .footer {
    background-color: #ffffff;
    height: 72px;
    background: #ffffff;
    box-shadow: 0px 6px 9px 0px rgba(190, 209, 251, 0.18);
    display: flex;
    align-items: center;
    padding: 0 21px;
    width: 100%;
    border-radius: 20px;
  }
  ::v-deep .n-auto-complete {
    width: 100%;
  }
  ::v-deep .n-input__border,
  ::v-deep .n-input__state-border {
    display: none !important;
  }
  .complete {
    flex: 1;
    padding-left: 10px;
    border-left: 2px solid #eeeeee;
  }
}
.send {
  margin-top: 15px;
  width: 72px;
  height: 67px;
  cursor: pointer;
  &.disabled {
    opacity: 0.5;
  }
}
</style>
