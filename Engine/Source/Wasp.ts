
import * as WaspMath from './Runtime/Renderer/Math/index';
import WaspRenderingContext from './Runtime/Renderer/Renderers/WaspRenderingContext';
var Wasp = {
  Math:WaspMath,
  RenderingContext:WaspRenderingContext
};

window['Wasp'] = Wasp;


export {Wasp as default};
