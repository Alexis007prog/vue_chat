<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useStore } from '@/store/storeP.ts'
import { listByPart } from '@/api/index'
const defaultProps = {
  children: 'children',
  label: 'name',
  disabled: 'disabled',
}
geiTree()
const datas = [
  {
    id: 1,
    label: 'Level one 1',
    children: [
      {
        id: 3,
        label: 'Level two 2-1',
        children: [
          {
            id: 4,
            label: 'Level three 3-1-1',
          },
          {
            id: 5,
            label: 'Level three 3-1-2',
          },
        ],
      },
      {
        id: 2,
        label: 'Level two 2-2',
        children: [
          {
            id: 6,
            label: 'Level three 3-2-1',
          },
          {
            id: 7,
            label: 'Level three 3-2-2',
          },
        ],
      },
    ],
  },
]

const dataArr = ref([])

async function geiTree() {
  const data = await listByPart()
  dataArr.value = data.data
}
const leafNodes = ref([])
const permListRef = ref(null)

const store = useStore()

function handleCheck(checkedNodes) {
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
