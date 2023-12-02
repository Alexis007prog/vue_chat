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
