import request from '@/utils/request'

export function transformAliyun(data) {
  return request({
    url: '',
    method: 'post',
    params: data,
    baseURL: 'https://nlp-automl.cn-hangzhou.aliyuncs.com'
  })
}
