<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { del, lists, save, update, findById } from '@/api/keyword'
const dialogVisible = ref(false)

const tableData = ref([])

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
  textAll: String,
  id: String
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  textAll: '',
  id: "",
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入名称', trigger: 'change' },
  ],
  textAll: [
    { required: true, message: '请输入内容', trigger: 'change' },
  ],
})

const editeRow = (id: number) => {
    findById(id).then(res=>{
        const { data } = res

        ruleForm.textAll = data.textAll
        ruleForm.name = data.name
        ruleForm.id = data.id
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    ruleForm.textAll = ""
        ruleForm.name = ""
        ruleForm.id = ""
}

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl)
    return
  formEl.validate((valid) => {
    if (valid) {
        let api = ruleForm.id? update(ruleForm): save(ruleForm)
      
      api.then(res=>{
        dialogVisible.value = false
        getList()
        ElMessage({
            message: res? '操作成功': '操作失败',
            type: res? 'success':'error',
        })
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
    添加关键词
  </el-button>
  <el-table :data="tableData" style="width: 100%" max-height="100vh">
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
          @click.prevent="deleteRow(scope.$index)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
    v-model="dialogVisible"
    title="编辑"
    width="60%"
  >
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="70px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="ruleForm.name" />
      </el-form-item>
      <el-form-item label="内容" prop="textAll">
        <el-input v-model="ruleForm.textAll" rows="10" type="textarea" />
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