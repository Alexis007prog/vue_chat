<script setup lang='ts'>
import { computed } from 'vue'
import { NModal, NInput, NTree, NButton } from 'naive-ui'
import { ref } from 'vue'
import { TreeOption } from 'naive-ui'

interface Props {
    visible: boolean
}

// interface Emit {
//     (e: 'update:visible', visible: boolean): void
// }

const props = defineProps<Props>()

const emit = defineEmits(['update:visible','menuSelect']);

const show = computed({
    get: () => props.visible,
    set: (visible: boolean) => emit('update:visible', visible),
})

const data: TreeOption[] = [
    {
        label: '0',
        key: '0',
        children: [
            {
                label: '0-0',
                key: '0-0',
                children: [
                    { label: '0-0-0', key: '0-0-0' },
                    { label: '0-0-1', key: '0-0-1' }
                ]
            },
            {
                label: '0-1',
                key: '0-1',
                children: [
                    { label: '0-1-0', key: '0-1-0' },
                    { label: '0-1-1', key: '0-1-1' }
                ]
            }
        ]
    },
    {
        label: '1',
        key: '1',
        children: [
            {
                label: '1-0',
                key: '1-0',
                children: [
                    { label: '1-0-0', key: '1-0-0' },
                    { label: '1-0-1', key: '1-0-1' }
                ]
            },
            {
                label: '1-1',
                key: '1-1',
                children: [
                    { label: '1-1-0', key: '1-1-0' },
                    { label: '1-1-1', key: '1-1-1' }
                ]
            }
        ]
    }
]

const pattern = ref('');
const showIrrelevantNodes = ref(false);

function confirmMenu() {
    //提交参数
}
</script>

<template>
    <NModal v-model:show="show" style="width: 90%; max-width: 900px;" preset="card">
        <n-input v-model:value="pattern" placeholder="搜索菜单" />
        <!-- <n-switch v-model:value="showIrrelevantNodes">
            <template #checked>
                展示搜索无关的节点
            </template>
            <template #unchecked>
                隐藏搜索无关的节点
            </template>
        </n-switch> -->
        <n-tree :show-irrelevant-nodes="showIrrelevantNodes" :pattern="pattern" :data="data" block-line checkable />
        <!-- :on-update:checked-keys="checkedChange"/> -->
        <n-button type="primary" style="margin-top: 80px;" @click="confirmMenu">确定</n-button>
    </NModal>
</template>
