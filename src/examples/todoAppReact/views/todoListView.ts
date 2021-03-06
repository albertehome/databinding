import { Component, createRef } from 'react';
import { utils, withEvents } from 'databindjs';
import { template } from '../templates/todoListView';


class TodoListView extends withEvents(Component)<any, any> {
    ref = createRef();
    state = {
        items: [],
        filterFn: (i) => true
    };

    constructor(props) {
        super(props);
    }

    filter(fn?) {
        if (arguments.length && fn !== this.state.filterFn) {
            this.setState(this.state = {
                ...this.state,
                filterFn: fn
            }, () => {
                this.trigger('change:filter');
            });
        }
        return this.state.filterFn;
    }

    items(value?: any[]) {
        if (arguments.length && value !== this.state.items) {
            this.setState(this.state = {
                ...this.state,
                items: value
            }, () => {
                this.trigger('change:items');
            });
        }
        return this.state.items;
    }

    updateItem(item) {
        this.items([...this.state.items]);
    }

    removeItem(item) {
        item.destroy();
        this.items(utils.difference(this.state.items, [item]));
    }

    render() {
        return template(this, this.ref);
    }
}

export { TodoListView };
