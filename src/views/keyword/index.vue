<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
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
	ElMessageBox.confirm(
		'确定删除吗?',
		'提示',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}
	)
		.then(async () => {
			await del(id)
			tableData.value.splice(index, 1)
		})
		.catch(() => {
		})
}

interface RuleForm {
  name: string
  textAll: String,
  id: String,
  level: number
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  textAll: '',
  id: "",
  level: 99
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入名称', trigger: 'change' },
  ],
  textAll: [
    { required: true, message: '请输入内容', trigger: 'change' },
  ],
  level: [
    { required: true, message: '请输入序号', trigger: 'change' },
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
        ruleForm.level = 99

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
            message: res.data? '操作成功': '操作失败',
            type: res.data? 'success':'error',
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
  <h2 style="font-size: 30px; font-weight: bold; text-align: center;">关键词</h2>
  <div class="p-4">
    <el-form inline  ref="queryForm" class="demo-form-inline">
        <el-form-item>
          <el-button  type="primary" @click="dialogVisible = true, resetForm(ruleFormRef)">
            添加关键词
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click='$router.push("model")'>模型</el-button>
          <el-button @click='$router.push("config")'>配置</el-button>
        </el-form-item>
    </el-form>

  <el-table :data="tableData" style="width: 100%" max-height="100vh">
    <el-table-column prop="name" label="名称" />
    <el-table-column fixed="right" prop="createTime" label="时间" />

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
</div>

  <el-dialog
		v-if="dialogVisible"
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
