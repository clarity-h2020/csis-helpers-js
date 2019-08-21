'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var log = _interopDefault(require('loglevel'));
var axios = _interopDefault(require('axios'));

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var csisClient = axios.create({
  credentials: 'include'
});
csisClient.defaults.headers.common['Accept'] = 'application/vnd.api+json';
csisClient.defaults.headers.common['Content-Type'] = 'application/vnd.api+json';
/**
 * Get the X-CSRF Token from the CSIS API. Usually needed only for PUT, POST and PATCH requests.
 * 
 * @param {String} csisBaseUrl 
 */

var getXCsrfToken =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var csisBaseUrl,
        apiResponse,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            csisBaseUrl = _args.length > 0 && _args[0] !== undefined ? _args[0] : 'https://csis.myclimateservice.eu';
            _context.next = 3;
            return csisClient.get(csisBaseUrl + "/rest/session/token");

          case 3:
            apiResponse = _context.sent;
            // introduce ugly side effect:
            csisClient.defaults.headers.post['X-CSRF-Token'] = apiResponse.data;
            return _context.abrupt("return", apiResponse.data);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getXCsrfToken() {
    return _ref.apply(this, arguments);
  };
}();
/**
* Gets EMIKAT Credentials from Drupal JSON API and return a headers object
* ready to be used with axios.
*
* @param {String} csisBaseUrl
* @return {Promise<Object>}
*/

var getEmikatCredentialsFromCsis =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var csisBaseUrl,
        apiResponse,
        userResponse,
        _args2 = arguments;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            csisBaseUrl = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'https://csis.myclimateservice.eu';
            _context2.prev = 1;
            _context2.next = 4;
            return csisClient.get(csisBaseUrl + '/jsonapi', {
              credentials: 'include'
            });

          case 4:
            apiResponse = _context2.sent;
            _context2.next = 7;
            return csisClient.get(apiResponse.data.meta.links.me.href, {
              credentials: 'include'
            });

          case 7:
            userResponse = _context2.sent;

            if (!userResponse.data.data.attributes.field_basic_auth_credentials) {
              _context2.next = 12;
              break;
            }

            return _context2.abrupt("return", 'Basic ' + btoa(userResponse.data.data.attributes.field_basic_auth_credentials));

          case 12:
            log.error('no field field_basic_auth_credentials in user profile ' + userResponse.data.data.attributes.name);
            return _context2.abrupt("return", null);

          case 14:
            _context2.next = 20;
            break;

          case 16:
            _context2.prev = 16;
            _context2.t0 = _context2["catch"](1);
            console.error("could not fetch emikat credentials from $csisBaseUrl", _context2.t0); // return null;

            throw _context2.t0;

          case 20:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 16]]);
  }));

  return function getEmikatCredentialsFromCsis() {
    return _ref2.apply(this, arguments);
  };
}();
/**
* Gets the Study Node  from Drupal JSON API
*
* @param {String} studyUuid
* @param {String} [include ]
* @param {String} [csisBaseUrl]
* @return {Object}
*/

var getStudyGroupNodeFromCsis =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(studyUuid) {
    var include,
        csisBaseUrl,
        requestUrl,
        apiResponse,
        _args3 = arguments;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            include = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 'field_data_package,field_data_package.field_resources,field_data_package.field_resources.field_resource_tags,field_data_package.field_resources.field_references';
            csisBaseUrl = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : 'https://csis.myclimateservice.eu';
            requestUrl = csisBaseUrl + '/jsonapi/group/study/' + studyUuid + '?include=' + include;
            _context3.prev = 3;
            log.debug('fetching study from CSOS API:' + requestUrl);
            _context3.next = 7;
            return csisClient.get(requestUrl, {
              credentials: 'include'
            });

          case 7:
            apiResponse = _context3.sent;
            return _context3.abrupt("return", apiResponse.data);

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](3);
            console.error("could not fetch study from ".concat(requestUrl), _context3.t0);
            throw _context3.t0;

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 11]]);
  }));

  return function getStudyGroupNodeFromCsis(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var CSISRemoteHelpers = /*#__PURE__*/Object.freeze({
  csisClient: csisClient,
  getXCsrfToken: getXCsrfToken,
  getEmikatCredentialsFromCsis: getEmikatCredentialsFromCsis,
  getStudyGroupNodeFromCsis: getStudyGroupNodeFromCsis
});

var EMIKAT_STUDY_ID = '$emikat_id';
var emikatClient = axios.create();
/**
 * 
 * @param {String} url
 * @param {String} emikatCredentials
 * @throws
 */

function fetchData(_x, _x2) {
  return _fetchData.apply(this, arguments);
}

function _fetchData() {
  _fetchData = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(url, emikatCredentials) {
    var response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            console.log('fetching from EMIKAT:' + url);
            _context.next = 4;
            return emikatClient.get(url, {
              headers: {
                Authorization: emikatCredentials
              }
            });

          case 4:
            response = _context.sent;
            return _context.abrupt("return", response);

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            console.error('could not fetch EMIKAT data from ' + url, _context.t0);
            throw _context.t0;

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  }));
  return _fetchData.apply(this, arguments);
}
/**
 * 
 * @param {*} url 
 * @param {*} authString 
 * @deprecated
 */

function fetchUsers(_x3, _x4) {
  return _fetchUsers.apply(this, arguments);
}

function _fetchUsers() {
  _fetchUsers = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(url, authString) {
    var response;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            console.log('fetching from:' + url);
            _context2.next = 4;
            return emikatClient.get(url, {
              headers: {
                Authorization: authString
              }
            });

          case 4:
            response = _context2.sent;
            // we *could* do once:  
            emikatClient.defaults.headers.common['Authorization'] = authString; // but that would break functional code as it has side effects on the emikatClient instance.
            //console.log(JSON.stringify(response));

            return _context2.abrupt("return", response);

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](0);
            console.error(_context2.t0);
            throw _context2.t0;

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 9]]);
  }));
  return _fetchUsers.apply(this, arguments);
}
/**
 * Replaces EMIKAT_STUDY_ID with the actual study id.
 * Note: We *could* use template strings in a fixed URL,  e.g.
 * `https://service.emikat.at/EmiKatTst/api/scenarios/${emikat_id}/feature/view.2812/table/data`
 * However, this has to many drawbacks
 * 
 * @param {string} urlTemplate 
 * @param {number} emikatId 
 */

function addEmikatId(urlTemplate, emikatId) {
  var url = urlTemplate.replace(EMIKAT_STUDY_ID, emikatId);
  return url;
}
/**
 * Generates a simple column definition for ReactTable from EMIKAT tabular Data
 * 
 * @param {Object[]} columns 
 * @return {Object[]}
 */

function generateColumns(columnnames) {
  // add parentheses around the entire body `({})` to force the parser to treat the object literal 
  // as an expression so that it's not treated as a block statement.
  return columnnames.map(function (columnname, index) {
    return {
      id: columnname,
      // Required because our accessor is not a string
      Header: columnname,
      accessor: function accessor(row) {
        return row.values[index];
      } // Custom value accessors!

    };
  });
}
function sum(a, b) {
  return a + b;
}
/**
 * We can either use "import EMIKATHelpers from './EMIKATHelpers.js'" and call  "EMIKATHelpers.getIncludedObject(...)" or
 * "import {getIncludedObject} from './EMIKATHelpers.js'" and call "getIncludedObject(...)".
 */

var EMIKATHelpers = /*#__PURE__*/Object.freeze({
  EMIKAT_STUDY_ID: EMIKAT_STUDY_ID,
  fetchData: fetchData,
  fetchUsers: fetchUsers,
  addEmikatId: addEmikatId,
  generateColumns: generateColumns,
  sum: sum
});

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var wicket = createCommonjsModule(function (module, exports) {
/** @license
 *
 *  Copyright (C) 2012 K. Arthur Endsley (kaendsle@mtu.edu)
 *  Michigan Tech Research Institute (MTRI)
 *  3600 Green Court, Suite 100, Ann Arbor, MI, 48105
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

(function (root, factory) {

    {
        // CommonJS
        module.exports = factory();
    }
}(commonjsGlobal, function () {


    var beginsWith, endsWith, Wkt;

    /**
     * @desc The Wkt namespace.
     * @property    {String}    delimiter   - The default delimiter for separating components of atomic geometry (coordinates)
     * @namespace
     * @global
     */
    Wkt = function (obj) {
        if (obj instanceof Wkt) return obj;
        if (!(this instanceof Wkt)) return new Wkt(obj);
        this._wrapped = obj;
    };



    /**
     * Returns true if the substring is found at the beginning of the string.
     * @param   str {String}    The String to search
     * @param   sub {String}    The substring of interest
     * @return      {Boolean}
     * @private
     */
    beginsWith = function (str, sub) {
        return str.substring(0, sub.length) === sub;
    };

    /**
     * Returns true if the substring is found at the end of the string.
     * @param   str {String}    The String to search
     * @param   sub {String}    The substring of interest
     * @return      {Boolean}
     * @private
     */
    endsWith = function (str, sub) {
        return str.substring(str.length - sub.length) === sub;
    };

    /**
     * The default delimiter for separating components of atomic geometry (coordinates)
     * @ignore
     */
    Wkt.delimiter = ' ';

    /**
     * Determines whether or not the passed Object is an Array.
     * @param   obj {Object}    The Object in question
     * @return      {Boolean}
     * @member Wkt.isArray
     * @method
     */
    Wkt.isArray = function (obj) {
        return !!(obj && obj.constructor === Array);
    };

    /**
     * Removes given character String(s) from a String.
     * @param   str {String}    The String to search
     * @param   sub {String}    The String character(s) to trim
     * @return      {String}    The trimmed string
     * @member Wkt.trim
     * @method
     */
    Wkt.trim = function (str, sub) {
        sub = sub || ' '; // Defaults to trimming spaces
        // Trim beginning spaces
        while (beginsWith(str, sub)) {
            str = str.substring(1);
        }
        // Trim ending spaces
        while (endsWith(str, sub)) {
            str = str.substring(0, str.length - 1);
        }
        return str;
    };

    /**
     * An object for reading WKT strings and writing geographic features
     * @constructor this.Wkt.Wkt
     * @param   initializer {String}    An optional WKT string for immediate read
     * @property            {Array}     components      - Holder for atomic geometry objects (internal representation of geometric components)
     * @property            {String}    delimiter       - The default delimiter for separating components of atomic geometry (coordinates)
     * @property            {Object}    regExes         - Some regular expressions copied from OpenLayers.Format.WKT.js
     * @property            {String}    type            - The Well-Known Text name (e.g. 'point') of the geometry
     * @property            {Boolean}   wrapVerticies   - True to wrap vertices in MULTIPOINT geometries; If true: MULTIPOINT((30 10),(10 30),(40 40)); If false: MULTIPOINT(30 10,10 30,40 40)
     * @return              {this.Wkt.Wkt}
     * @memberof Wkt
     */
    Wkt.Wkt = function (initializer) {

        /**
         * The default delimiter between X and Y coordinates.
         * @ignore
         */
        this.delimiter = Wkt.delimiter || ' ';

        /**
         * Configuration parameter for controlling how Wicket seralizes
         * MULTIPOINT strings. Examples; both are valid WKT:
         * If true: MULTIPOINT((30 10),(10 30),(40 40))
         * If false: MULTIPOINT(30 10,10 30,40 40)
         * @ignore
         */
        this.wrapVertices = true;

        /**
         * Some regular expressions copied from OpenLayers.Format.WKT.js
         * @ignore
         */
        this.regExes = {
            'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
            'spaces': /\s+|\+/, // Matches the '+' or the empty space
            'numeric': /-*\d+(\.*\d+)?/,
            'comma': /\s*,\s*/,
            'parenComma': /\)\s*,\s*\(/,
            'coord': /-*\d+\.*\d+ -*\d+\.*\d+/, // e.g. "24 -14"
            'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/,
            'ogcTypes': /^(multi)?(point|line|polygon|box)?(string)?$/i, // Captures e.g. "Multi","Line","String"
            'crudeJson': /^{.*"(type|coordinates|geometries|features)":.*}$/ // Attempts to recognize JSON strings
        };

        /**
         * Strip any whitespace and parens from front and back.
         * This is the equivalent of s/^\s*\(?(.*)\)?\s*$/$1/ but without the risk of catastrophic backtracking.
         * @param   str {String}
         */
        this._stripWhitespaceAndParens = function (fullStr) {
            var trimmed = fullStr.trim();
            var noParens = trimmed.replace(/^\(?(.*?)\)?$/, '$1');
            return noParens;
        };

        /**
         * The internal representation of geometry--the "components" of geometry.
         * @ignore
         */
        this.components = undefined;

        // An initial WKT string may be provided
        if (initializer && typeof initializer === 'string') {
            this.read(initializer);
        } else if (initializer && typeof initializer !== undefined) {
            this.fromObject(initializer);
        }

    };



    /**
     * Returns true if the internal geometry is a collection of geometries.
     * @return  {Boolean}   Returns true when it is a collection
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.isCollection = function () {
        switch (this.type.slice(0, 5)) {
            case 'multi':
                // Trivial; any multi-geometry is a collection
                return true;
            case 'polyg':
                // Polygons with holes are "collections" of rings
                return true;
            default:
                // Any other geometry is not a collection
                return false;
        }
    };

    /**
     * Compares two x,y coordinates for equality.
     * @param   a   {Object}    An object with x and y properties
     * @param   b   {Object}    An object with x and y properties
     * @return      {Boolean}
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.sameCoords = function (a, b) {
        return (a.x === b.x && a.y === b.y);
    };

    /**
     * Sets internal geometry (components) from framework geometry (e.g.
     * Google Polygon objects or google.maps.Polygon).
     * @param   obj {Object}    The framework-dependent geometry representation
     * @return      {this.Wkt.Wkt}   The object itself
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.fromObject = function (obj) {
        var result;

        if (obj.hasOwnProperty('type') && obj.hasOwnProperty('coordinates')) {
            result = this.fromJson(obj);
        } else {
            result = this.deconstruct.call(this, obj);
        }

        this.components = result.components;
        this.isRectangle = result.isRectangle || false;
        this.type = result.type;
        return this;
    };

    /**
     * Creates external geometry objects based on a plug-in framework's
     * construction methods and available geometry classes.
     * @param   config  {Object}    An optional framework-dependent properties specification
     * @return          {Object}    The framework-dependent geometry representation
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.toObject = function (config) {
        var obj = this.construct[this.type].call(this, config);
        // Don't assign the "properties" property to an Array
        if (typeof obj === 'object' && !Wkt.isArray(obj)) {
            obj.properties = this.properties;
        }
        return obj;
    };

    /**
     * Returns the WKT string representation; the same as the write() method.
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.toString = function (config) {
        return this.write();
    };

    /**
     * Parses a JSON representation as an Object.
     * @param	obj	{Object}	An Object with the GeoJSON schema
     * @return	{this.Wkt.Wkt}	The object itself
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.fromJson = function (obj) {
        var i, j, k, coords, iring, oring;

        this.type = obj.type.toLowerCase();
        this.components = [];
        if (obj.hasOwnProperty('geometry')) { //Feature
            this.fromJson(obj.geometry);
            this.properties = obj.properties;
            return this;
        }
        coords = obj.coordinates;

        if (!Wkt.isArray(coords[0])) { // Point
            this.components.push({
                x: coords[0],
                y: coords[1]
            });

        } else {

            for (i in coords) {
                if (coords.hasOwnProperty(i)) {

                    if (!Wkt.isArray(coords[i][0])) { // LineString

                        if (this.type === 'multipoint') { // MultiPoint
                            this.components.push([{
                                x: coords[i][0],
                                y: coords[i][1]
                            }]);

                        } else {
                            this.components.push({
                                x: coords[i][0],
                                y: coords[i][1]
                            });

                        }

                    } else {

                        oring = [];
                        for (j in coords[i]) {
                            if (coords[i].hasOwnProperty(j)) {

                                if (!Wkt.isArray(coords[i][j][0])) {
                                    oring.push({
                                        x: coords[i][j][0],
                                        y: coords[i][j][1]
                                    });

                                } else {

                                    iring = [];
                                    for (k in coords[i][j]) {
                                        if (coords[i][j].hasOwnProperty(k)) {

                                            iring.push({
                                                x: coords[i][j][k][0],
                                                y: coords[i][j][k][1]
                                            });

                                        }
                                    }

                                    oring.push(iring);

                                }

                            }
                        }

                        this.components.push(oring);
                    }
                }
            }

        }

        return this;
    };

    /**
     * Creates a JSON representation, with the GeoJSON schema, of the geometry.
     * @return    {Object}    The corresponding GeoJSON representation
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.toJson = function () {
        var cs, json, i, j, k, ring, rings;

        cs = this.components;
        json = {
            coordinates: [],
            type: (function () {
                var i, type, s;

                type = this.regExes.ogcTypes.exec(this.type).slice(1);
                s = [];

                for (i in type) {
                    if (type.hasOwnProperty(i)) {
                        if (type[i] !== undefined) {
                            s.push(type[i].toLowerCase().slice(0, 1).toUpperCase() + type[i].toLowerCase().slice(1));
                        }
                    }
                }

                return s;
            }.call(this)).join('')
        };

        // Wkt BOX type gets a special bbox property in GeoJSON
        if (this.type.toLowerCase() === 'box') {
            json.type = 'Polygon';
            json.bbox = [];

            for (i in cs) {
                if (cs.hasOwnProperty(i)) {
                    json.bbox = json.bbox.concat([cs[i].x, cs[i].y]);
                }
            }

            json.coordinates = [
                [
                    [cs[0].x, cs[0].y],
                    [cs[0].x, cs[1].y],
                    [cs[1].x, cs[1].y],
                    [cs[1].x, cs[0].y],
                    [cs[0].x, cs[0].y]
                ]
            ];

            return json;
        }

        // For the coordinates of most simple features
        for (i in cs) {
            if (cs.hasOwnProperty(i)) {

                // For those nested structures
                if (Wkt.isArray(cs[i])) {
                    rings = [];

                    for (j in cs[i]) {
                        if (cs[i].hasOwnProperty(j)) {

                            if (Wkt.isArray(cs[i][j])) { // MULTIPOLYGONS
                                ring = [];

                                for (k in cs[i][j]) {
                                    if (cs[i][j].hasOwnProperty(k)) {
                                        ring.push([cs[i][j][k].x, cs[i][j][k].y]);
                                    }
                                }

                                rings.push(ring);

                            } else { // POLYGONS and MULTILINESTRINGS

                                if (cs[i].length > 1) {
                                    rings.push([cs[i][j].x, cs[i][j].y]);

                                } else { // MULTIPOINTS
                                    rings = rings.concat([cs[i][j].x, cs[i][j].y]);
                                }
                            }
                        }
                    }

                    json.coordinates.push(rings);

                } else {
                    if (cs.length > 1) { // For LINESTRING type
                        json.coordinates.push([cs[i].x, cs[i].y]);

                    } else { // For POINT type
                        json.coordinates = json.coordinates.concat([cs[i].x, cs[i].y]);
                    }
                }

            }
        }

        return json;
    };

    /**
     * Absorbs the geometry of another this.Wkt.Wkt instance, merging it with its own,
     * creating a collection (MULTI-geometry) based on their types, which must agree.
     * For example, creates a MULTIPOLYGON from a POLYGON type merged with another
     * POLYGON type, or adds a POLYGON instance to a MULTIPOLYGON instance.
     * @param   wkt {String}    A Wkt.Wkt object
     * @return	{this.Wkt.Wkt}	The object itself
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.merge = function (wkt) {
        var prefix = this.type.slice(0, 5);

        if (this.type !== wkt.type) {
            if (this.type.slice(5, this.type.length) !== wkt.type) {
                throw TypeError('The input geometry types must agree or the calling this.Wkt.Wkt instance must be a multigeometry of the other');
            }
        }

        switch (prefix) {

            case 'point':
                this.components = [this.components.concat(wkt.components)];
                break;

            case 'multi':
                this.components = this.components.concat((wkt.type.slice(0, 5) === 'multi') ? wkt.components : [wkt.components]);
                break;

            default:
                this.components = [
                    this.components,
                    wkt.components
                ];
                break;

        }

        if (prefix !== 'multi') {
            this.type = 'multi' + this.type;
        }
        return this;
    };

    /**
     * Reads a WKT string, validating and incorporating it.
     * @param   str {String}    A WKT or GeoJSON string
     * @return	{this.Wkt.Wkt}	The object itself
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.read = function (str) {
        var matches;
        matches = this.regExes.typeStr.exec(str);
        if (matches) {
            this.type = matches[1].toLowerCase();
            this.base = matches[2];
            if (this.ingest[this.type]) {
                this.components = this.ingest[this.type].apply(this, [this.base]);
            }

        } else {
            if (this.regExes.crudeJson.test(str)) {
                if (typeof JSON === 'object' && typeof JSON.parse === 'function') {
                    this.fromJson(JSON.parse(str));

                } else {
                    console.log('JSON.parse() is not available; cannot parse GeoJSON strings');
                    throw {
                        name: 'JSONError',
                        message: 'JSON.parse() is not available; cannot parse GeoJSON strings'
                    };
                }

            } else {
                console.log('Invalid WKT string provided to read()');
                throw {
                    name: 'WKTError',
                    message: 'Invalid WKT string provided to read()'
                };
            }
        }

        return this;
    }; // eo readWkt

    /**
     * Writes a WKT string.
     * @param   components  {Array}     An Array of internal geometry objects
     * @return              {String}    The corresponding WKT representation
     * @memberof this.Wkt.Wkt
     * @method
     */
    Wkt.Wkt.prototype.write = function (components) {
        var i, pieces, data;

        components = components || this.components;

        pieces = [];

        pieces.push(this.type.toUpperCase() + '(');

        for (i = 0; i < components.length; i += 1) {
            if (this.isCollection() && i > 0) {
                pieces.push(',');
            }

            // There should be an extract function for the named type
            if (!this.extract[this.type]) {
                return null;
            }

            data = this.extract[this.type].apply(this, [components[i]]);
            if (this.isCollection() && this.type !== 'multipoint') {
                pieces.push('(' + data + ')');

            } else {
                pieces.push(data);

                // If not at the end of the components, add a comma
                if (i !== (components.length - 1) && this.type !== 'multipoint') {
                    pieces.push(',');
                }

            }
        }

        pieces.push(')');

        return pieces.join('');
    };

    /**
     * This object contains functions as property names that extract WKT
     * strings from the internal representation.
     * @memberof this.Wkt.Wkt
     * @namespace this.Wkt.Wkt.extract
     * @instance
     */
    Wkt.Wkt.prototype.extract = {
        /**
         * Return a WKT string representing atomic (point) geometry
         * @param   point   {Object}    An object with x and y properties
         * @return          {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        point: function (point) {
            return String(point.x) + this.delimiter + String(point.y);
        },

        /**
         * Return a WKT string representing multiple atoms (points)
         * @param   multipoint  {Array}     Multiple x-and-y objects
         * @return              {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        multipoint: function (multipoint) {
            var i, parts = [],
                s;

            for (i = 0; i < multipoint.length; i += 1) {
                s = this.extract.point.apply(this, [multipoint[i]]);

                if (this.wrapVertices) {
                    s = '(' + s + ')';
                }

                parts.push(s);
            }

            return parts.join(',');
        },

        /**
         * Return a WKT string representing a chain (linestring) of atoms
         * @param   linestring  {Array}     Multiple x-and-y objects
         * @return              {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        linestring: function (linestring) {
            // Extraction of linestrings is the same as for points
            return this.extract.point.apply(this, [linestring]);
        },

        /**
         * Return a WKT string representing multiple chains (multilinestring) of atoms
         * @param   multilinestring {Array}     Multiple of multiple x-and-y objects
         * @return                  {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        multilinestring: function (multilinestring) {
            var i, parts = [];

            if (multilinestring.length) {
                for (i = 0; i < multilinestring.length; i += 1) {
                    parts.push(this.extract.linestring.apply(this, [multilinestring[i]]));
                }
            } else {
                parts.push(this.extract.point.apply(this, [multilinestring]));
            }

            return parts.join(',');
        },

        /**
         * Return a WKT string representing multiple atoms in closed series (polygon)
         * @param   polygon {Array}     Collection of ordered x-and-y objects
         * @return          {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        polygon: function (polygon) {
            // Extraction of polygons is the same as for multilinestrings
            return this.extract.multilinestring.apply(this, [polygon]);
        },

        /**
         * Return a WKT string representing multiple closed series (multipolygons) of multiple atoms
         * @param   multipolygon    {Array}     Collection of ordered x-and-y objects
         * @return                  {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        multipolygon: function (multipolygon) {
            var i, parts = [];
            for (i = 0; i < multipolygon.length; i += 1) {
                parts.push('(' + this.extract.polygon.apply(this, [multipolygon[i]]) + ')');
            }
            return parts.join(',');
        },

        /**
         * Return a WKT string representing a 2DBox
         * @param   multipolygon    {Array}     Collection of ordered x-and-y objects
         * @return                  {String}    The WKT representation
         * @memberof this.Wkt.Wkt.extract
         * @instance
         */
        box: function (box) {
            return this.extract.linestring.apply(this, [box]);
        },

        geometrycollection: function (str) {
            console.log('The geometrycollection WKT type is not yet supported.');
        }
    };

    /**
     * This object contains functions as property names that ingest WKT
     * strings into the internal representation.
     * @memberof this.Wkt.Wkt
     * @namespace this.Wkt.Wkt.ingest
     * @instance
     */
    Wkt.Wkt.prototype.ingest = {

        /**
         * Return point feature given a point WKT fragment.
         * @param   str {String}    A WKT fragment representing the point
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        point: function (str) {
            var coords = Wkt.trim(str).split(this.regExes.spaces);
            // In case a parenthetical group of coordinates is passed...
            return [{ // ...Search for numeric substrings
                x: parseFloat(this.regExes.numeric.exec(coords[0])[0]),
                y: parseFloat(this.regExes.numeric.exec(coords[1])[0])
            }];
        },

        /**
         * Return a multipoint feature given a multipoint WKT fragment.
         * @param   str {String}    A WKT fragment representing the multipoint
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        multipoint: function (str) {
            var i, components, points;
            components = [];
            points = Wkt.trim(str).split(this.regExes.comma);
            for (i = 0; i < points.length; i += 1) {
                components.push(this.ingest.point.apply(this, [points[i]]));
            }
            return components;
        },

        /**
         * Return a linestring feature given a linestring WKT fragment.
         * @param   str {String}    A WKT fragment representing the linestring
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        linestring: function (str) {
            var i, multipoints, components;

            // In our x-and-y representation of components, parsing
            //  multipoints is the same as parsing linestrings
            multipoints = this.ingest.multipoint.apply(this, [str]);

            // However, the points need to be joined
            components = [];
            for (i = 0; i < multipoints.length; i += 1) {
                components = components.concat(multipoints[i]);
            }
            return components;
        },

        /**
         * Return a multilinestring feature given a multilinestring WKT fragment.
         * @param   str {String}    A WKT fragment representing the multilinestring
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        multilinestring: function (str) {
            var i, components, line, lines;
            components = [];

            lines = Wkt.trim(str).split(this.regExes.doubleParenComma);
            if (lines.length === 1) { // If that didn't work...
                lines = Wkt.trim(str).split(this.regExes.parenComma);
            }

            for (i = 0; i < lines.length; i += 1) {
                line = this._stripWhitespaceAndParens(lines[i]);
                components.push(this.ingest.linestring.apply(this, [line]));
            }

            return components;
        },

        /**
         * Return a polygon feature given a polygon WKT fragment.
         * @param   str {String}    A WKT fragment representing the polygon
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        polygon: function (str) {
            var i, j, components, subcomponents, ring, rings;
            rings = Wkt.trim(str).split(this.regExes.parenComma);
            components = []; // Holds one or more rings
            for (i = 0; i < rings.length; i += 1) {
                ring = this._stripWhitespaceAndParens(rings[i]).split(this.regExes.comma);
                subcomponents = []; // Holds the outer ring and any inner rings (holes)
                for (j = 0; j < ring.length; j += 1) {
                    // Split on the empty space or '+' character (between coordinates)
                    var split = ring[j].split(this.regExes.spaces);
                    if (split.length > 2) {
                        //remove the elements which are blanks
                        split = split.filter(function (n) {
                            return n != ""
                        });
                    }
                    if (split.length === 2) {
                        var x_cord = split[0];
                        var y_cord = split[1];

                        //now push
                        subcomponents.push({
                            x: parseFloat(x_cord),
                            y: parseFloat(y_cord)
                        });
                    }
                }
                components.push(subcomponents);
            }
            return components;
        },

        /**
         * Return box vertices (which would become the Rectangle bounds) given a Box WKT fragment.
         * @param   str {String}    A WKT fragment representing the box
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        box: function (str) {
            var i, multipoints, components;

            // In our x-and-y representation of components, parsing
            //  multipoints is the same as parsing linestrings
            multipoints = this.ingest.multipoint.apply(this, [str]);

            // However, the points need to be joined
            components = [];
            for (i = 0; i < multipoints.length; i += 1) {
                components = components.concat(multipoints[i]);
            }

            return components;
        },

        /**
         * Return a multipolygon feature given a multipolygon WKT fragment.
         * @param   str {String}    A WKT fragment representing the multipolygon
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        multipolygon: function (str) {
            var i, components, polygon, polygons;
            components = [];
            polygons = Wkt.trim(str).split(this.regExes.doubleParenComma);
            for (i = 0; i < polygons.length; i += 1) {
                polygon = this._stripWhitespaceAndParens(polygons[i]);
                components.push(this.ingest.polygon.apply(this, [polygon]));
            }
            return components;
        },

        /**
         * Return an array of features given a geometrycollection WKT fragment.
         * @param   str {String}    A WKT fragment representing the geometry collection
         * @memberof this.Wkt.Wkt.ingest
         * @instance
         */
        geometrycollection: function (str) {
            console.log('The geometrycollection WKT type is not yet supported.');
        }

    }; // eo ingest

    return Wkt;
}));
});

/**
 * Be aware of the difference between default and named exports. It is a common source of mistakes.
 * We suggest that you stick to using default imports and exports when a module only exports a single thing (for example, a component). 
 * That’s what you get when you use export default Button and import Button from './Button'.
 * Named exports are useful for utility modules that export several functions. A module may have at most one default export and as many named exports as you like.
 * 
 * See https://stackoverflow.com/questions/36795819/when-should-i-use-curly-braces-for-es6-import/36796281#36796281
 */

/**
 * Helpers for cSIS API
 * 
 * @author Pascal Dihé
 */

var CSISHelpers =
/*#__PURE__*/
function () {
  function CSISHelpers() {
    _classCallCheck(this, CSISHelpers);
  }

  _createClass(CSISHelpers, null, [{
    key: "getIncludedObject",

    /**
      * Drupal JSON API 'deeply' includes objects, e.g. &include=field_references are provided only once in a separate array name 'included'.
      * This method resolves the references and extracts the included  object.
      * 
      * @param {string} type 
      * @param {number} id 
      * @param {boolean} includedArray 
      * @see https://www.drupal.org/docs/8/modules/jsonapi/includes
     */
    value: function getIncludedObject(type, id, includedArray) {
      if (type != null && id != null) {
        for (var i = 0; i < includedArray.length; ++i) {
          if (includedArray[i].type === type && includedArray[i].id === id) {
            return includedArray[i];
          }
        }
      }

      return null;
    }
    /**
     * Retrieves the EMIKAT Study / Scenario ID from the Drupal Study
     * 
     * @param {Object} studyGroupNode
     * @return {Number}
     */

  }, {
    key: "extractEmikatIdFromStudyGroupNode",
    value: function extractEmikatIdFromStudyGroupNode(studyGroupNode) {
      var emikatId = -1;

      if (studyGroupNode.attributes.field_emikat_id !== undefined && studyGroupNode.attributes.field_emikat_id != null && !isNaN(studyGroupNode.attributes.field_emikat_id)) {
        emikatId = parseInt(studyGroupNode.attributes.field_emikat_id, 10);
      } else {
        log.warn('no emikat id in study ' + studyGroupNode.attributes.field_emikat_id);
      }

      return emikatId;
    }
    /**
     * Returns the JSON representation of the study area.
     * 
     * @param {Object} studyGroupNode 
     * @returns {JSON}
     */

  }, {
    key: "extractStudyAreaFromStudyGroupNode",
    value: function extractStudyAreaFromStudyGroupNode(studyGroupNode) {
      /**
       * @type {Wkt}
       */
      var studyArea = new wicket.Wkt();

      if (studyGroupNode.attributes.field_area != null && studyGroupNode.attributes.field_area.value != null) {
        studyArea.read(studyGroupNode.attributes.field_area.value);
      } else {
        log.warn('no study area in study ' + studyGroupNode);
      }

      var studyAreaJson = studyArea.toJson();
      return studyAreaJson;
    }
    /**
     * Filters resource array by tag id/name which are included in the tags array (due to Drupal API quirks).
     * 
     * @param {Object[]} resourceArray the original resource array
     * @param {Object[]} tagsArray included objects - Drupal APi style! :-/
     * @param {string} tagType The tag type, e.g. 'taxonomy_term--eu_gl'
     * @param {string} tagName The name of the tag, e.g.'eu-gl:hazard-characterization:local-effects'
     * @return {Object[]}
     * @see getIncludedObject()
     */

  }, {
    key: "filterResourcesbyTagName",
    value: function filterResourcesbyTagName(resourceArray, tagsArray, tagType, tagName) {
      /**
       * If we request exactly **one** resource, there would be a possibility for simplification that applies to all taxonomy terms and tags: 
       * Instead of looking at `resource.relationships.field_resource_tags.data` we just have to search in `tagsArray` (included objects, respectively).
       */
      var filteredResourceArray = resourceArray.filter(function (resource) {
        if (resource.relationships.field_resource_tags != null && resource.relationships.field_resource_tags.data != null && resource.relationships.field_resource_tags.data.length > 0) {
          return resource.relationships.field_resource_tags.data.some(function (tagReference) {
            return tagReference.type === tagType ? tagsArray.some(function (tagObject) {
              return tagReference.type === tagObject.type && tagReference.id === tagObject.id && tagObject.attributes.name === tagName;
            }) : false;
          });
        } else {
          log.warn('no tags found  in resource ' + resource.id);
        }

        return false;
      });
      log.debug(filteredResourceArray.length + ' resources left after filtering ' + resourceArray.length + ' resources by tag type ' + tagType + ' and tag name ' + tagName);
      return filteredResourceArray;
    }
    /**
       * Filters resource array by reference type which are included in the references array (due to Drupal API quirks).
       * 
       * @param {Object[]} resourceArray the original resource array
       * @param {Object[]} referencesArray included objects - Drupal APi style! :-/
       * @param {string} referenceType The reference type, e.g. '@mapview:ogc:wms'
       * @return {Object[]}
       * @see getIncludedObject()
       */

  }, {
    key: "filterResourcesbyReferenceType",
    value: function filterResourcesbyReferenceType(resourceArray, referencesArray, referenceType) {
      var filteredResourceArray = resourceArray.filter(function (resource) {
        if (resource.relationships.field_references != null && resource.relationships.field_references.data != null && resource.relationships.field_references.data.length > 0) {
          return resource.relationships.field_references.data.some(function (referenceReference) {
            return referencesArray.some(function (referenceObject) {
              return referenceReference.type === referenceObject.type && referenceReference.id === referenceObject.id && referenceObject.attributes.field_reference_type === referenceType;
            });
          });
        } else {
          log.warn('no references found  in resource ' + resource.id);
        }

        return false;
      }); // ES6 template string: https://eslint.org/docs/rules/no-template-curly-in-string

      log.debug("".concat(filteredResourceArray.length, " resources left after filtering ").concat(resourceArray.length, " resources by reference type ").concat(referenceType));
      return filteredResourceArray;
    }
    /**
        * Extracts references which are included in the references array (due to Drupal API quirks) from a resource
        * 
        * @param {Object} resource the original resource
        * @param {Object[]} referencesArray included objects - Drupal APi style! :-/
        * @param {string} referenceType The reference type, e.g. '@mapview:ogc:wms'
        * @return {Object[]}
        * @see getIncludedObject()
        */

  }, {
    key: "extractReferencesfromResource",
    value: function extractReferencesfromResource(resource, referencesArray, referenceType) {
      var references = []; // the reference type is avialble only at the level of the `included` array

      if (resource.relationships.field_references != null && resource.relationships.field_references.data != null && resource.relationships.field_references.data.length > 0) {
        references = resource.relationships.field_references.data.flatMap(function (referenceReference) {
          var filteredReferences = referencesArray.filter(function (referenceObject) {
            return referenceReference.type === referenceObject.type && referenceReference.id === referenceObject.id && referenceObject.attributes.field_reference_type === referenceType;
          });
          return filteredReferences;
        });
      }

      log.debug("".concat(references.length, " references found in resouce for reference type ").concat(referenceType));
      return references;
    }
    /**
        * Extracts tags which are included in the tags array (due to Drupal API quirks) from a resource
        * 
        * @param {Object} resource the original resource
        * @param {Object[]} tagsArray included objects - Drupal APi style! :-/
        * @param {string} tagType The tag type, e.g. '@mapview:ogc:wms'
        * @return {Object[]}
        * @see getIncludedObject()
        */

  }, {
    key: "extractTagsfromResource",
    value: function extractTagsfromResource(resource, tagsArray, tagType) {
      var tags = [];

      if (resource.relationships.field_resource_tags != null && resource.relationships.field_resource_tags.data != null && resource.relationships.field_resource_tags.data.length > 0) {
        tags = resource.relationships.field_resource_tags.data.flatMap(function (tagReference) {
          return tagReference.type === tagType ? tagsArray.filter(function (tagObject) {
            return tagReference.type === tagObject.type && tagReference.id === tagObject.id;
          }) : [];
        });
      }

      log.debug("".concat(tags.length, " tags found in resouce for tag type ").concat(tagType));
      return tags;
    }
  }]);

  return CSISHelpers;
}();
var extractEmikatIdFromStudyGroupNode = CSISHelpers.extractEmikatIdFromStudyGroupNode;
var getIncludedObject = CSISHelpers.getIncludedObject;
var filterResourcesbyTagName = CSISHelpers.filterResourcesbyTagName;
var filterResourcesbyReferenceType = CSISHelpers.filterResourcesbyReferenceType;
var extractReferencesfromResource = CSISHelpers.extractReferencesfromResource;
var extractTagsfromResource = CSISHelpers.extractTagsfromResource;
var extractStudyAreaFromStudyGroupNode = CSISHelpers.extractStudyAreaFromStudyGroupNode;

var CSISHelpers$1 = /*#__PURE__*/Object.freeze({
  'default': CSISHelpers,
  extractEmikatIdFromStudyGroupNode: extractEmikatIdFromStudyGroupNode,
  getIncludedObject: getIncludedObject,
  filterResourcesbyTagName: filterResourcesbyTagName,
  filterResourcesbyReferenceType: filterResourcesbyReferenceType,
  extractReferencesfromResource: extractReferencesfromResource,
  extractTagsfromResource: extractTagsfromResource,
  extractStudyAreaFromStudyGroupNode: extractStudyAreaFromStudyGroupNode
});

exports.CSISHelpers = CSISHelpers$1;
exports.CSISRemoteHelpers = CSISRemoteHelpers;
exports.EMIKATHelpers = EMIKATHelpers;
//# sourceMappingURL=index.js.map
