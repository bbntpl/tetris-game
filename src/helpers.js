//DOM helpers
class helper{
    static modifyAttr(DOM,type,value){
        DOM.setAttribute(type,value);
    }
    static createModal(eId,eClass){
        const element = document.createElement('div');
        this.modifyAttr(element,'style',`background: rgba(1,1,1,0.2);`);
        element.id = eId;
        element.className = eClass;
        return element;
    }
    static createElement(text,eId,eClass,eType){
        const element = document.createElement(eType);
        element.className = eClass;
        element.id = eId;
        element.textContent = text;
        return element;
    }
}

export default helper;