export function cutStr(str, i){
    if(str.length > i){
        let cutStr = str.substr(str, i);
        while(cutStr[cutStr.length - 1] != ' '){
            i--
            cutStr = str.substr(str, i);
        }
    return(cutStr+'...');
    }
    else return(str);
}