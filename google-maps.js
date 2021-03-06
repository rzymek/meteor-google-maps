GoogleMaps = {
  load: _.once(function(options) {
    options = options || {};
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' +
      'callback=GoogleMaps._initialize';
    if (options.libraries)
      script.src += '&libraries=' + options.libraries;
    if (options.key)
      script.src += '&key=' + options.key;

    document.body.appendChild(script);
  }),
  _loaded: new ReactiveVar(false),
  loaded: function() {
    return this._loaded.get();
  },
  maps: {},
  _callbacks: {},
  _initialize: function() {
    this._loaded.set(true);
  },
  _ready: function(name, map) {
    _.each(this._callbacks[name], function(cb) {
      if (_.isFunction(cb))
        cb(map);
    });
  },
  ready: function(name, cb) {
    if (! this._callbacks[name])
      this._callbacks[name] = [];
    this._callbacks[name].push(cb);
  },
  // options: function(options) {
  //   var self = this;
  //   return function() {
  //     if (self.loaded())
  //       return options();
  //   };
  // },
  get: function(name) {
    return this.maps[name];
  },
  _create: function(name, options) {
    this.maps[name] = {
      instance: options.instance,
      options: options.options
    };
    this._ready(name, this.maps[name]);
  }
};

Template.googleMap.rendered = function() {
  var self = this;
  self.autorun(function() {
    // if the api has loaded
    if (GoogleMaps.loaded()) {
      var data = Template.currentData();
      
      if (! data.name)
        throw new Meteor.Error("GoogleMaps - Missing argument: name");
      if ($.isEmptyObject(data.options))
        throw new Meteor.Error("GoogleMaps - Missing argument: options");
      if (!(data.options instanceof Object))
        throw new Meteor.Error("GoogleMaps - options argument is not an object");
      
      var canvas = self.$('.map-canvas').get(0);

      GoogleMaps._create(data.name, {
        instance: new google.maps.Map(canvas, data.options),
        options: data.options
      });
    }
  });
};
