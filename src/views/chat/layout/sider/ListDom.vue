<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useStore } from '@/store/storeP.js'
import { listByPart } from '@/api'
const defaultProps = {
  children: 'children',
  label: 'name',
  disabled: 'disabled',
}

const dataArr = ref([])

async function geiTree() {
  const data = await listByPart()
  dataArr.value = data.data
}
const leafNodes = ref([])
const permListRef = ref(null)

const store = useStore()

function handleCheck(checkedNodes: any) {
  leafNodes.value = []
  const permNodes = permListRef.value.getCheckedNodes()
  permNodes.forEach((item) => {
    if (!item.children?.length)
      leafNodes.value.push(item)
  })
  store.TEXT_UPDATE(leafNodes)
}
// onMounted(() => {
//   permListRef.value.setCheckedNodes()
// })
watch(
  () => store.$state.synchronization,
  (newCheckArr, oldCheckArr) => {
    // 处理 checkArrReturn 的变化
    permListRef.value.setCheckedNodes(newCheckArr)
  },
  { deep: true },
)
</script>
<!--树形结构-->
<template>
  <div>
    <el-tree
      ref="permListRef"
      node-key="id"
      :data="dataArr"
      :props="defaultProps"
      show-checkbox
      @check="handleCheck"
    />
  </div>
</template>
