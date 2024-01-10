/* jshint -W051:true */
/* eslint-disable */
;(function () {
  'use strict'
  /* eslint-enable */

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief module "internal"
  // /
  // / @file
  // /
  // / DISCLAIMER
  // /
  // / Copyright 2004-2013 triAGENS GmbH, Cologne, Germany
  // /
  // / Licensed under the Apache License, Version 2.0 (the "License")
  // / you may not use this file except in compliance with the License.
  // / You may obtain a copy of the License at
  // /
  // /     http://www.apache.org/licenses/LICENSE-2.0
  // /
  // / Unless required by applicable law or agreed to in writing, software
  // / distributed under the License is distributed on an "AS IS" BASIS,
  // / WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // / See the License for the specific language governing permissions and
  // / limitations under the License.
  // /
  // / Copyright holder is triAGENS GmbH, Cologne, Germany
  // /
  // / @author Dr. Frank Celler
  // / @author Copyright 2010-2013, triAGENS GmbH, Cologne, Germany
  // //////////////////////////////////////////////////////////////////////////////

  var exports = require('internal');

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief hide global variables
  // //////////////////////////////////////////////////////////////////////////////

  if (global.ArangoConnection) {
    exports.ArangoConnection = global.ArangoConnection;
  }

  if (global.SYS_ARANGO) {
    exports.arango = global.SYS_ARANGO;
    delete global.SYS_ARANGO;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief set deadline for external requests & sleeps
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_COMMUNICATE_SLEEP_DEADLINE) {
    exports.SetGlobalExecutionDeadlineTo = global.SYS_COMMUNICATE_SLEEP_DEADLINE;
    delete global.SYS_COMMUNICATE_SLEEP_DEADLINE;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief register signal handler to set the deadline
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_INTERRUPT_TO_DEADLINE) {
    exports.SetSignalToImmediateDeadline = global.SYS_INTERRUPT_TO_DEADLINE;
    delete global.SYS_INTERRUPT_TO_DEADLINE;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief monitor a subprocess
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_ADD_TO_PID_MONITORING) {
    exports.addPidToMonitor = global.SYS_ADD_TO_PID_MONITORING;
    delete global.SYS_ADD_TO_PID_MONITORING;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief unmonitor a sub process
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_REMOVE_FROM_PID_MONITORING) {
    exports.removePidFromMonitor = global.SYS_REMOVE_FROM_PID_MONITORING;
    delete global.SYS_REMOVE_FROM_PID_MONITORING;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief why did the abort trigger?
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_GET_DEADLINE_STRING) {
    exports.getDeadlineReasonString = global.SYS_GET_DEADLINE_STRING;
    delete global.GET_DEADLINE_STRING;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief write-ahead log functionality
  // //////////////////////////////////////////////////////////////////////////////

  exports.wal = {
    flush: function (waitForSync, waitForCollector) {
      var wfs = waitForSync ? 'true' : 'false';
      var wfc = waitForCollector ? 'true' : 'false';
      exports.arango.PUT('/_admin/wal/flush?waitForSync=' + wfs + '&waitForCollector=' + wfc, null);
    },

    properties: function (value) {
      if (value !== undefined) {
        return exports.arango.PUT('/_admin/wal/properties', value);
      }

      return exports.arango.GET('/_admin/wal/properties', '');
    },

    transactions: function () {
      return exports.arango.GET('/_admin/wal/transactions', null);
    }
  };
  
  // //////////////////////////////////////////////////////////////////////////////
  // / @brief client side failpoints functionality
  // //////////////////////////////////////////////////////////////////////////////
  function endpointToURL(endpoint) {
    if (endpoint.substr(0, 6) === 'ssl://') {
      return 'https://' + endpoint.substr(6);
    }
    let pos = endpoint.indexOf('://');
    if (pos === -1) {
      return 'http://' + endpoint;
    }
    return 'http' + endpoint.substr(pos);
  };
  
  exports.debugClearFailAt = function(failAt) {
    const request = require('@arangodb/request');
    const instanceInfo = JSON.parse(exports.env.INSTANCEINFO);
    instanceInfo.arangods.forEach((a) => {
      let res = request.delete({
        url: endpointToURL(a.endpoint) + '/_admin/debug/failat' + (failAt === undefined ? '' : '/' + failAt),
        body: ""});
      if (res.status !== 200) {
        throw "Error removing failure point";
      }
    });
  };

  // On server side the API with failurePointName is called removeFailAt
  exports.debugRemoveFailAt = exports.debugClearFailAt;
  
  exports.debugSetFailAt = function(failAt) {
    const request = require('@arangodb/request');
    const instanceInfo = JSON.parse(exports.env.INSTANCEINFO);
    instanceInfo.arangods.forEach((a) => {
      let res = request.put({
        url: endpointToURL(a.endpoint) + '/_admin/debug/failat/' + failAt,
        body: ""});
      if (res.status !== 200) {
        throw "Error setting failure point";
      }
    });
  };
  
  exports.debugTerminateInstance = function(endpoint) {
    const request = require('@arangodb/request');
    let res = request.put({
      url: endpointToURL(endpoint) + '/_admin/debug/crash',
      body: ""
    });
  };

  exports.debugTerminate = function(endpoint) {
    return exports.debugTerminateInstance(endpoint);
  };
  
  
  exports.debugCanUseFailAt = function() {
    const request = require('@arangodb/request');
    const instanceInfo = JSON.parse(exports.env.INSTANCEINFO);
    let res = request.get({
      url: endpointToURL(instanceInfo.arangods[0].endpoint) + '/_admin/debug/failat',
      body: ""
    });
    if (res.status !== 200) {
      return false;
    }
    return res.body === "true";
  };
  
  // //////////////////////////////////////////////////////////////////////////////
  // / @brief are we talking to a single server or cluster?
  // //////////////////////////////////////////////////////////////////////////////

  exports.isCluster = function () {
    const arangosh = require('@arangodb/arangosh');
    let requestResult = exports.arango.GET("/_admin/server/role");
    arangosh.checkRequestResult(requestResult);
    return requestResult.role === "COORDINATOR";
  };

  exports.clusterHealth = function () {
    const arangosh = require('@arangodb/arangosh');
    let requestResult = exports.arango.GET('/_admin/cluster/health');
    arangosh.checkRequestResult(requestResult);
    return requestResult.Health;
  };
  
  // //////////////////////////////////////////////////////////////////////////////
  // / @brief processStatistics
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_PROCESS_STATISTICS) {
    exports.thisProcessStatistics = global.SYS_PROCESS_STATISTICS;
    delete global.SYS_PROCESS_STATISTICS;
  }

  exports.processStatistics = function () {
    const arangosh = require('@arangodb/arangosh');
    let requestResult = exports.arango.GET('/_admin/statistics');
    arangosh.checkRequestResult(requestResult);
    return requestResult.system;
  };
  
  // / @brief serverStatistics
  exports.serverStatistics = function () {
    const arangosh = require('@arangodb/arangosh');
    let requestResult = exports.arango.GET('/_admin/statistics');
    arangosh.checkRequestResult(requestResult);
    return requestResult.server;
  };

  // / @brief ttlStatistics
  exports.ttlStatistics = function () {
    const arangosh = require('@arangodb/arangosh');
    let requestResult = exports.arango.GET('/_api/ttl/statistics');
    arangosh.checkRequestResult(requestResult);
    return requestResult.result;
  };

  // / @brief ttlProperties
  exports.ttlProperties = function (properties) {
    const arangosh = require('@arangodb/arangosh');
    let requestResult;
    if (properties === undefined) {
      requestResult = exports.arango.GET('/_api/ttl/properties');
    } else {
      requestResult = exports.arango.PUT('/_api/ttl/properties', properties);
    }
    arangosh.checkRequestResult(requestResult);
    return requestResult.result;
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief reloads the AQL user functions (does nothing in 3.7)
  // //////////////////////////////////////////////////////////////////////////////

  exports.reloadAqlFunctions = function () {};

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief rebuilds the routing cache
  // //////////////////////////////////////////////////////////////////////////////

  exports.reloadRouting = function () {
    const arangosh = require('@arangodb/arangosh');
    let requestResult = exports.arango.POST('/_admin/routing/reload', null);
    arangosh.checkRequestResult(requestResult);
    return requestResult;
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief logs a request in curl format
  // //////////////////////////////////////////////////////////////////////////////

  exports.appendCurlRequest = function (shellAppender, jsonAppender, rawAppender) {
    return function (method, url, body, headers) {
      var response;
      var curl;
      var jsonBody = false;

      if ((typeof body !== 'string') && (body !== undefined)) {
        jsonBody = true;
        body = exports.inspect(body);
      }
      if (headers === undefined || headers === null || headers === '') {
        headers = {};
      }
      if (!headers.hasOwnProperty('Accept') && !headers.hasOwnProperty('accept')) {
        headers['accept'] = 'application/json';
      }

      curl = 'shell> curl ';

      if (method === 'POST') {
        response = exports.arango.POST_RAW(url, body, headers);
        curl += '-X ' + method + ' ';
      } else if (method === 'PUT') {
        response = exports.arango.PUT_RAW(url, body, headers);
        curl += '-X ' + method + ' ';
      } else if (method === 'GET') {
        response = exports.arango.GET_RAW(url, headers);
      } else if (method === 'DELETE') {
        response = exports.arango.DELETE_RAW(url, body, headers);
        curl += '-X ' + method + ' ';
      } else if (method === 'PATCH') {
        response = exports.arango.PATCH_RAW(url, body, headers);
        curl += '-X ' + method + ' ';
      } else if (method === 'HEAD') {
        response = exports.arango.HEAD_RAW(url, headers);
        curl += '-X ' + method + ' ';
      } else if (method === 'OPTION' || method === 'OPTIONS') {
        response = exports.arango.OPTION_RAW(url, body, headers);
        curl += '-X ' + method + ' ';
      }
      if (headers !== undefined && headers !== '') {
        for (let i in headers) {
          if (headers.hasOwnProperty(i)) {
            curl += "--header '" + i + ': ' + headers[i] + "' ";
          }
        }
      }

      if (body !== undefined && body !== '') {
        curl += '--data-binary @- ';
      }

      curl += '--dump - http://localhost:8529' + url;

      shellAppender(curl);

      if (body !== undefined && body !== '' && body) {
        rawAppender(' &lt;&lt;EOF\n');
        if (jsonBody) {
          jsonAppender(body);
        } else {
          rawAppender(body);
        }
        rawAppender('\nEOF');
      }
      rawAppender('\n\n');
      return response;
    };
  };

  let appendHeaders = function(appender, headers) {
    var key;
    // generate header
    const protocol = exports.arango.protocol();
    if (protocol === 'http') {
      if (headers.hasOwnProperty('http/1.1')) {
        appender(`HTTP/1.1 ${headers['http/1.1']}\n`);
      } else {
        throw `Header field 'http/1.1' is missing.`;
      }
    } else {
      throw `ArangoConnection::protocol() is '${protocol}', expected 'http'.`;
    }

    for (key in headers) {
      if (headers.hasOwnProperty(key)) {
        if (key !== 'http/1.1') {
          // Could filter out some common header fields here
          //key !== 'server' && key !== 'connection' && key !== 'content-length'
          appender(`${key}: ${headers[key]}\n`);
        }
      }
    }
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief logs a raw response
  // //////////////////////////////////////////////////////////////////////////////

  exports.appendRawResponse = function (appender, syntaxAppender) {
    return function (response) {
      appendHeaders(appender, response.headers);
      appender('\n');

      // append body
      if (response.body !== undefined) {
        syntaxAppender(exports.inspect(response.body));
        appender('\n');
      }
    };
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief logs a raw response - don't string escape etc.
  // //////////////////////////////////////////////////////////////////////////////

  exports.appendPlainResponse = function (appender, syntaxAppender) {
    return function (response) {
      appendHeaders(appender, response.headers);
      appender('\n');

      // append body
      if (response.body !== undefined) {
        if (Buffer.isBuffer(response.body)) {
          response.body = response.body.toString();
        }
        let splitted = response.body.split(/\r\n|\r|\n/);
        if (splitted.length > 0) {
          splitted.forEach(function (line) {
            syntaxAppender(line);
            appender('\n');
          });
        } else {
            syntaxAppender(response.body);
          appender('\n');
        }
      }
    };
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief logs a response in JSON
  // //////////////////////////////////////////////////////////////////////////////

  exports.appendJsonResponse = function (appender, syntaxAppender) {
    return function (response) {
      var syntaxAppend = exports.appendRawResponse(syntaxAppender, syntaxAppender);

      // copy original body (this is necessary because 'response' is passed by reference)
      var copy = response.body;
      // overwrite body with parsed JSON && append
      try {
        response.body = JSON.parse(response.body);
      }
      catch (e) {
        throw ` ${e}: ${JSON.stringify(response)}`;
      }
      syntaxAppend(response);
      // restore original body
      response.body = copy;
    };
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief logs a response in JSON
  // //////////////////////////////////////////////////////////////////////////////

  exports.appendJsonLResponse = function (appender, syntaxAppender) {
    return function (response) {
      var syntaxAppend = exports.appendRawResponse(syntaxAppender, syntaxAppender);

      appendHeaders(appender, response.headers);
      appender('\n');

      if (Buffer.isBuffer(response.body)) {
        response.body = response.body.toString();
      }

      var splitted = response.body.split("\n");
      splitted.forEach(function(line) {
        try {
          if (line.length > 0) {
            syntaxAppender(exports.inspect(JSON.parse(line)));
          }
        }
        catch (e) {
          throw ` ${e}: (${line})\n${JSON.stringify(response)}`;
        }
      }
                      );
    };
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief returns if we are an Enterprise Edition or not
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_IS_A_TTY) {
    exports.isATTy = global.SYS_IS_A_TTY;
    delete global.SYS_IS_A_TTY;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief returns if we are an Enterprise Edition or not
  // //////////////////////////////////////////////////////////////////////////////

  if (global.SYS_IS_ENTERPRISE) {
    exports.isEnterprise = global.SYS_IS_ENTERPRISE;
    delete global.SYS_IS_ENTERPRISE;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief log function
  // //////////////////////////////////////////////////////////////////////////////

  exports.log = function (level, msg) {
    exports.output(level, ': ', msg, '\n');
  };

  // //////////////////////////////////////////////////////////////////////////////
  // / @brief sprintf wrapper
  // //////////////////////////////////////////////////////////////////////////////

  try {
    if (typeof window !== 'undefined') {
      exports.sprintf = function (format) {
        var n = arguments.length;
        if (n === 0) {
          return '';
        }
        if (n <= 1) {
          return String(format);
        }

        var i;
        var args = [];
        for (i = 1; i < arguments.length; ++i) {
          args.push(arguments[i]);
        }
        i = 0;

        return format.replace(/%[dfs]/, function () {
          return String(args[i++]);
        });
      };
    }
  } catch (e) {
    // noop
  }
}());
