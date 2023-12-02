<script setup lang="ts">
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import { useRouter } from 'vue-router'
import Sider from './sider/index.vue'
import RightSider from './rightsider/index.vue'
import Permission from './Permission.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useChatStore } from '@/store'

const router = useRouter()
const appStore = useAppStore()
const chatStore = useChatStore()
const authStore = useAuthStore()

router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

const needPermission = computed(() => !!authStore.session?.auth && !authStore.token)

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['dark:border-neutral-800']
})

const getContainerClassl = computed(() => {
  return ['h-full', { 'pl-[349px]': !isMobile.value && !collapsed.value }]
})
const getContainerClassr = computed(() => {
  return ['h-full', { 'pr-[414px]': !isMobile.value && !collapsed.value }]
})
</script>

<template>
  <div
    class="h-full dark:bg-[#24272e] transition-all"
    :class="[isMobile ? 'p-0' : 'p-4']"
  >
    <div class="h-full overflow-hidden flex w-full" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClassl">
        <Sider />
        <div class="h-full" :class="{ flex: !isMobile && !collapsed }">
          <NLayoutContent class="h-full">
            <RouterView v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </RouterView>
          </NLayoutContent>
          <RightSider />
        </div>
      </NLayout>
    </div>
    <Permission :visible="needPermission" />
  </div>
</template>

<style lang="less" scoped>
::v-deep.n-layout {
  background-color: #00000000;
}
::v-deep .n-layout-scroll-container {
  border-radius: 20px;
  overflow: hidden;
  background-color: #ffffff;
}
</style>
