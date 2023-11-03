<template>
  <n-data-table :columns="columns" :data="data" :row-key="rowKey" default-expand-all />
</template>

<script setup lang="ts">
import { DataTableColumns, NDataTable } from 'naive-ui'

type RowData = {
  name: string
  index: string
  children?: RowData[]
}
const data: RowData[] = [
  {
    name: '07akioni',
    index: '07',
    children: [
      {
        name: '08akioni',
        index: '08',
        children: [
          {
            name: '09akioni',
            index: '09'
          },
          {
            name: '10akioni',
            index: '10'
          }
        ]
      }
    ]
  },
  {
    name: '11akioni',
    index: '11'
  }
]
const columns: DataTableColumns<RowData> = [
  {
    type: 'selection'
  },
  {
    title: 'name',
    key: 'name'
  },
  {
    title: 'index',
    key: 'index'
  }
]
const rowKey = (row: RowData) => row.index;

</script>