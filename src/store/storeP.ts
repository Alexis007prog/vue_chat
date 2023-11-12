import { defineStore } from 'pinia'

//
// 第一个参数是应用程序中 store 的唯一 id
export const useStore = defineStore('main', {
  state: () => { // 创建状态
    return {
      checkArr: [],
      keyword: {},
      synchronization: false,
      model: "gpt-3.5-turbo",
    }
  },
  actions: {
    TEXT_UPDATE(arr: any) { // 修改方法
      this.checkArr = arr || []
    },
    TEXT_SYNCHR(bool: boolean) { // 修改方法
      this.synchronization = bool
    },
    SET_KEYWORD(data: any) { // 修改方法
      this.keyword = data
    },
    SET_MODEL(model: any) { // 修改方法
      this.model = model
    },
  },
  getters: {
    checkArrReturn(): any {
      return this.checkArr
    },
  },
})
