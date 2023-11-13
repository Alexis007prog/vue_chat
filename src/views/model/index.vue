<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode'
import type {
  AllowDropType,
  NodeDropType,
} from 'element-plus/es/components/tree/src/tree.type'

import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

import { del, editLists, search as listByPart, update, save, findById, ListExpectSelf, orderByOperate} from '@/api/model'
const dialogVisible = ref(false)

const tableData = ref([])
const parents = ref([])

const query = reactive({
  name: '',
})

const defaultProps = {
  children: 'children',
  label: 'name',
  disabled: 'disabled',
}


onMounted(()=> {
    getList()
})


async function getList() {
    const { data } = await listByPart(query)
    tableData.value = data
}
interface Tree {
  id: number
  name: string
  children?: Tree[]
}

const deleteRow = (node: Node, data: Tree) => {
  

  del(data.id).then(res=>{
    const parent = node.parent
    const children: Tree[] = parent.data.children || parent.data
    const index = children.findIndex((d) => d.id === data.id)
    children.splice(index, 1)
    tableData.value = [...tableData.value]
  })
}

interface RuleForm {
  name: string
  textPice: String,
  id: String,
  indexId: String,
  level: number
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  textPice: '',
  id: "",
  indexId: "",
  level: 99
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入名称', trigger: 'change' },
  ],
  textPice: [
    { required: true, message: '请输入内容', trigger: 'change' },
  ],
  level: [
    { required: true, message: '请输入序号', trigger: 'change' },
  ],
})

const editeRow = (id: String) => {
//   ruleForm.name = '名称'
//   ruleForm.textPice = '内容'
//   console.log(id)
    findById(id).then(async res=>{
        const { data } = res
        ruleForm.textPice = data.textPice
        ruleForm.name = data.name
        ruleForm.id = data.id
        ruleForm.indexId = data.indexId

        let sdata = await ListExpectSelf(id)
        parents.value = sdata.data
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
  
    ruleForm.textPice = ""
        ruleForm.name = ""
        ruleForm.id = ""
        ruleForm.indexId = ""
        ruleForm.level = 99
        editLists().then(res=>{
          parents.value = res.data

        })

}

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl)
    return
  formEl.validate((valid) => {
    if (valid) {
      console.log('submit!')

     
      if(ruleForm.indexId){
        ruleForm.indexId = ruleForm.indexId[ruleForm.indexId.length - 1]
      }

      let api = ruleForm.id? update(ruleForm): save(ruleForm)
      
      api.then(res=>{
        dialogVisible.value = false
        ElMessage({
            message: res? '操作成功': '操作失败',
            type: res? 'success':'error',
        })
        getList()
      })
    }
    else {
      console.log('error submit!')
      return false
    }
  })
}

function search(){
  getList()
}

function rest(){
  query.name = ""
  getList()
}

const handleDragStart = (node: Node, ev: DragEvents) => {
  // console.log('drag start', node)
}

const handleDragEnter = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  // console.log('tree drag enter:', dropNode.name)
}
const handleDragLeave = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  // console.log('tree drag leave:', dropNode.name)
}
const handleDragOver = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
  // console.log('tree drag over:', dropNode.name)
}
const handleDragEnd = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  let data = {
    id: draggingNode.data.id,
  }
  
  if(dropType == 'inner'){
    data.indexId = dropNode.data.id|| dropNode.data.indexId 
    data.type = 0
    data.nextId = ""
  }else{

    data.indexId = dropNode.data.indexId
    data.nextId = dropNode.data.id
    
    if(dropType == 'after'){
      data.type = 1
    }else{
      data.type = 0
    }
  }
  
  console.log(draggingNode.data.id)
  console.log(dropNode.data)
  console.log(dropType)
  orderByOperate(data).then(res=>{
    ElMessage({
          message: res? '操作成功': '操作失败',
          type: res? 'success':'error',
      })
    if(!res){
      getList()
    }
  })
  console.log("data", data)
}
const handleDrop = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  // console.log('tree drop:', dropNode.name, dropType)
}

</script>

<template>
  <div class="p-4">
    <el-form inline :model="query" ref="queryForm" class="demo-form-inline">
      <el-form-item label="名称">
          <el-input v-model="query.name"></el-input>
      </el-form-item>
      <el-form-item>
          <el-button type="primary" @click='search()'>搜索</el-button>
          <el-button @click='rest()'>重置</el-button>
      </el-form-item>
  </el-form>
  <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
          <el-button type="primary" plain 
          @click="dialogVisible = true, resetForm(ruleFormRef)"
             >添加模型</el-button>
      </el-col>
  </el-row>
  <el-tree
    :data="tableData"
    draggable
    node-key="id"
    :props="defaultProps"
    @node-drag-start="handleDragStart"
    @node-drag-enter="handleDragEnter"
    @node-drag-leave="handleDragLeave"
    @node-drag-over="handleDragOver"
    @node-drag-end="handleDragEnd"
    @node-drop="handleDrop"
  >
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span>
          {{data.id}} --- 
          {{ data.name }}</span>
        <span>
          <el-button
            link
            type="primary"
            size="small"
            @click.prevent="dialogVisible = true, editeRow(data.id)"
          >
            修改
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click.prevent="deleteRow(node, data)"
          >
            删除
          </el-button>
        </span>
      </span>
    </template>
  </el-tree>
  </div>
  
  <el-dialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    title="编辑"
    width="60%"
  >
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="70px">
      <el-form-item label="上级模型">
        <el-cascader v-model="ruleForm.indexId" placeholder="请选择上级模型"
         :options="parents"
         :props="{
            label: 'name',
            value: 'id',
            checkStrictly: true,
        }" 
        size="large"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="ruleForm.name" />
      </el-form-item>
      <el-form-item label="内容" prop="textPice">
        <el-input v-model="ruleForm.textPice" rows="10" type="textarea" />
      </el-form-item>
      <el-form-item label="排序" prop="level">
        <el-input v-model="ruleForm.level" type="number" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false, resetForm(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
.el-cascader{
  width: 100% !important;
}
.custom-tree-node{
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>