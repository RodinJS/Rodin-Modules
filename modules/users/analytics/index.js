var phoneList;
while (phoneList = readline()) {

    phoneList = phoneList.replace(/(\r\n|\n|\r)/gm,",");
    phoneList = phoneList.slice(0, -1);
    phoneList = phoneList.split(",");
    var firstStart = phoneList[0];
    phoneList.shift();
    //return;

     for (var l = 0; l < firstStart; l++) {
       var isConsitence = true;
       for (var i = 0; i < phoneList.length; i++){
         for (var j = 0; j < phoneList.length; j++){
             if ((phoneList[i].substring(0,3) == phoneList[j].substring(0,3)) && i != j){
                isConsitence = false;
                break;
             }
         }
         if(!isConsitence) break;
       } 
       print(isConsitence ? "YES" : "NO");  
     }
}

