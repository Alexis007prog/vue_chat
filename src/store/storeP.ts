import { defineStore } from 'pinia'

//
// 第一个参数是应用程序中 store 的唯一 id
export const useStore = defineStore('main', {
  state: () => { // 创建状态
    return {
      checkArr: [],
      promptId: "",
      synchronization: [],
    }
  },
  actions: {
    TEXT_UPDATE(arr: any) { // 修改方法
      this.checkArr = arr._rawValue
    },
    TEXT_SYNCHR(arr: any) { // 修改方法
      this.synchronization = arr
    },
    SET_PROMPT_ID(id: any) { // 修改方法
      this.promptId = id
    },
  },
  getters: {
    checkArrReturn(): any {
      return this.checkArr
    },
  },
})
