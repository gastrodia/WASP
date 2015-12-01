(function(){
    function getHashQuery() {
         var result:any = {};
         var querystr = window.location.hash.substring(2);
         if (querystr) {
             var queryList = querystr.split('&');
             for (var i in queryList) {
                 var itemstr = queryList[i];
                 var itemList = itemstr.split('=');
                 result[itemList[0]] = itemList[1];
             }
         }
         return result;
     }
     function setHashQuery(query) {
         var hashQueryStr = '?';
         for (var i in query) {
             hashQueryStr += i + '=' + query[i] + '&';
         }
         hashQueryStr = hashQueryStr.substring(0, hashQueryStr.length - 1);
         window.location.hash = hashQueryStr;
     }
     var query = getHashQuery();
     function getRightAuthData() {
         query = getHashQuery();
         if (!query.username && !query.password) {
             var udata = window.prompt("username,password", "");
             query.username = udata.split(',')[0];
             query.password = udata.split(',')[1];
             if (query.username.length < 6 || query.password.length < 6) {
                 alert('用户名，密码长度必须大于6');
                 getRightAuthData();
             }
             else {
                 setHashQuery(query);
             }
         }
     }
     getRightAuthData();

})();
