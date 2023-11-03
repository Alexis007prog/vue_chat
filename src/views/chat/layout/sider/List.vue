<script setup lang="ts">
import { ref, watch } from 'vue'
// import { useMessage, NMenu } from 'naive-ui'
import { NTree } from 'naive-ui'
import type { TreeOption } from 'naive-ui'

const props = defineProps(['ids'])
// import { defineProps } from 'vue';

const pattern = ref('')
const showIrrelevantNodes = ref(false)

// const message = useMessage();
// function handleUpdateValue(key: string, item: MenuOption) {
//     message.info('[onUpdate:value]: ' + JSON.stringify(key))
//     message.info('[onUpdate:value]: ' + JSON.stringify(item))
// }
const menuOptions: TreeOption[] = [
  {
    label: '0',
    key: '0',
    children: [
      {
        label: '0-0',
        key: '0-0',
        children: [
          { label: '0-0-0', key: '0-0-0' },
          { label: '0-0-1', key: '0-0-1' },
        ],
      },
      {
        label: '0-1',
        key: '0-1',
        children: [
          { label: '0-1-0', key: '0-1-0' },
          { label: '0-1-1', key: '0-1-1' },
        ],
      },
    ],
  },
  {
    label: '1',
    key: '1',
    children: [
      {
        label: '1-0',
        key: '1-0',
        children: [
          { label: '1-0-0', key: '1-0-0' },
          { label: '1-0-1', key: '1-0-1' },
        ],
      },
      {
        label: '1-1',
        key: '1-1',
        children: [
          { label: '1-1-0', key: '1-1-0' },
          { label: '1-1-1', key: '1-1-1' },
        ],
      },
    ],
  },
]

const temp = ref([] as any[])
// let result = null;
function getTreeItem(data: any, key: any) {
  data.map((item: any) => {
    console.log(item.id)
    if (item.key == key) {
      temp.value.push(item)
    }
    else {
      if (item.children)
        getTreeItem(item.children, key)
    }
  })
}
watch(
  () => [...props.ids],
  (newValue, oldValue) => {
    temp.value = []
    newValue.forEach((nItem: any, nIndex: number) => {
      getTreeItem(menuOptions, nItem)
    })
    console.log('赋值完', temp.value)
  },
  {
    immediate: true,
    deep: true,
  },
)

const selectChange = function () {
  console.log('选中菜单变了')
}
</script>

<template>
  <div>
    <!-- <NMenu :options="temp" @update:value="handleUpdateValue" /> -->
    <NTree :show-irrelevant-nodes="showIrrelevantNodes" :pattern="pattern" :data="temp" block-line :on-update:checked-keys="selectChange" />
    <!-- {{ props.ids }} -->
  </div>
</template>
