/**
 * default service dir
 */
export const DEFAULT_SERVICE_DIR = '../services'

/**
 * default api ast template
 */
export const DEFAULT_API_AST_TEMPLATE = `
    export function NAME (PARAMS){
      return SERVICE.request<RESPONSE>(ARGS)
    }
`
/**
 * default api request config type name
 */
export const DEFAULT_REQUEST_CONFIG_PARAM_TYPE_NAME = 'AxiosRequestConfig'
