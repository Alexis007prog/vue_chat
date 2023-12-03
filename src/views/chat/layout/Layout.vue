<script setup lang="ts">
import { computed, ref } from 'vue'
import { NLayoutContent } from 'naive-ui'
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
const openLeft = ref(true)
const openRight = ref(true)
</script>

<template>
  <div
    class="h-full dark:bg-[#24272e] transition-all w-full overflow-hidden"
    :class="[isMobile ? 'p-0' : 'p-4']"
  >
    <div class="h-full flex w-full" :class="getMobileClass">
      <!-- <NLayout class="z-40 transition" :class="getContainerClassl">

      </NLayout> -->
      <div class="left-box" :class="{ close: !openLeft }">
        <div class="item">
          <Sider />
        </div>
        <div class="arrow" @click="openLeft = !openLeft">
          <img src="@/assets/arrow.png" alt="">
        </div>
      </div>
      <div class="right-box h-full w-full" :class="{ flex: !isMobile && !collapsed }">
        <NLayoutContent class="h-full">
          <RouterView v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </RouterView>
        </NLayoutContent>
        <div class="right-box-sider" :class="{ close: !openRight }">
          <div class="arrow" @click="openRight = !openRight">
            <img src="@/assets/arrow.png" alt="">
          </div>
          <div class="item">
            <RightSider />
          </div>
        </div>
      </div>
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
  background-color: #ffffff;
}
.right-box {
  background-color: #ffffff;
  border-radius: 20px;
  &-sider {
    width: 394px;
    min-width: 394px;
    position: relative;
    transition: 0.3s all;
    transform: rotate(0);
    transition: 0.3s all;
    .arrow {
      left: -10px;
    }
    .item {
      opacity: 1;
      transition: 0.3s all;
    }
    &.close {
      width: 0;
      min-width: 0;
      .item {
        opacity: 0;
      }
      .arrow {
        transform: rotate(180deg);
      }
    }
  }
}
.left-box {
  min-width: 329px;
  width: 329px;
  margin-right: 18px;
  position: relative;
  transition: 0.3s all;
  .arrow {
    right: -10px;
    transform: rotate(180deg);
  }
  .item {
    opacity: 1;
    transition: 0.3s all;
  }
  &.close {
    width: 0;
    min-width: 0;
    margin-right: 0;
    .item {
      opacity: 0;
    }
    .arrow {
      transform: rotate(0);
    }
  }
}
.arrow {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  background-color: #ffffff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 0 5px #999999;
  cursor: pointer;
  z-index: 999;
  img {
    width: 20px;
    height: 20px;
  }
}
</style>
