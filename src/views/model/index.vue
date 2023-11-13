<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import Sortable from 'sortablejs';

import type { FormInstance, FormRules, ElMessage } from 'element-plus'
import { del, editLists, search as listByPart, update, save, findById, ListExpectSelf } from '@/api/model'
const dialogVisible = ref(false)

const tableData = ref([])
const parents = ref([])

const query = reactive({
  name: '',
})

onMounted(()=> {
    getList()
    rowDrop()
})

// 表格行拖拽
const rowDrop = () => {
  let tbody = document.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
    group: {
      name: "words",
      pull: true,
      put: true,
    },
    animation: 150, // ms, number 单位：ms，定义排序动画的时间
    onAdd: function (evt: any) {
      // 拖拽时候添加有新的节点的时候发生该事件
      console.log("onAdd.foo:", [evt.item, evt.from]);
    },
    onUpdate: function (evt: any) {
      // 拖拽更新节点位置发生该事件
      console.log("onUpdate.foo:", [evt.item, evt.from]);
    },
    onRemove: function (evt: any) {
      // 删除拖拽节点的时候促发该事件
      console.log("onRemove.foo:", [evt.item, evt.from]);
    },
    onStart: function (evt: any) {
      // 开始拖拽出发该函数
      console.log("onStart.foo:", [evt.item, evt.from]);
    },
    onSort: function (evt: any) {
      // 发生排序发生该事件
      console.log("onUpdate.foo:", [evt.item, evt.from]);
    },
    onEnd(evt: any) {
      // 结束拖拽
      console.log("结束表格拖拽", evt);
      // 如果拖拽结束后顺序发生了变化，则对数据进行修改
      if (evt.oldIndex !== evt.newIndex) {
        let currRow = tableData.value.splice(evt.oldIndex, 1)[0];
        tableData.value.splice(evt.newIndex, 0, currRow);
        // 将排序后的ID抽离成数组传给后端
        let optIDs: string[] = [];
        tableData.value.forEach((item) => {
          if(item){
            optIDs.push(item.id);
          }
        });
        console.log(optIDs)
        // const params = {
        //   Params: {
        //     id: currRow.id,
        //     OptIDs: optIDs,
        //   },
        //   Options: {
        //     APIServer: apiServer,
        //   },
        // };
        // // 发送改变顺序的请求
        // store.commit("doRequest");
        // spaceService.OrderOptions(params).then((res: any) => {
        //   store.commit("deResponse");
        //   if (res.Status === 0) {
        //     console.log("表格顺序修改成功");
        //   } else {
        //     ElMessage({
        //       showClose: true,
        //       message: res.ErrorMessage,
        //       type: "error",
        //       duration: 10000,
        //     });
        //   }
        // });
      }
    },
  });
};


async function getList() {
    const { data } = await listByPart(query)
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
  getList()
}

function rest(){
  query.name = ""
  getList()
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
  <el-table :data="tableData" style="width: 100%" max-height="100vh"
  :tree-props="{ children: 'children'}"
  row-key="id"
>
    <el-table-column prop="id" label="ID" />
    <el-table-column prop="name" label="名称" />
    <el-table-column fixed prop="createTime" label="时间" />

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