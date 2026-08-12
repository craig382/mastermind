declare var Backbone: any;
declare var _: any;
declare var $: any;

declare namespace Backbone {
  interface Model {
    set(key: string, value?: any): any;
    get(key: string): any;
    on(eventName: string, callback: Function, context?: any): any;
    off(eventName?: string, callback?: Function, context?: any): any;
    toJSON(): any;
  }

  interface View {
    $el: any;
    el: any;
    model: any;
    options?: any;
    initialize?: Function;
    render?: Function;
    remove?: Function;
    setElement(element: any, delegate?: boolean): any;
  }

  interface Collection {
    length: number;
    at(index: number): any;
    get(id: any): any;
    reset(models?: any[]): any;
    on(eventName: string, callback: Function, context?: any): any;
  }
}

declare namespace _ {
  function bindAll(obj: any, ...methods: string[]): any;
  function template(template: string, data?: any): string;
  function each(list: any, iterator: Function): any;
}
