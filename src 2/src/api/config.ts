import request from '@/utils/request/axios'


export function lists() {
  return request.get('/apiConfig//list', {})
}
export function save(data: any) {
  return request.put('/apiConfig/save', data)
}
export function del(id: any) {
  return request.delete('/apiConfig/delete/' + id)
}
export function findById(id: any) {
  return request.get('/apiConfig/detail/' + id)
}
export function update(data: any) {
  return request.post('/apiConfig/update', data)
}