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

// Baobab options
const options = {
  validate: function () {}
};

// Instantiate the controller
export default Controller(state, defaultArgs, options);
```

*main.js*
```js
import React from 'react';
import AppComponent from './AppComponent.js';
import controller from './controller.js';

React.render(controller.injectInto(AppComponent), document.body);
```
With Baobab you can also use facets. Read more about that [here](https://github.com/Yomguithereal/baobab/issues/278).

### Creating signals
Creating actions are generic. It works the same way across all packages. Please read about actions at the [Cerebral Repo - Actions](https://github.com/christianalfoni/cerebral#how-to-get-started). You can also watch [a video on creating actions](https://www.youtube.com/watch?v=ylJG4vUx_Tc) to get an overview of how it works.

Typically you would create your signals in the *main.js* file, but you can split them out as you see fit.

*main.js*
```js
import React from 'react';
import AppComponent from './AppComponent.js';
import controller from './controller.js';

import setLoading from './actions/setLoading.js';
import saveForm from './actions/saveForm.js';
import unsetLoading from './actions/unsetLoading.js';

controller.signal('formSubmitted', setLoading, [saveForm], unsetLoading);

React.render(controller.injectInto(AppComponent), document.body);
```

### Get state in components

#### Decorator
```js
import React from 'react';
import {Decorator as Cerebral} from 'cerebral-react-immutable-store';

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
import {HOC} from 'cerebral-react-immutable-store';

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
import {Mixin} from 'cerebral-react-immutable-store';

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
import {Decorator as Cerebral} from 'cerebral-react-immutable-store';

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

### Listening to errors
You can listen to errors in the controller. Now, Cerebral helps you a lot to avoid errors, but there are probably scenarios you did not consider. By using the error event you can indicate messages to the user and pass these detailed error messages to a backend service. This lets you quickly fix bugs in production.

*main.js*
```js
...
const onError = function (error) {
  controller.signals.errorOccured({error: error.message});
  myErrorService.post(error);
};
controller.eventEmitter.on('error', onError);
```
