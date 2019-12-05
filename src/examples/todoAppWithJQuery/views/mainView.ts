import * as $ from 'jquery';
import { bindTo, Events, unbindFrom, updateLayout, utils, addBindingTo } from 'databindjs';
import template = require('../templates/mainView.mustache');
import { MainViewModel } from '../viewModels/mainViewModel';
import { TodoListView } from './todoListView';


const ENTER_KEY = 13;

const kebabCase = (str, prefix = '') => (prefix ? [prefix] : []).concat(str.split(/(?=[A-Z])/)).join('-').toLowerCase();

interface MainView extends ReturnType<typeof initialize$MainView> {

}

function initialize$MainView<T>(inst: T, $el) {
    return Object.assign(inst, {
        $newTodo: $('.new-todo', $el),
        $total: $('.total', $el),
        itemsListView: new TodoListView({
            $el: $('.todo-list', $el)
        }),
        $main: $('.main', $el),
        $footer: $('.footer', $el),
        $toggleAll: $('.toggle-all', $el),
        $todoCount: $('.todo-count strong', $el),
        $itemWord: $('.item-word', $el),
        $itemsWord: $('.items-word', $el),
        $clearCompleted: $('.clear-completed', $el)
    });
}

class MainView extends Events {
    cid = utils.uniqueId('view');
    options = this.initOptions(this.config);
    $el = this.options.$el;
    createNewItem = null as { exec(); };
    todoFilter = '/';

    binding = bindTo(this, () => new MainViewModel(), {
        '$total.text': 'items.length',
        '-$main.addClass(hidden)': 'items.length',
        '-$footer.toggleClass(hidden)': 'items.length|not',
        '-$toggleAll.prop(checked)': 'remaining.length|not',
        '-$todoCount.text': 'remaining.length',
        '-$clearCompleted.toggleClass(hidden)': 'completed.length|not',
        '-$itemWord.toggleClass(hidden)': 'remaining.1|bool',
        '-$itemsWord.toggleClass(hidden)': 'remaining.1|not',
        //'$newTodo.val': 'newTodoTitle',
        'itemsListView.items': 'items',
        'itemsListView.filter': 'filterItems',
        '-$newTodo.keypress': '.bind(onKeypress)',
        '-createNewItem': 'createNewItemCommand',
        'activeFilter': 'filterBy',
        '-$toggleAll.click': 'bind(markAllCompleted)',
        '-$clearCompleted.click': 'bind(clearCompleted)'
    });

    constructor(public config = {}) {
        super();
        this.initialize();
    }

    initialize() {
        const $html = $('<div/>').html(template());
        const selectors = $('[data-bind]', $html).map((index, el) => {
            const $el = $(el);
            const nameAndBindings = /(.*)\{(.*)\}/g.exec($el.attr('data-bind'));
            const propName = nameAndBindings[1];
            const bindings = utils.reduce(nameAndBindings[2].split(/\s*,\s*/g), (res, p) => {
                const pair = p.split(/\s*=\s*/g);
                res[`${propName}.${pair[0]}`] = pair[1];

                return res;
            }, {});
            const className = kebabCase(propName, this.cid);
            $el.toggleClass(className, true);
    
            utils.reduce(Object.keys(bindings), (res, key) => {
                const bindInfo = addBindingTo(this.binding, { [key]: bindings[key] });

                return res;
            }, el);
            return [[propName, '.' + className]];
        }) as any;
        this.$el.html($html.html());
        utils.forEach(selectors, ([key, selector]) => this[key] = $(selector, this.$el));
        initialize$MainView(this, this.options.$el);

        updateLayout(this.binding);
    }

    initOptions(options = {}) {
        const defOptions = {
            $el: $('body')
        }
        return {
            ...defOptions,
            ...options
        };
    }

    activeFilter(val?) {
        if (arguments.length && val !== this.todoFilter) {
            this.todoFilter = val;
            this.$el.find('.filters li a').toggleClass('selected', false);
            this.$el.find(`.filters li a[href='#/${val}']`).toggleClass('selected', true);
            this.trigger('change:activeFilter');
        }

        return this.todoFilter;
    }

    onKeypress(evnt) {
        if (evnt.which === ENTER_KEY && ('' + this.$newTodo.val()).trim()) {
            this.createNewItem.exec();
        }
    }
}

export { MainView };
