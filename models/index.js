'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var db        = {};
var sequelize ='';

var dbConfig = {
  username:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  host:process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
};

var fileConfig = path.join(__dirname + '/../config/config.json');
var fileConfigExample = path.join(__dirname + '/../config/config.example.json');

fs.open(fileConfig,'rs',function(err,fd) {
  if (err) {
    readfile(fileConfigExample);
  }else {
    var config = require(__dirname + '/../config/config.json')[env];
    readfile(fileConfig);
  } 
});

function readfile(file) {
  fs.readFile(file, 'utf-8', function(err, data) {
    if (!err) {
      verifyEnviromentConfig(data);
    }
  });
}
var constants = require(__dirname + '/../constants/constants.js');
function verifyEnviromentConfig(data) {
  var configData = JSON.parse(data);
  switch (env) {
    case constants.DEVELOPMENT:
      configData.development=dbConfig;
      break;
    case constants.PRODUCTION:
      configData.production=dbConfig;
      break;
  };
  writeConfig(fileConfig,configData);
}

function writeConfig(file,data) {
  fs.writeFile(file, JSON.stringify(data,null,'\t'), 'utf-8', function(err) {
    if (!err) {
      var config = require(__dirname + '/../config/config.json')[env];
      readConfig(config);
      console.log('Config is ready!');
    }
  });
}

function readConfig(config){
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

  fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  }).forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
};
console.log('Sequelize');
module.exports = db;
