
import { Length } from "../unit/Length";
import { GroupItem } from "./GroupItem";
import {
  keyEach,
  combineKeyArray,
  isUndefined,
  isNotUndefined,
  CSS_TO_STRING,
  STRING_TO_CSS,
  clone,
  OBJECT_TO_PROPERTY,
  OBJECT_TO_CLASS
} from "../../util/functions/func";
import { Selector } from "../css-property/Selector";

import { ClipPath } from "../css-property/ClipPath";
import Dom from "../../util/Dom";
import { Pattern } from "../css-property/Pattern";
import { BackgroundImage } from "../css-property/BackgroundImage";

export class DomItem extends GroupItem {
  getDefaultObject(obj = {}) {
    return super.getDefaultObject({
      'position': 'absolute',
      'x': Length.z(),
      'y': Length.z(),
      'right': '',
      'bottom': '',
      'rootVariable': '',
      'variable': '',      
      'width': Length.px(300),
      'height': Length.px(300),
      'color': "black",
      'font-size': Length.px(13),
      'overflow': 'visible',
      'z-index': Length.auto,
      'layout': 'default',
      'flex-layout': 'display:flex;',
      'grid-layout': 'display:grid;',
      // 'keyframe': 'sample 0% --aaa 100px | sample 100% width 200px | sample2 0.5% background-image background-image:linear-gradient(to right, black, yellow 100%)',
      // keyframes: [],
      selectors: [],
      svg: [],
      ...obj
    });
  }

  toCloneObject() {

    var json = this.json; 

    return {
      ...super.toCloneObject(),
      'position': json.position,
      'right': json.right + '',
      'bottom': json.bottom + '',
      'rootVariable': json.rootVariable,
      'variable': json.variable,
      'transform': json.transform,
      'filter': json.filter,
      'backdrop-filter': json['backdrop-filter'],
      'background-color': json['background-color'],      
      'background-image': json['background-image'],      
      'text-clip': json['text-clip'],
      'border-radius': json['border-radius'],      
      'border': json['border'],
      'box-shadow': json['box-shadow'],
      'text-shadow': json['text-shadow'],
      'clip-path': json['clip-path'],
      'color': json.color,
      'font-size': json['font-size'] + "",
      'font-stretch': json['font-stretch'] + "",
      'line-height': json['line-height'] + "",
      'text-align': json['text-align'] + "",
      'text-transform': json['text-transform'] + "",
      'text-decoration': json['text-decoration'] + "",
      'letter-spacing': json['letter-spacing'] + "",
      'word-spacing': json['word-spacing'] + "",
      'text-indent': json['text-indent'] + "",      
      'perspective-origin': json['perspective-origin'],
      'transform-origin': json['transform-origin'],
      'transform-style': json['transform-style'],      
      'perspective': json.perspective + "",
      'mix-blend-mode': json['mix-blend-mode'],
      'overflow': json['overflow'],
      'opacity': json.opacity + "",
      'rotate': json.rotate + "",
      'flex-layout': json['flex-layout'],      
      'grid-layout': json['grid-layout'],         
      'animation': json['animation'],      
      'transition': json['transition'],               
      // 'keyframe': 'sample 0% --aaa 100px | sample 100% width 200px | sample2 0.5% background-image background-image:linear-gradient(to right, black, yellow 100%)',
      // keyframes: json.keyframes.map(keyframe => keyframe.clone()),
      selectors: json.selectors.map(selector => selector.clone()),
      svg: json.svg.map(svg => svg.clone())
    }
  }

  convert(json) {
    json = super.convert(json);

    return json;
  }


  addSelector(selector) {
    this.json.selectors.push(selector);
    return selector;
  }      

  createSelector(data = {}) {
    return this.addSelector(
      new Selector({
        checked: true,
        ...data
      })
    );
  }    

  removePropertyList(arr, removeIndex) {
    arr.splice(removeIndex, 1);
  }
  
  removeSelector(removeIndex) {
    this.removePropertyList(this.json.selectors, removeIndex);
  }    

  enableHasChildren() {
    return true; 
  }

  sortItem(arr, startIndex, targetIndex) {
    arr.splice(
      targetIndex + (startIndex < targetIndex ? -1 : 0),
      0,
      ...arr.splice(startIndex, 1)
    );
  }

  updateSelector(index, data = {}) {
    this.json.selectors[+index].reset(data);
  }        

  setSize(data) {
    this.reset(data);
  }

  // 현재 선택된 border 의 속성을 지정한다.
  // type 에 따라 다른데
  // type is all 일 때, 나머지 속성 필드 값은 모두 지운다.
  // type is not all 일 때는 해당 속성만 설정하고 all 값이 존재하면 지운다.
  setBorder(type, data = undefined) {
    var border = this.json.border;
    if (type === "all") {
      if (data) {
        this.json.border = { all: data };
      } else {
        ["top", "right", "bottom", "left"].forEach(type => {
          delete this.json.border[type];
        });
      }
    } else {
      if (border.all && isUndefined(data)) {
        var newObject = { ...border.all };
        border.top = { ...newObject };
        border.bottom = { ...newObject };
        border.left = { ...newObject };
        border.right = { ...newObject };
      }

      if (border.all) {
        delete border.all;
      }

      if (data) {
        this.json.border[type] = data;
      }
    }
  }

  getBorder (type) {
    return this.json.border[type] || {}
  }

  setBorderRadius(type, data) {
    this.json.borderRadius = data;
  }

  traverse(item, results, hasLayoutItem) {
    // var parentItemType = item.parent().itemType;
    if (item.isAttribute()) return;
    // if (parentItemType == 'layer') return;
    if (!hasLayoutItem && item.isLayoutItem() && !item.isRootItem()) return;

    results.push(item);

    item.children.forEach(child => {
      this.traverse(child, results);
    });
  }

  tree(hasLayoutItem) {
    var results = [];

    this.children.forEach(item => {
      this.traverse(item, results, hasLayoutItem);
    });

    return results;
  }

  toPropertyCSS(list) {
    var results = {};
    list.forEach(item => {
      keyEach(item.toCSS(), (key, value) => {
        if (!results[key]) results[key] = [];
        results[key].push(value);
      });
    });

    return combineKeyArray(results);
  }

  toStringPropertyCSS (field) {
    return STRING_TO_CSS(this.json[field]);
  }

  toBackgroundImageCSS() {

    let list = [];

    Pattern.parseStyle(this.json.pattern).forEach(it => {
     list.push(...BackgroundImage.parseStyle(STRING_TO_CSS(it.toCSS())))
    });

    list.push(...BackgroundImage.parseStyle(STRING_TO_CSS(this.json['background-image'])))

    return BackgroundImage.joinCSS(list);
  }

  toLayoutCSS () {

    var layout = this.json.layout ;

    if (this.hasLayout()) {
      if (layout === 'flex') {
        return this.toFlexLayoutCSS()
      } else if  (layout === 'grid') {
        return this.toGridLayoutCSS()
      }
    }


    return {}
  }

  toLayoutItemCSS() {
    var parentLayout =  this.json.parent['layout'];
    var obj = {}
    if (parentLayout === 'flex') {
      // 부모가  layout 이  지정 됐을 때 자식item 들은 position: relative 기준으로 동작한다. , left, top 은  속성에서 삭제 
      obj = {
        position: 'relative',
        left: 'auto !important',
        top: 'auto !important',
      }
    } else if (parentLayout === 'grid') {
      // 부모가  layout 이  지정 됐을 때 자식item 들은 position: relative 기준으로 동작한다. , left, top 은  속성에서 삭제 
      obj = {
        position: 'relative',
        left: 'auto !important',
        top: 'auto !important',
        width: 'auto !important',
        height: 'auto !important',        
      }
    }

    if (parentLayout === 'flex') {
      obj = {
        ...obj, 
        ...STRING_TO_CSS(this.json['flex-layout-item'])
      }      
    } else if (parentLayout  === 'grid') {
      obj = {
        ...obj, 
        ...STRING_TO_CSS(this.json['grid-layout-item'])
      }
    }

    return obj;
  }

  toFlexLayoutCSS() {
    return {
      display: 'flex',
      ...this.toStringPropertyCSS('flex-layout')
    }
  }  

  toGridLayoutCSS() {
    return {
      display: 'grid',
      ...this.toStringPropertyCSS('grid-layout')
    }
  }  

  toBorderCSS() {
    return this.toStringPropertyCSS('border')
  }



  toKeyCSS (key) {
    if (!this.json[key]) return {} 
    return {
      [key] : this.json[key]
    };
  }
  
  // export animation keyframe
  toAnimationKeyframes (properties) {
    return [
      { selector: `[data-id="${this.json.id}"]`, properties }
    ] 
  }

  toString() {
    return CSS_TO_STRING(this.toCSS());
  }

  toExport() {
    return CSS_TO_STRING(this.toCSS(true));
  }

  toExportSVGCode () {
    return ''; 
  }

  toBoxModelCSS() {
    var json = this.json;
    var obj = {};

    if (json['margin-top']) obj["margin-top"] = json['margin-top'];
    if (json['margin-bottom']) obj["margin-bottom"] = json['margin-bottom'];
    if (json['margin-left']) obj["margin-left"] = json['margin-left'];
    if (json['margin-right']) obj["margin-right"] = json['margin-right'];


    if (json['padding-top']) obj["padding-top"] = json['padding-top'];
    if (json['padding-bottom']) obj["padding-bottom"] = json['padding-bottom'];
    if (json['padding-left']) obj["padding-left"] = json['padding-left'];
    if (json['padding-right']) obj["padding-right"] = json['padding-right'];


    return obj;
  }

  toKeyListCSS (...args) {
    var json = this.json;
    var obj = {};

    args.filter(it => isNotUndefined(it) && json[it] !== '').forEach( it => {
        obj[it] = json[it]
    })

    return obj;
  }

  toDefaultCSS() {

    var obj = {}

    if (this.isAbsolute) {
      if (this.json.x)  {
        obj.left = this.json.x ;
      }
      if (this.json.y)  {
        obj.top = this.json.y ;
      }
    }

    obj.visibility = (this.json.visible) ? 'visible' : 'hidden';

    return {
      ...obj,
      ...this.toKeyListCSS(
        
        'position', 'right','bottom', 'width','height', 'overflow', 'z-index', 'box-sizing',

        'background-color', 'color',  'opacity', 'mix-blend-mode',

        'transform-origin', 'transform', 'transform-style', 'perspective', 'perspective-origin',

        'font-size', 'font-stretch', 'line-height', 'font-weight', 'font-family', 'font-style',
        'text-align', 'text-transform', 'text-decoration',
        'letter-spacing', 'word-spacing', 'text-indent',

        'border-radius',

        'filter', 'backdrop-filter', 'box-shadow', 'text-shadow',

        'offset-path', 

        'animation',  'transition',
      )
    }

  }

  toDefaultSVGCSS() {

    var obj = {
      overflow: 'visible',
    }

    return {
      ...obj,
      ...this.toKeyListCSS(

        'transform', 

        'font-size', 'font-stretch', 'line-height', 'font-weight', 'font-family', 'font-style',
        'text-align', 'text-transform', 'text-decoration',
        'letter-spacing', 'word-spacing', 'text-indent'
      )
    }

  }

  toVariableCSS () {
    var obj = {}
    this.json.variable.split(';').filter(it => it.trim()).forEach(it => {
      var [key, value] = it.split(':')

      obj[`--${key}`] = value; 
    })
    return obj;
  }

  toRootVariableCSS () {
    var obj = {}
    this.json.rootVariable.split(';').filter(it => it.trim()).forEach(it => {
      var [key, value] = it.split(':')

      obj[`--${key}`] = value; 
    })

    return obj;
  }

  toRootVariableString () {
    return CSS_TO_STRING(this.toRootVariableCSS())
  }

  // convert to only webket css property 
  toWebkitCSS() {
    var obj = this.toKeyListCSS(
      'text-fill-color', 
      'text-stroke-color', 
      'text-stroke-width', 
      'background-clip'
    )

    var results = {}
    keyEach(obj, (key, value) => {
      results[`-webkit-${key}`] = value; 
    })

    return results;
  }


  // convert to only webket css property 
  toTextClipCSS() {

    var results = {} 

    if (this.json['text-clip'] === 'text') {
      results['-webkit-background-clip'] = 'text'
      results['-webkit-text-fill-color'] = 'transparent';   
      results['color'] = 'transparent';
    }

    return results;
  }  

  toClipPathCSS () {
    var str = this.json['clip-path']
    var obj = ClipPath.parseStyle(str)

    switch (obj.type) {
    case 'path': 
    case 'svg': 
      str = `url(#${this.clipPathId})`
      break; 
    }

    return {
      'clip-path': str
    }
  }

  toCSS() {

    return Object.assign(
      {},
      this.toVariableCSS(),
      this.toDefaultCSS(),
      this.toClipPathCSS(),
      this.toWebkitCSS(), 
      this.toTextClipCSS(),      
      this.toBoxModelCSS(),
      this.toBorderCSS(),
      // ...this.toBorderImageCSS(),
      this.toBackgroundImageCSS(),
      this.toLayoutCSS(),
      this.toLayoutItemCSS()
    );
  }

  toSVGCSS() {

    return Object.assign(
      {},
      this.toVariableCSS(),
      this.toDefaultSVGCSS(),
      this.toClipPathCSS(),
      this.toWebkitCSS(), 
      this.toTextClipCSS(),      
      this.toBoxModelCSS(),
      this.toBorderCSS(),
      // ...this.toBorderImageCSS(),
      this.toBackgroundImageCSS(),
      this.toLayoutCSS(),      
      this.toLayoutItemCSS()
    );
  }
  
 
  toSelectorString (prefix = '') {
    return this.json.selectors
              .map(selector => selector.toString(prefix))
              .join('\n\n')
  }


  toNestedCSS($prefix) {
    return []
  }

  toNestedBoundCSS($prefix) {
    return []
  }  

  generateView (prefix = '', appendCSS = '') {

    //1. 원본 객체의 css 를 생성 
    //2. 원본이 하나의 객체가 아니라 복합 객체일때 중첩 CSS 를 자체 정의해서 생성 
    //3. 이외에 selector 로 생성할 수 있는 css 를 생성 (:hover, :active 등등 )
    var cssString = `
${prefix} {  /* ${this.json.itemType} */
    ${CSS_TO_STRING(this.toCSS(), '\n    ')}; 
    ${appendCSS}
}
${this.toNestedCSS().map(it => {
  return `${prefix} ${it.selector} { 
      ${it.cssText ? it.cssText : CSS_TO_STRING(it.css || {}, '\n\t\t')}; 
  }`
}).join('\n')}
${this.toSelectorString(prefix)}
`  
    return cssString;
  }

  generateDragView (prefix = '', appendCSS = '') {

    //1. drag 를 위한 스타일 
    //2. background-image 관련된 속성을 모두 지운다. 

    const cssString = this.generateView(prefix, appendCSS).replace(/background\-/gi, '');

    return cssString;
  }  

  get html () {
    var {elementType, id, name, layers, itemType} = this.json;

    const tagName = elementType || 'div'

    return /*html*/`<${tagName} class="${OBJECT_TO_CLASS({
      'element-item': true,
      [itemType]: true 
    })}" ${OBJECT_TO_PROPERTY({
      'data-id': id,
      'data-title': name 
    })}>
    ${this.toDefString}
  ${layers.map(it => it.html).join('\n\t')}
</${tagName}>`
  }

  generateSVG (isRoot = false) {
    if (isRoot) {
      var width = this.json.width.value;
      var height = this.json.height.value; 
      return /*html*/`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
  ${this.rootSVG}
</svg>`
    }

    return this.svg; 
  }

  get svg () {
    var {x, y} = this.json;    
    x = x.value;
    y = y.value;    
    return this.toSVG(x, y)
  }  

  wrapperRootSVG (x, y, width, height, content) {
    return /*html*/`
    <g>
      ${this.toDefString}
      ${content}
    </g>
    `
  }

  toSVG (x = 0, y = 0, isRoot = false) {
    var {layers, width, height, elementType} = this.json;
    var tagName = elementType || 'div'
    var css = this.toCSS();

    delete css.left;
    delete css.top;      
    if (css.position === 'absolute') {
      delete css.position; 
    }

    if (isRoot) {
      return this.wrapperRootSVG(x, y, width, height, /*html*/`
        <g transform="translate(${x}, ${y})">      
          <foreignObject ${OBJECT_TO_PROPERTY({ 
            width: width.value,
            height: height.value
          })}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <${tagName} style="${CSS_TO_STRING(css)}" ></${tagName}>      
            </div>
          </foreignObject>    
          ${layers.map(it => it.svg).join('\n\t')}          
        </g>

      `)
    } else {
      return /*html*/`
        ${this.toDefString}
        <g transform="translate(${x}, ${y})">
          <foreignObject ${OBJECT_TO_PROPERTY({ 
            width: width.value,
            height: height.value
          })}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <${tagName} style="${CSS_TO_STRING(css)}" ></${tagName}>      
            </div>
          </foreignObject>    
          ${layers.map(it => it.svg).join('\n\t')}                
        </g>             
     
      `
    }
  }

  get rootSVG () {
    return this.toSVG(0, 0, true)
  }  


  toBound () {
    var obj = {
      x: this.json.x ? this.json.x.clone() : Length.z(),
      y: this.json.y ? this.json.y.clone() : Length.z(),
      width: this.json.width.clone(),
      height: this.json.height.clone(),
    }

    obj.x2 = Length.px(obj.x.value + obj.width.value);
    obj.y2 = Length.px(obj.y.value + obj.height.value);

    return obj
  }




  updateFunction (currentElement, isChangeFragment = true, isLast = false, context = null) {

    if (isChangeFragment) {
      var $svg = currentElement.$(`[data-id="${this.innerSVGId}"]`);  
      if ($svg) {

        const defInnerString = this.toDefInnerString.trim();

        if (defInnerString) {
          var $defs = $svg.$('defs');
          $defs.html(defInnerString)
        }

      } else {
        const defString = this.toDefString.trim();

        if (defString) {
          var a = Dom.createByHTML(defString);
          if (a) {
            currentElement.prepend(a);
          }
        }
      }

    }

  }    

  get toDefInnerString () {
    return /*html*/`
      ${this.toClipPath}
    `
  }

  get toClipPath() {

    var obj = ClipPath.parseStyle(this.json['clip-path']);
    var value = obj.value; 
    switch (obj.type) {
    case 'path':
      return /*html*/`<clipPath id="${this.clipPathId}"><path d="${value}" /></clipPath>`
    case 'svg': 
      return /*html*/`<clipPath id="${this.clipPathId}">${value}</clipPath>`
    }

    return ``
  }

  get innerSVGId() {
    return this.json.id + 'inner-svg'
  }

  get toDefString () {
    var str = this.toDefInnerString.trim()

    return str ? /*html*/`
    <svg class='inner-svg-element' data-id="${this.innerSVGId}" width="0" height="0">
      <defs>
        ${str}
      </defs>
    </svg>
    ` : ''
  }

  get clipPathId () {
    return this.json.id + 'clip-path'
  }  
}
