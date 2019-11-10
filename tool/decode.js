var crypto = require("crypto");
var fs = require("fs");
var Busboy = require("busboy");
var path = require("path");
var http = require("http");
var mysql = require("mysql");

const decryptPAth = "F:/proteger_system/dmtool/kanishka/decrypted/";
const decryptTmp = "F:/proteger_system/dmtool/kanishka/tool/uploads/";
const connection = mysql.createConnection({
  host: "192.168.1.120",
  port: "3306",
  user: "kanishka",
  password: "kanishka#321",
  database: "kanishka"
});

//express server to decrypt file
http
  .createServer(function(req, res) {
    if (req.method === "POST") {
      var busboy = new Busboy({ headers: req.headers });

      busboy.on("file", function(
        fieldname,
        file,
        filename,
        encoding,
        mimetype
      ) {
        let log = Authenticate(filename);
        log
          .then(result => {
            if (result) {
              console.log("Authentication Success " + result);
              let decName = path.basename(filename).replace(".dmt", "");
              console.log(decryptTmp + decName);
              file.pipe(fs.createWriteStream(decryptTmp + decName));
              decryptFile(decName, result);
            } else {
              console.log("Authentication failed !!");
              // res.end("Authentication failed !!");

              res.end(
                "<iframe src='https://proteger2019.000webhostapp.com/authentication.html' width='100%'height='100%'/>"
              );

            }
          })
          .catch(function(error) {
            console.log(error);
          });
      });
      busboy.on("field", function(
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        if (fieldname === "username") {
          Emp_username = val;
        } else if (fieldname === "password") {
          Emp_password = val;
        }
      });
      busboy.on("finish", function() {
        res.writeHead(200, { Connection: "close" });
        // res.end("That's all folks!");
        res.end(
          "<iframe src='https://proteger2019.000webhostapp.com/decrypt.html' width='100%'height='100%'/>"
        );
      });
      return req.pipe(busboy);
    }
    res.writeHead(404);
    res.end();
  })
  .listen(9000, function() {
    console.log("Listening for requests");
  });

const Authenticate = name => {
  return new Promise((resolve, reject) => {
    try {
      connection.query(
        "SELECT tier FROM `users` WHERE `name` = ? and `password` = ?",
        [Emp_username, Emp_password],
        function(error, results) {
          if (error) throw error;
          if (results.length > 0) {
            if (results[0].tier === 1) {
              if (name.includes("restricted")) {
                try {
                  connection.query(
                    "SELECT `key` FROM `keys` WHERE `tier` = 1 ",
                    function(error, results) {
                      if (error) throw error;
                      if (results.length > 0) {
                        resolve(results[0].key);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                } catch (e) {
                  reject(e);
                }
              } else if (name.includes("confidential")) {
                try {
                  connection.query(
                    "SELECT `key` FROM `keys` WHERE `tier` = 2",
                    function(error, results) {
                      if (error) throw error;
                      if (results.length > 0) {
                        resolve(results[0].key);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                } catch (e) {
                  reject(e);
                }
              } else if (name.includes("internal")) {
                try {
                  connection.query(
                    "SELECT `key` FROM `keys` WHERE `tier` = 3",
                    function(error, results) {
                      if (error) throw error;
                      if (results.length > 0) {
                        resolve(results[0].key);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                } catch (e) {
                  reject(e);
                }
              } else {
                resolve(false);
              }
            } else if (results[0].tier === 2) {
              if (name.includes("confidential")) {
                try {
                  connection.query(
                    "SELECT `key` FROM `keys` WHERE `tier` = 2",
                    function(error, results) {
                      if (error) throw error;
                      if (results.length > 0) {
                        resolve(results[0].key);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                } catch (e) {
                  reject(e);
                }
              } else if (name.includes("internal")) {
                try {
                  connection.query(
                    "SELECT `key` FROM `keys` WHERE `tier` = 3",
                    function(error, results) {
                      if (error) throw error;
                      if (results.length > 0) {
                        resolve(results[0].key);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                } catch (e) {
                  reject(e);
                }
              } else {
                resolve(false);
              }
            } else if (results[0].tier === 3) {
              if (name.includes("internal")) {
                try {
                  connection.query(
                    "SELECT `key` FROM `keys` WHERE `tier` = 3",
                    function(error, results) {
                      if (error) throw error;
                      if (results.length > 0) {
                        resolve(results[0].key);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                } catch (e) {
                  reject(e);
                }
              } else {
                resolve(false);
              }
            }
          } else {
            resolve(false);
          }
        }
      );
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

async function decryptFile(name, key) {
  await sleep(3000);
  let val = decryptAndUpload(name, key);
  val
    .then(() => {
      try {
        fs.unlinkSync(decryptTmp + name);
      } catch (e) {
        console.log("error...");
      }
    })
    .catch(function(e) {
      console.log("error rejection..." + e);
    });
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const decryptAndUpload = (file, tier) => {
  return new Promise((resolve, reject) => {
    console.log("key : " + tier);
    try {
      let input = fs.readFileSync(decryptTmp + file);
      let decipher = crypto.createDecipher("aes-256-cbc", tier);
      let dec = Buffer.concat([decipher.update(input), decipher.final()]);
      fs.writeFileSync(decryptPAth + file, dec);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
