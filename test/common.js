// Generated by CoffeeScript 1.7.1
(function() {
  var Cam, assert, serverMockup;

  assert = require('assert');

  Cam = require('../lib/onvif').Cam;

  serverMockup = require('./serverMockup');

  describe('Simple and common get functions', function() {
    var cam;
    cam = null;
    before(function(done) {
      var options;
      options = {
        hostname: process.env.HOSTNAME || 'localhost',
        username: 'admin',
        password: '9999',
        port: process.env.PORT ? parseInt(process.env.PORT) : 10101
      };
      return cam = new Cam(options, done);
    });
    describe('_request', function() {
      it('brokes when no arguments are passed', function(done) {
        assert.throws(function() {
          return cam._request();
        });
        return done();
      });
      it('brokes when no callback is passed', function(done) {
        assert.throws(function() {
          return cam._request({});
        });
        return done();
      });
      it('brokes when no options.body is passed', function(done) {
        assert.throws(function() {
          return cam._request({}, function() {
            return {};
          });
        });
        return done();
      });
      it('should return an error message when request is bad', function(done) {
        return cam._request({
          body: 'test'
        }, function(err) {
          assert.notEqual(err, null);
          return done();
        });
      });
      it('should return an error message when the network is unreachible', function(done) {
        var host;
        host = cam.hostname;
        cam.hostname = 'wrong hostname';
        return cam._request({
          body: 'test'
        }, function(err) {
          assert.notEqual(err, null);
          cam.hostname = host;
          return done();
        });
      });
      it('should not work with the PTZ option but without ptzUri property', function(done) {
        var ptzUri;
        ptzUri = cam.ptzUri;
        delete cam.ptzUri;
        return cam._request({
          body: 'test',
          ptz: true
        }, function(err) {
          assert.notEqual(err, null);
          cam.ptzUri = ptzUri;
          return done();
        });
      });
      it('should work nice with the proper request body', function(done) {
        return cam._request({
          body: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' + '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' + '<GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/>' + '</s:Body>' + '</s:Envelope>'
        }, function(err) {
          assert.equal(err, null);
          return done();
        });
      });
      return it('should handle SOAP Fault as an error (http://www.onvif.org/onvif/ver10/tc/onvif_core_ver10.pdf, pp.45-46)', function(done) {
        return cam._request({
          body: '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' + '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' + '<UnknownCommand xmlns="http://www.onvif.org/ver10/device/wsdl"/>' + '</s:Body>' + '</s:Envelope>'
        }, function(err) {
          assert.notEqual(err, null);
          assert.ok(err instanceof Error);
          return done();
        });
      });
    });
    describe('connect', function() {
      it('should connect to the cam, fill startup properties', function(done) {
        return cam.connect(function(err) {
          assert.equal(err, null);
          assert.ok(cam.capabilities);
          assert.ok(cam.ptzUri);
          assert.ok(cam.videoSources);
          assert.ok(cam.profiles);
          assert.ok(cam.defaultProfile);
          assert.ok(cam.activeSource);
          return done();
        });
      });
      return it('should return an error when upstart is unfinished', function(done) {
        cam.getCapabilities = function(cb) {
          return cb(new Error('error'));
        };
        return cam.connect(function(err) {
          assert.notEqual(err, null);
          delete cam.getCapabilities;
          return done();
        });
      });
    });
    describe('getSystemDateAndTime', function() {
      return it('should return valid date', function(done) {
        return cam.getSystemDateAndTime(function(err, data) {
          assert.equal(err, null);
          assert.ok(data instanceof Date);
          return done();
        });
      });
    });
    describe('getCapabilities', function() {
      it('should return a capabilities object with correspondent properties and also set them into #capability property', function(done) {
        return cam.getCapabilities(function(err, data) {
          assert.equal(err, null);
          assert.ok(cam.profiles.every(function(profile) {
            return ['name', 'videoSourceConfiguration', 'videoEncoderConfiguration', 'PTZConfiguration'].every(function(prop) {
              return profile[prop];
            });
          }));
          assert.equal(cam.capabilities, data);
          return done();
        });
      });
      return it('should store PTZ link in ptzUri property', function(done) {
        assert.equal(cam.ptzUri.href, cam.capabilities.PTZ.XAddr);
        return done();
      });
    });
    describe('getServiceCapabilities', function() {
      return it('should return a service capabilities object and also set them into #serviceCapabilities property', function(done) {
        return cam.getServiceCapabilities(function(err, data) {
          assert.equal(err, null);
          assert.ok(['network', 'security', 'system', 'auxiliaryCommands'].every(function(prop) {
            return data[prop];
          }));
          assert.equal(cam.serviceCapabilities, data);
          return done();
        });
      });
    });
    describe('getVideoSources', function() {
      return it('should return a videosources object with correspondent properties and also set them into videoSources property', function(done) {
        return cam.getVideoSources(function(err, data) {
          assert.equal(err, null);
          assert.ok(['$', 'framerate', 'resolution'].every(function(prop) {
            return data[prop] !== void 0;
          }));
          assert.equal(cam.videoSources, data);
          return done();
        });
      });
    });
    describe('getProfiles', function() {
      return it('should create an array of profile objects with correspondent properties', function(done) {
        return cam.getVideoSources(function(err, data) {
          assert.equal(err, null);
          assert.ok(['$', 'framerate', 'resolution'].every(function(prop) {
            return data[prop] !== void 0;
          }));
          assert.equal(cam.videoSources, data);
          return done();
        });
      });
    });
    describe('getServices', function() {
      return it('should return an array of services objects', function(done) {
        return cam.getServices(function(err, data) {
          assert.equal(err, null);
          assert.ok(Array.isArray(data));
          assert.ok(data.every(function(service) {
            return service.namespace && service.XAddr && service.version;
          }));
          return done();
        });
      });
    });
    describe('getDeviceInformation', function() {
      return it('should return an information about device', function(done) {
        return cam.getDeviceInformation(function(err, data) {
          assert.equal(err, null);
          assert.ok(['manufacturer', 'model', 'firmwareVersion', 'serialNumber', 'hardwareId'].every(function(prop) {
            return data[prop] !== void 0;
          }));
          assert.equal(cam.deviceInformation, data);
          return done();
        });
      });
    });
    describe('getStreamUri', function() {
      return it('should return a media stream uri', function(done) {
        return cam.getStreamUri({
          protocol: 'HTTP'
        }, function(err, data) {
          assert.equal(err, null);
          assert.ok(['uri', 'invalidAfterConnect', 'invalidAfterReboot', 'timeout'].every(function(prop) {
            return data[prop] !== void 0;
          }));
          return done();
        });
      });
    });
    describe('getPresets', function() {
      return it('should return array of preset objects and sets them to #presets', function(done) {
        return cam.getPresets({}, function(err, data) {
          assert.equal(err, null);
          assert.ok(Object.keys(data).every(function(presetName) {
            return typeof data[presetName] === 'string';
          }));
          assert.equal(cam.presets, data);
          return done();
        });
      });
    });
    describe('getNodes', function() {
      return it('should return object of nodes and sets them to #nodes', function(done) {
        return cam.getNodes(function(err, data) {
          assert.equal(err, null);
          assert.ok(typeof data === 'object');
          assert.deepEqual(cam.nodes, data);
          return done();
        });
      });
    });
    describe('getConfigurations', function() {
      return it('should return object of configurations and sets them to #configurations', function(done) {
        return cam.getConfigurations(function(err, data) {
          assert.equal(err, null);
          assert.ok(typeof data === 'object');
          assert.deepEqual(cam.configurations, data);
          return done();
        });
      });
    });
    describe('getConfigurationOptions', function() {
      return it('should return an options object for every configuation token', function(done) {
        var cou, tokens;
        tokens = Object.keys(cam.configurations);
        cou = tokens.length;
        return tokens.forEach(function(token) {
          return cam.getConfigurationOptions(token, function(err, data) {
            assert.equal(err, null);
            assert.ok(typeof data === 'object');
            if (!(--cou)) {
              return done();
            }
          });
        });
      });
    });
    describe('absolute move', function() {
      it('should returns empty RelativeResponseObject', function(done) {
        return cam.absoluteMove({
          positionPanTiltX: 1,
          positionPanTiltY: 1,
          zoom: 1
        }, done);
      });
      return it('should works without callback', function() {
        return cam.absoluteMove({
          positionPanTiltX: 1,
          positionPanTiltY: 1,
          zoom: 1
        });
      });
    });
    describe('relative move', function() {
      it('should returns empty RelativeResponseObject', function(done) {
        return cam.relativeMove({
          speedPanTiltX: 1,
          speedPanTiltY: 1,
          translationPanTiltX: 1,
          translationPanTiltY: 1,
          zoom: 1
        }, done);
      });
      return it('should works without callback', function() {
        return cam.relativeMove({
          speed: {
            x: 1,
            y: 1
          },
          x: 1,
          y: 1,
          zoom: 1
        });
      });
    });
    return describe('getStatus', function() {
      return it('should returns position status', function(done) {
        return cam.getStatus({}, function(err, data) {
          assert.equal(err, null);
          return done();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=common.map
