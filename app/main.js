import React from 'react';
import Controller from 'controller';

const Decorator = Controller.Decorator;

const controller = Controller({
  list: ['foo'],
  $list2: {
    cursors: {
      list: ['list']
    },
    get({list}) {
      return list.map((item) => item + ' hihihi');
    }
  },
  foo: 'bar'
});

controller.signal('test', function AddBar (args, state) {
  state.push('list', 'bar');
});

@Decorator({
  foo: ['foo']
})
class App extends React.Component {
  render() {
    console.log('Rendering app');
    return (
      <div>
        <h1>Hello world!</h1>
        <button onClick={() => this.props.signals.test()}>Add to list</button>
        <List/>
      </div>
    );
  }
}

@Decorator({
  list: ['list'],
  list2: ['$list2']
})
class List extends React.Component {
  render() {
    return <ul>{this.props.list2.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  }
}

React.render(controller.injectInto(App), document.body);
