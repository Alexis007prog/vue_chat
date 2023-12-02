<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { UserAvatar } from '@/components/common'

const Setting = defineAsyncComponent(
  () => import('@/components/common/Setting/index.vue'),
)

const show = ref(false)
</script>

<template>
  <footer
    class="flex items-center justify-between min-w-0 overflow-hidden dark:border-neutral-800"
  >
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar>
        <template #setting>
          <img src="@/assets/1.png" alt="" class="setting" @click="show = true">
        </template>
      </UserAvatar>
    </div>

    <Setting v-if="show" v-model:visible="show" />
  </footer>
</template>

<style lang="less" scoped>
footer{
  position: absolute;
  bottom: 7vh;
  padding: 10px 60px 0 20px;
}
.setting {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
