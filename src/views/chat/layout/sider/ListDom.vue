<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { useStore } from '@/store/storeP.js'
import { listByPart } from '@/api'
const defaultProps = {
  children: 'children',
  label: 'name',
  disabled: 'disabled',
}

const dataArr = ref([])
const defaultExpandedArr = ref([])
geiTree()
async function geiTree() {
  const data = await listByPart()
  dataArr.value = data.data
}

const permListRef = ref(null)

const store = useStore()

interface Tree {
  name: string,
  id: string,
  hierarchy: number,
  children: Tree
}

function delTree(data){
  if(data.children){
    for(let i in data.children){
      store.checkArr.splice(store.checkArr.findIndex(item => item.id === data.children[i].id), 1)
      if(data.children[i].children){
        delTree(data.children[i])
      }
    }
  }
}

function handleCheckChange(
  data: Tree,
  checked: boolean,
  indeterminate: boolean
  )
{
  if(data.children){
    // console.log(permListRef.value.getCurrentKey(data.id))
    defaultExpandedArr.value = [ data.id ]
  }
  // console.log(data, indeterminate, 99999)
  if(store.synchronization) return
  // console.log(data, checked)
  // if(data.children && checked){
  //   delTree(data)
  // }
  if(data.hierarchy == 1) return

  let checkArr: any[] = JSON.parse(JSON.stringify(store.checkArr))
  if(checked){
    checkArr.push(data)
  }else{
    checkArr.splice(checkArr.findIndex(item => item.id === data.id), 1)
  }
  store.TEXT_UPDATE(checkArr)


}

// onMounted(() => {
//   permListRef.value.setCheckedNodes()
// })
watch(
  () => store.$state.synchronization,
  (newCheckArr, oldCheckArr) => {
    // 处理 checkArrReturn 的变化
    // console.log(newCheckArr)
    if(newCheckArr){
      console.log(store.checkArr, 1111111)
      let checkArr: any[] = JSON.parse(JSON.stringify(store.checkArr))

      permListRef.value.setCheckedNodes([])
      setTimeout(() => {
        permListRef.value.setCheckedKeys(Array.from(checkArr, ({ id }) => id))
      }, 100)
      store.TEXT_SYNCHR(false)
      
    }

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
      :default-expanded-keys="defaultExpandedArr"
      show-checkbox
      @check-change="handleCheckChange"
    />
  </div>
</template>

<style scoped>
.el-tree{
  height: 76vh;
    overflow: hidden;
    overflow-y: scroll;
}
</style>