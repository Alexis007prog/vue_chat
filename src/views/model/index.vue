<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { del, editLists, lists, update, save, findById, ListExpectSelf } from '@/api/model'
import { listByPart } from '@/api'
const dialogVisible = ref(false)

const tableData = ref([])
const parents = ref([])

onMounted(()=> {
    getList()
})

async function getList() {
    const { data } = await listByPart()
    tableData.value = data
}

const deleteRow = async (index: number, id: String) => {
  await del(id)
  tableData.value.splice(index, 1)
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
  console.log(12313)
}

function rest(){
  console.log(231211)
  
}

</script>

<template>
  <el-form inline :model="query" ref="queryForm" class="demo-form-inline" v-if="showSearch">
      <el-form-item label="名称">
          <el-input v-model="query.keyword"></el-input>
      </el-form-item>
      <el-form-item>
          <el-button icon="el-icon-search" type="primary" @click='search()'>搜索</el-button>
          <el-button @click='rest()'>重置</el-button>
      </el-form-item>
  </el-form>
  <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
          <el-button type="primary" plain size="mini" 
          @click="dialogVisible = true, resetForm(ruleFormRef)"
             >添加模型</el-button>
      </el-col>
  </el-row>
  <el-table :data="tableData" style="width: 100%" max-height="100vh"
  :tree-props="{ children: 'children'}"
>
    <el-table-column fixed prop="createTime" label="时间" />
    <el-table-column prop="name" label="名称" />
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="dialogVisible = true, editeRow(scope.row.id)"
        >
          修改
        </el-button>
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="deleteRow(scope.$index, scope.row.id)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
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
</style>