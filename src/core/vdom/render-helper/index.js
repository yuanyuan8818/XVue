import {createTextVNode, h} from '../vnode'
import {renderList} from './render-list'
import {} from '@/shared/util'
export function installRenderHelpers (target) {
    target._v = createTextVNode
    target._s = toString;
    target._c = h;
    target._l = renderList;
}