import request from '@/utils/request/axios'


export function lists() {
  return request.get('/indexPrompt/list', {})
}
export function save(data: any) {
  return request.put('/indexPrompt/save', data)
}
export function del(id: any) {
  return request.delete('/indexPrompt/delete/' + id)
}
export function findById(id: any) {
  return request.get('/indexPrompt/detail/' + id)
}
export function update(data: any) {
  return request.post('/indexPrompt/update', data)
}
// 关键词
//  列表  /smileIndex/list     参数 无
//  增加  /smileIndex/save     参数 smileIndex
//  删除  /smileIndex/delete   参数 id
//  修改  /smileIndex/update   参数 smileIndex
//  提示词详情   /smileIndex/detail 参数Id
