SKta.Error = function(name, message){
    this.name = name;
    this.message = message;
};

SKta.Error.InvalidArgumentError = function(message){
    return new SKta.Error("InvalidArgumentError", message);
};


SKta.Error.InvalidCallError = function(message){
    return new SKta.Error("InvalidCallError", message);
};

SKta.Error.HttpError = function(message){
    return new SKta.Error("HttpError", message);
};

SKta.Error.BindError = function(message){
    return new SKta.Error("BindError", message);
};