<template>
    <div>
        <NMenu :options="menuOptions" @update:value="handleUpdateValue" />
        <!-- {{ props.ids }} -->
    </div>
</template>
  
<script setup lang="ts">
import { useMessage, NMenu } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
// import { defineProps } from 'vue';

const message = useMessage();

function handleUpdateValue(key: string, item: MenuOption) {
    message.info('[onUpdate:value]: ' + JSON.stringify(key))
    message.info('[onUpdate:value]: ' + JSON.stringify(item))
}

let menuOptions: MenuOption[] = [
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
</script>