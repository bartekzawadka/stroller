/**
 * Created by barte_000 on 2017-07-08.
 */
var path = require('path');
var Manager = require(path.join(__dirname, '..', 'manager.js'));
var manager = Manager.getInstance();

var sendError = function(res, code, error){
    if(!code)
        code = 500;

    res.statusCode = code;
    res.statusMessage = error;
    return res.end();
};

let sendJsonResponse = function(res, data){
  res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(data));
};

module.exports = {
    set: function(server){

        let prefix = '/api';

        server.get(prefix+'/capture', function(req, res, next){
            try{
                let token = manager.acquisitionInit();
                return res.send({
                    token: token
                });
            }catch (e){
                return sendError(res, 403, e);
            }
        });

        server.post(prefix+'/capture/cancel', function(req, res, next){
            if(!req.body || !req.body){
                return sendError(res, 400, "Invalid cancellation data");
            }

            try{
                manager.acquisitionCancel(req.body.token, req.body.force);
                return res.send();
            }catch (e){
                return sendError(res, 500, e);
            }
        });
		
		server.post(prefix+'/image', function(req, res, next){
            if(!req.body || !req.body){
                return sendError(res, 400, "Image data was not provided");
            }

            try{
                manager.appendImageAndRotate(req.body.token, req.body.image, function(data){
                    return sendJsonResponse(res, data);
                }, function(error){
                    return sendError(res, 400, error);
                });
            }
            catch (e){
                return sendError(res, 500, e);
            }
		});

		/// OBSOLETE
        // server.get(prefix+'/image/last', function(req, res){
		 //    return res.send({image: manager.getLastImage()});
        // });

		server.get(prefix+'/image/:id', function(req, res){
		    try {
		        if(!req.params){
		            return sendError(res, 400, "Invalid request parameters");
                }

                manager.getImage(req.params.id).then(function(data){
                    return res.send(data);
                }).catch(function(e){
                    return sendError(res, 400, e);
                });
            }catch (e){
		        return sendError(res, 400, e);
            }
        });

		server.get(prefix+'/chunk/:id', function(req, res){
            try {
                if(!req.params){
                    return sendError(res, 400, "Invalid request parameters");
                }

                manager.getChunk(req.params.id).then(function(data){
                    return res.send(data);
                }).catch(function(e){
                    return sendError(res, 400, e);
                });
            }catch (e){
                return sendError(res, 400, e);
            }
        });

		server.get(prefix+'/images', function(req, res){
            manager.getImages().then(function(data){
                return res.send(data);
            }).catch(function(error){
                return sendError(res, 500, error);
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

        server.get(prefix+'/image/delete/:id', function(req, res){
            try {
                if(!req.params){
                    return sendError(res, 400, "Invalid request parameters");
                }

                manager.deleteImage(req.params.id).then(function(){
                    return res.send();
                }).catch(function(e){
                    return sendError(res, 500, e);
                });
            }catch (e){
                return sendError(e, 500, e);
            }
        })

    }
};