<script lang="ts" setup>
import { ref, watch, defineEmits } from 'vue'
import { useDialog } from 'naive-ui'
import Footer from './Footer.vue'
import { useStore } from '@/store/storeP.js'
import { listByPart } from '@/api'
import { t } from '@/locales'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import SvgIcon from '@/components/common/SvgIcon/index.vue'
// import { reactive } from 'vue'

const appStore = useAppStore()
const chatStore = useChatStore()

const dialog = useDialog()
const { isMobile } = useBasicLayout()

function handleClearAll() {
  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.clearHistoryConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearHistory()
      if (isMobile.value)
        appStore.setSiderCollapsed(true)
    },
  })
}
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
  name: string
  id: string
  hierarchy: number
  children: Tree
}

function delTree(data) {
  if (data.children) {
    for (const i in data.children) {
      store.checkArr.splice(
        store.checkArr.findIndex(item => item.id === data.children[i].id),
        1,
      )
      if (data.children[i].children)
        delTree(data.children[i])
    }
  }
}

function handleCheckChange(data: Tree, checked: boolean, indeterminate: boolean) {
  if (data.children) {
    // console.log(permListRef.value.getCurrentKey(data.id))
    defaultExpandedArr.value = [data.id]
  }
  // console.log(data, indeterminate, 99999)
  if (store.synchronization)
    return
  // console.log(data, checked)
  // if(data.children && checked){
  //   delTree(data)
  // }
  if (data.hierarchy == 1)
    return

  const checkArr: any[] = JSON.parse(JSON.stringify(store.checkArr))
  if (checked) {
    checkArr.push(data)
  }
  else {
    checkArr.splice(
      checkArr.findIndex(item => item.id === data.id),
      1,
    )
  }
  store.TEXT_UPDATE(checkArr)
}

const emits = defineEmits<{
    (e: 'showClick', show: Boolean): void
}>()
function showClick(){
  emits('showClick', true)
}

// onMounted(() => {
//   permListRef.value.setCheckedNodes()
// })
watch(
  () => store.$state.synchronization,
  (newCheckArr, oldCheckArr) => {
    // 处理 checkArrReturn 的变化
    // console.log(newCheckArr)
    if (newCheckArr) {
      console.log(store.checkArr, 1111111)
      const checkArr: any[] = JSON.parse(JSON.stringify(store.checkArr))

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

<!-- 树形结构 -->
<template>
  <div class="left-dom">
    <div class="header">
      <img src="@/assets/10.png" alt="">
    </div>
    <el-tree
      ref="permListRef"
      node-key="id"
      :data="dataArr"
      :props="defaultProps"
      :default-expanded-keys="defaultExpandedArr"
      show-checkbox
      @check-change="handleCheckChange"
    />
    <div class="bottom">
      <main class="flex flex-col flex-1 min-h-0 siderButton" @click="showClick">
        <div>
          <div class="mr-4 ml-3">
            {{ $t("store.siderButton") }}
          </div>
          <SvgIcon icon="ep:circle-close-filled" :style="{ fontSize: '30px' }" />
        </div>
      </main>
      <Footer />
    </div>
  </div>
</template>

<style scoped lang="less">
.left-dom {
  position: relative;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  border-radius: 20px;
  overflow: hidden;
  .header {
    background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 0255, 0),
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 1)
      ),
      url(@/assets/17.png);
    height: 327px;
    width: 100%;
    background-size: 100% 100%;
    padding-top: 45px;
    padding-left: 15px;
    img {
      width: 183px;
      height: 35px;
    }
  }
  .el-tree {
    position: absolute;
    height: 53vh;
    overflow: hidden;
    overflow-y: scroll;
    background-color: #00000000;
    top: 0;
    bottom: 0;
    margin: 15vh auto 0;
    width: 100%;
    ::v-deep .el-tree-node__content {
      background-color: #00000000 !important;
      // z-index: 9999;
      position: relative;
      .el-checkbox__inner {
        z-index: 9999;
      }
    }
  }
  .bottom {
    background-image: linear-gradient(to top, #d1dfff, #d1dfff00);
    background-size: 100% 100%;
    height: 600px;
    width: 100%;
    // z-index: 999;
    .siderButton {
      position: absolute;
      margin-left: 10px;
      bottom: 20vh;
      & > div {
        background-image: url(@/assets/16.png);
        background-size: 100% 100%;
        width: 280px;
        height: 80px;
        color: #ffffff;
        font-size: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 12px;
      }
    }
  }
}
</style>
