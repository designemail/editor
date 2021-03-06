import BaseProperty from "./BaseProperty";
import { LOAD, DEBOUNCE } from "../../../util/Event";
import { EVENT } from "../../../util/UIElement";
import BorderEditor from "../property-editor/BorderEditor";


export default class BorderNewProperty extends BaseProperty {
  components() {
    return {
      BorderEditor
    }
  }
  getTitle() {
    return this.$i18n('border.property.title');  
  }


  hasKeyframe () {
    return true; 
  }

  getKeyframeProperty () {
    return 'border'
  }

  getBody() {
    return /*html*/`<div class="property-item full border-item" ref='$body'></div>`;
  }

  [LOAD('$body')] () {
    var current = this.$selection.current || {}; 
    var value = current['border'] || ''

    return /*html*/`
      <BorderEditor ref='$1' key='border' value='${value}' onchange='changeKeyValue' />
    `
  }

  [EVENT('refreshSelection') + DEBOUNCE(100)]() {
    this.refreshShow(['rect', 'circle', 'text', 'cube', 'cylinder']);
  }  

  [EVENT('changeKeyValue')] (key, value) {
    this.command("setAttribute", { 
      [key]: value
    })
  }

}
