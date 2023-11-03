<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { del, lists, update, save, findById } from '@/api/model'
const dialogVisible = ref(false)

const tableData = ref([])
const parents = ref([])

onMounted(()=> {
    getList()
})

async function getList() {
    const { data } = await lists()
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
  indexId: String
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  textPice: '',
  id: "",
  indexId: "",
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入名称', trigger: 'change' },
  ],
  textPice: [
    { required: true, message: '请输入内容', trigger: 'change' },
  ],
})

const editeRow = (id: String) => {
//   ruleForm.name = '名称'
//   ruleForm.textPice = '内容'
//   console.log(id)
    findById(id).then(res=>{
        const { data } = res
        ruleForm.textPice = data.textPice
        ruleForm.name = data.name
        ruleForm.id = data.id
        ruleForm.indexId = data.indexId
        parents.value = data.parents
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl)
    return

    ruleForm.textPice = ""
        ruleForm.name = ""
        ruleForm.id = ""
        ruleForm.indexId = ""
        parents.value = tableData.value
  formEl.resetFields()
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
</script>

<template>
  <el-button class="mt-4" style="width: 100%" @click="dialogVisible = true, resetForm(ruleFormRef)">
    添加模型
  </el-button>
  <el-table :data="tableData" style="width: 100%" max-height="250">
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
    width="30%"
  >
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="70px">
      <el-form-item label="上级模型">
        <el-cascader v-model="ruleForm.indexId" placeholder="请选择上级模型"
         :options="tableData"
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
        <el-input v-model="ruleForm.textPice" type="textarea" />
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
