# cerebral-react-baobab
A Cerebral package with React and Baobab

## WARNING!
This package uses the DEV version of Baboab V2, which will soon be released.

## Requirements
It is required that you use a Webpack or Browserify setup. Read more at [The ultimate webpack setup](http://www.christianalfoni.com/articles/2015_04_19_The-ultimate-webpack-setup) for an example.

## Debugger
You can download the Chrome debugger [here](https://chrome.google.com/webstore/detail/cerebral-debugger/ddefoknoniaeoikpgneklcbjlipfedbb?hl=no).

## More info on Cerebral and video introduction
Cerebral main repo is located [here](https://github.com/christianalfoni/cerebral) and a video demonstration can be found [here](https://www.youtube.com/watch?v=xCIv4-Q2dtA).

## Video introduction
Watch a [video](https://www.youtube.com/watch?v=QG181MnRIXM) on how you can use this package. **Note!** Video is for the **cerebral-react-immutable-store**, just ignore the immutable-store specific stuff ;-)

## Install
`npm install cerebral-react-baobab`

## API
All examples are shown with ES6 syntax.

### Instantiate a Cerebral controller
*controller.js*
```js
import Controller from 'cerebral-react-baobab';
import request from 'superagent';

// The initial state of the application
const state = {
  isLoading: false,
  user: null,
  error: null
};

// Any default arguments you want each action to receive
const defaultArgs = {
  utils: {
    request: request
  }
};

// Instantiate the controller
export default Controller(state, defaultArgs);
```

*main.js*
```js
import React from 'react';
import AppComponent from './AppComponent.js';
import controller from './controller.js';

React.render(controller.injectInto(AppComponent), document.body);
```
With Baobab you can also use facets. Read more about that [here](https://github.com/Yomguithereal/baobab/issues/278).

### Create signals and actions
Actions is where it all happens. This is where you define mutations to your application state based on information sent from the VIEW layer. Actions are pure functions that can run synchronously and asynchronously. They are easily reused across signals and can easily be tested.

In larger application you should consider putting each action in its own file.

*actions.js*
```js
export default {
  // Define an action with a function. It receives two arguments when run
  // synchronously
  setLoading(args, state) {
    state.set('isLoading', true);
  },

  // There are many types of mutations you can do, "set" is just one of them
  unsetLoading(args, state) {
    state.set('isLoading', false);
  },

  // When an action is run asynchronously it receives a third argument,
  // a promise you can either resolve or reject. In this example we
  // are using an ajax util we passed as a default argument and an argument
  // we passed when the signal was triggered
  saveForm(args, state, promise) {
    args.utils.ajax.post('/form', args.formData, function (err, response) {
      promise.resolve();
    });
  };  
};
```

*controller.js*
```js
...
// The saveForm action runs async because it is in an array. You can have multiple
// actions in one array that runs async in parallel.
controller.signal('formSubmitted', setLoading, [saveForm], unsetLoading);

export default controller
```

### Mutations
You can do any traditional mutation to the state, the signature is just a bit different. You call the kind of mutation first, then the path and then an optional value. The path can either be a string or an array for nested paths. Depending on the size of your application you might consider putting each action in its own file.

*actions/someAction.js*
```js
export default function someAction (args, state) {
  state.set('isLoading', false);
  state.unset('isLoading');
  state.merge('user', {name: 'foo'});
  state.push('list', 'foo');
  state.unshift('list', 'bar');
  state.pop('list');
  state.shift('list');
  state.concat('list', [1, 2, 3]);
  state.splice('list', 1, 1, [1]);

  // Use an array as path to reach nested values
  state.push(['admin', 'users'], {foo: 'bar'});

};
```

### Get state in actions
*actions/someAction.js*
```js
export default function someAction (args, state) {
  const isLoading = state.get('isLoading');
};
```

### Async actions
Async actions are not able to mutate state, so the **state** argument only has the `get()` method. You have to **resolve** or **reject** any values to the next action to do mutations.
*actions/someAction.js*
```js
export default function someAction (args, state, promise) {
  args.utils.ajax('/foo', function (err, result) {
    if (err) {
      promise.reject({error: err});
    } else {
      promise.resolve({result: result});
    }
  })
};
```
You can optionally redirect resolved and rejected async actions to different actions by inserting an object as the last entry in the async array definition.

*controller.js*
```js
...
controller.signal('formSubmitted',
  setLoading,
  [saveForm, {
    resolve: [closeModal],
    reject: [setFormError]
  }],
  unsetLoading
);

export default Controller(state, defaultArgs);
```

### Get state in components

#### Decorator
```js
import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react-baobab';

@Cerebral({
  isLoading: ['isLoading'],
  user: ['user'],
  error: ['error']  
})
class App extends React.Component {
  componentDidMount() {
    this.props.signals.appMounted();
  }
  render() {
    return (
      <div>
        {this.props.isLoading ? 'Loading...' : 'hello ' + this.props.user.name}
        {this.props.error ? this.props.error : null}
      </div>
    );
  }
}
```

#### Higher Order Component
```js
import React from 'react';
import {HOC} from 'cerebral-react-baobab';

class App extends React.Component {
  componentDidMount() {
    this.props.signals.appMounted();
  }
  render() {
    return (
      <div>
        {this.props.isLoading ? 'Loading...' : 'hello ' + this.props.user.name}
        {this.props.error ? this.props.error : null}
      </div>
    );
  }
}

App = HOC(App, {
  isLoading: ['isLoading'],
  user: ['user'],
  error: ['error']  
});
```

#### Mixin
```js
import React from 'react';
import {Mixin} from 'cerebral-react-baobab';

const App = React.createClass({
  mixins: [Mixin],
  getStatePaths() {
    return {
      isLoading: ['isLoading'],
      user: ['user'],
      error: ['error']  
    };
  },
  componentDidMount() {
    this.props.signals.appMounted();
  },
  render() {
    return (
      <div>
        {this.state.isLoading ? 'Loading...' : 'hello ' + this.state.user.name}
        {this.state.error ? this.state.error : null}
      </div>
    );
  }
});
```

### Recording
```js
import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react-baobab';

@Cerebral()
class App extends React.Component {
  record() {
    this.props.recorder.record();
  }
  record() {
    this.props.recorder.stop();
  }
  play() {
    this.props.recorder.seek(0, true);
  }
  render() {
    return (
      <div>
        <button onClick={() => this.record()}>Record</button>
        <button onClick={() => this.stop()}>Stop</button>
        <button onClick={() => this.play()}>Play</button>
      </div>
    );
  }
}
```

### Listening to changes
You can manually listen to changes on the controller, in case you want to explore [reactive-router](https://github.com/christianalfoni/reactive-router) for example.

*main.js*
```js
...
const onChange = function (state) {
  state // New state
};
controller.eventEmitter.on('change', onChange);
controller.eventEmitter.removeListener('change', onChange);
```
