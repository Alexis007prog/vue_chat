import request from '@/utils/request/axios'


export function lists() {
  return request.get('/smileText/detail/list', {})
}

export function editLists() {
  return request.get('/smileText/listEdit', {})
}
export function save(data) {
  return request.put('/smileText/save', data)
}
export function del(id) {
  return request.delete('/smileText/delete/' + id)
}
export function findById(id) {
  return request.get('/smileText/detail/' + id)
}

export function update(data) {
  return request.post('/smileText/update', data)
}

export function ListExpectSelf(id) {
  return request.get('/smileText/listExpectSelf/' + id)
}


// 模型
//  模型列表  /smileText/listEdit 参数 无
//  模型增加  /smileText/save     参数 smileText
//  模型详情  /smileText/detail 参数 id
//  模型删除  /smileText/delete   参数 id
//  模型修改  /smileText/update   参数 snileText
