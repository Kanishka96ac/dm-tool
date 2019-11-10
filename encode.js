var crypto = require('crypto');
var chokidar = require('chokidar');
var fs = require('fs');
var mysql = require('mysql');

var directory = 'F:/proteger_system/dmtool/kanishka/temp';  
var connection = mysql.createConnection({
  host     : '192.168.1.120',
  port     :  '3306',
  user     : 'kanishka',
  password : 'kanishka#321',
  database : 'kanishka'
});
var tier1Key=''
var tier2Key=''
var tier3Key=''
var tier4Key=''

try{
    connection.query('SELECT * from `keys`;', function (error, results) {
    if (error) throw error;
    tier1Key = results[0].key
    tier2Key = results[1].key
    tier3Key = results[2].key
    });
}catch(e){
console.log(e)
}

//track and encrypt
var watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

watcher
  .on('add', path => checkName(path))

  function checkName(name)
  {
      if(name.includes("restricted") ){
        //check the employee tier and pass suitable tier key
        dmProcess(name,tier1Key);
      }
      else if(name.includes("confidential")  ){
        //check the employee tier and pass suitable tier key
        dmProcess(name,tier2Key);
      }
      else if( name.includes("internal") ){
        //check the employee tier and pass suitable tier key
        dmProcess(name,tier3Key);
      }
      else{
        uploadPublic(name)
        console.log("Public file detected")
      }
  }

  async function dmProcess(file,tier)
  {
        await sleep(3000)
      let val = encryptFile(file,tier)
      val.then(()=>{
        try{
            fs.unlinkSync(file);
        }catch(e){
          console.log('error...');
        }
      })
      .catch(function (e) {
        console.log('error rejection...');
      });
  }

  function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
const encryptFile = (file,tier) => {
return new Promise((resolve, reject) => {
    console.log('key : '+tier);
    try{
        let input = fs.readFileSync(file);
        let cipher = crypto.createCipher('aes-256-cbc', tier);
        let encFileName = file.replace('temp', 'dir');

        let crypted = Buffer.concat([cipher.update(input),cipher.final()]);
        fs.writeFileSync(encFileName+'.dmt', crypted);

        resolve()
    }catch(e){
        reject(e);
    }
})
};

async function uploadPublic(file)
  {
    await sleep(3000)
    let val = uploadFile(file)
    val.then(()=>{
      try{
          fs.unlinkSync(file);
      }catch(e){
        console.log('error...');
      }
    })
    .catch(function (e) {
      console.log('error rejection...');
    });
  }

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        try{
            let input = fs.readFileSync(file);
            let FileName = file.replace('temp', 'dir');
            fs.writeFileSync(FileName, input);
            resolve()
        }catch(e){
            reject();
        }
    })
  };