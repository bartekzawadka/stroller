/**
 * Created by barte_000 on 2017-07-08.
 */
var path = require('path');
var Manager = require(path.join(__dirname, '..', 'manager.js'));
var manager = Manager.getInstance();

var sendError = function(res, code, error){
    if(!code)
        code = 500;

    res.writeHead(code, {"Content-Type": "application/json"});
    return res.end(JSON.stringify({
        error: error
    }));
};

let sendJsonResponse = function(res, data){
  res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(data));
};

module.exports = {
    set: function(server){

        var prefix = '/api';

        server.get(prefix+'/capture', function(req, res, next){
            manager.capture(function(progress){
                console.log("PRGORESS: ", progress);
            }, function(imgs, err){

                if(err){
                    return sendError(res, 500, err);
                }
                console.log("COMPLETED");
                return res.send();
            });
        });

        server.get(prefix+'/status', function(req, res){
           return res.send({status: manager.getStatus()});
        });

        server.get(prefix+'/directions', function(req, res){
           return res.send(manager.getDirections());
        });

        server.post(prefix+'/config', function(req, res, next){

            if(!req.body || !req.body){
                return sendError(res, 400, "Configuration was not provided");
            }

            try {
                manager.setConfig(req.body);
                res.send();
            }
            catch (e){
                return sendError(res, 500, e);
            }
        });

        server.get(prefix+'/config', function(req, res){
             var config = manager.getConfig();
             return sendJsonResponse(res, config);
        });

        server.post(prefix+'/defaultConfig', function(req, res){
           manager.setDefaultConfig();
           return res.send();
        });

        server.get(prefix+'/cameras', function(req, res){
            var cameras = manager.getCameras();
            var data = {
                cameras: cameras
            };

            return res.send(data);
        });

    }
};