<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { NModal } from 'naive-ui'
import { indexPromptlist } from '@/api/index'
import { useStore } from '@/store/storeP.ts'
const store = useStore()

interface Props {
  visible: boolean
}

// interface Emit {
//     (e: 'update:visible', visible: boolean): void
// }

const props = defineProps<Props>()

const emit = defineEmits(['update:visible', 'menuSelect'])

const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const keyword = ref<any>({})
geiTree()
async function geiTree() {
  const data = await indexPromptlist()
  checkArr.value = data.data
}
function promptClick(data: any){
  keyword.value = data
  store.SET_KEYWORD(data)
  emit('update:visible', false)
}

watch(
  () => store.$state.keyword,
  (newKeyword, oldKeyword) => {
    // 处理 checkArrReturn 的变化
    keyword.value = newKeyword
  },
  { deep: true },
)

const pattern = ref('')
const showIrrelevantNodes = ref(false)

let checkedMenu: boolean | never[] = []

function checkedChange(e: any) {
  checkedMenu = e
}

function confirmMenu() {
  emit('update:visible', false)
  emit('menuSelect', checkedMenu)
}
const checkArr = ref([{
  id: 'sdasdadasd',
  parentId: '',
  name: '测试',
  textAll: 'dasdasda',
  create_time: null,
}])
</script>
<style scoped>
.el-tag{
  cursor: pointer;
}

</style>
<template>
  <NModal v-model:show="show" style="width: 90%; max-width: 900px;" preset="card">
    <!-- <NInput v-model:value="pattern" placeholder="搜索菜单" /> -->
    <!-- <n-switch v-model:value="showIrrelevantNodes">
            <template #checked>
                展示搜索无关的节点
            </template>
            <template #unchecked>
                隐藏搜索无关的节点
            </template>
        </n-switch> -->
    <!-- <NTree
      :show-irrelevant-nodes="showIrrelevantNodes" :pattern="pattern" :data="data" block-line checkable
      :on-update:checked-keys="checkedChange"
    /> -->
    <!-- <NButton type="primary" style="margin-top: 80px;" @click="confirmMenu">
      确定
    </NButton> -->

    <el-tag v-for="item in checkArr" 
      :key="item.id" 
      style="margin-left:10px"
      :effect="item.id == keyword.id? 'dark': 'light'"
      @click="promptClick(item)"
      >
      {{ item.name }}
    </el-tag>
  </NModal>
</template>
