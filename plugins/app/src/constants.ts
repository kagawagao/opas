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
