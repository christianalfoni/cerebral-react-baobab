var cerebral = require('cerebral');
var React = require('react');
var Baobab = require('baobab');
var EventEmitter = require('events').EventEmitter;

var Value = cerebral.Value;
var updateTree = function (tree, state, path) {
  Object.keys(state).forEach(function (key) {
    if (key[0] === '$') {
      return;
    }
    path.push(key);
    if (!Array.isArray(state[key]) && typeof state[key] === 'object' && state[key] !== null) {
      updateTree(tree, state[key], path)
    } else {
      tree.set(path, state[key])
    }
    path.pop();
  });
};

var Factory = function (initialState, defaultArgs, options) {

  options = options || {};
  options.syncwrite = true;

  var eventEmitter = new EventEmitter();
  var tree = new Baobab(initialState, options);
  initialState = tree.get();

  var controller = cerebral.Controller({
    defaultArgs: defaultArgs,
    onReset: function () {
      updateTree(tree, initialState, [])
    },
    onGetRecordingState: function () {

    },
    onSeek: function (seek, isPlaying, currentRecording) {

    },
    onUpdate: function () {
      eventEmitter.emit('change', tree.get());
    },
    onRemember: function () {
      eventEmitter.emit('remember', tree.get());
    },
    onGet: function (path) {
      return tree.get(path);
    },
    onSet: function (path, value) {
      tree.set(path, value);
    },
    onUnset: function (path, key) {
      tree.unset(path.concat(key));
    },
    onPush: function (path, value) {
      tree.push(path, value);
    },
    onSplice: function () {
      tree.splice.apply(tree, arguments);
    },
    onMerge: function (path, value) {
      tree.merge(path, value);
    },
    onConcat: function (path, value) {
      tree.apply(path, function (existingValue) {
        return existingValue.concat(value);
      });
    },
    onPop: function (path) {
      tree.apply(path, function (existingValue) {
        existingValue.pop();
        return existingValue;
      });
    },
    onShift: function (path) {
      tree.apply(path, function (existingValue) {
        existingValue.shift();
        return existingValue;
      });
    },
    onUnshift: function (path, value) {
      tree.unshift(path, value);
    }
  });

  controller.injectInto = function (AppComponent) {
    return React.createElement(React.createClass({
      displayName: 'CerebralContainer',
      childContextTypes: {
        controller: React.PropTypes.object.isRequired
      },
      getChildContext: function () {
        return {
          controller: controller
        }
      },
      render: function () {
        return React.createElement(AppComponent);
      }
    }));
  };

  controller.eventEmitter = eventEmitter;

  return controller;

};

Factory.Mixin = {
  contextTypes: {
    controller: React.PropTypes.object
  },
  componentWillMount: function () {
    this.signals = this.context.controller.signals;
    this.recorder = this.context.controller.recorder;
    this.get = this.context.controller.get;
    this.context.controller.eventEmitter.on('change', this._update);
    this.context.controller.eventEmitter.on('remember', this._update);
    this._update(this.context.controller.get([]));
  },
  componentWillUnmount: function () {
    this._isUmounting = true;
    this.context.controller.eventEmitter.removeListener('change', this._update);
    this.context.controller.eventEmitter.removeListener('remember', this._update);
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    var propKeys = Object.keys(nextProps);
    var stateKeys = Object.keys(nextState);

    // props
    for (var x = 0; x < propKeys.length; x++) {
      var key = propKeys[x];
      if (this.props[key] !== nextProps[key]) {
        return true;
      }
    }

    // State
    for (var x = 0; x < stateKeys.length; x++) {
      var key = stateKeys[x];
      if (this.state[key] !== nextState[key]) {
        return true;
      }
    }

    return false;
  },
  _update: function (state) {
    if (this._isUmounting || !this.getStatePaths) {
      return;
    }
    var statePaths = this.getStatePaths();
    var newState = Object.keys(statePaths).reduce(function (newState, key) {
      newState[key] = Value(statePaths[key], state);
      return newState;
    }, {});
    this.setState(newState);
  }
};

var Render = function (Component) {
  return function () {
    var state = this.state || {};
    var props = this.props || {};

    var propsToPass = Object.keys(state).reduce(function (props, key) {
      props[key] = state[key];
      return props;
    }, {});

    propsToPass = Object.keys(props).reduce(function (propsToPass, key) {
      propsToPass[key] = props[key];
      return propsToPass;
    }, propsToPass);

    propsToPass.signals = this.signals;
    propsToPass.recorder = this.recorder;
    propsToPass.get = this.get;

    return React.createElement(Component, propsToPass);
  };
};

Factory.Decorator = function (paths) {
  return function (Component) {
    return React.createClass({
      displayName: Component.name + 'Container',
      mixins: [Factory.Mixin],
      getStatePaths: function () {
        return paths || {};
      },
      render: Render(Component)
    });
  };
};

Factory.HOC = function (Component, paths) {
  return React.createClass({
    displayName: Component.name + 'Container',
    mixins: [Factory.Mixin],
    getStatePaths: function () {
      return paths || {};
    },
    render: Render(Component)
  });
};


module.exports = Factory;
