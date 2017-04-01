var request=require('request');
var fs= require('fs');
var async= require('async')
var cheerio =require('cheerio')

console.log('开始时间:',new Date());
console.log('抓取中...');
var urlArray=getScrollUrlArray(5,4);
getIdArray(urlArray,(idArray)=>{
  getLikeCount(idArray,(result)=>{
    result.sort((a,b)=>{
      return b.all_count-a.all_count;
    })
    writeJsonFile('./data/v-movier.json',result,()=>{
      console.log('ok');
      console.log('结束时间:',new Date());
    })
  })
})


function writeJsonFile(path,result,cb){
  fs.writeFile(path,JSON.stringify(result),function(err){
    if (err) {
      throw err;
    }else {
      cb();
    }
  })
}

function getLikeCount(idArray,likecb){
  async.map(idArray,function(id,cb){
    request.post({
        url:'http://www.vmovier.com/post/islike',
        form: {id:id}
      },
      function(err,res,data){
        data=JSON.parse(data);
        var s_data={};
        s_data.id=id;
        s_data.like=data.count;
        s_data.share=data.count_share;
        s_data.all_count=s_data.like+s_data.share;
        cb(null,s_data);
    })
  },function(err,result){
    likecb(result);
  })
}

function getIdArray(urlArray,idcb){
  async.map(urlArray,function(url,cb){
    request(url,function(err,res,body){
      body=JSON.parse(body).data;
      var $=cheerio.load(body);
      var list=$('li')
      var idArray=[];
      list.map(function(){
        idArray.push($(this).attr('data-id'));
      })
      cb(null,idArray);
    })
  },function(err,result){
    var idArray=[];
    for (var i = 0; i < result.length; i++) {
      for (var j = 0; j < result[i].length; j++) {
        idArray.push(result[i][j])
      }
    }
    idcb(idArray);
  })
}

function getScrollUrlArray(page,pagepart){
  var urlArray=[];
  for (var i = 1; i < page; i++) {
    var perUrlArray=[];
    for (var j = 1; j < pagepart; j++) {
      var baseurl='http://www.vmovier.com/post/getbycate?cate=47&page='+i+'&pagepart='+j+'&controller=backstage'
      perUrlArray.push(baseurl);
    }
    urlArray=urlArray.concat(perUrlArray)
  }
  return urlArray;
}
