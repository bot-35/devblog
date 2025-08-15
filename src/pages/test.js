
/*const calculOccurences = array =>
  array.reduce((occurences, v) => {
    occurences[v] = (occurences[v] ?? 0) + 1;
    return occurences;
  }, {});*/






















function calcul (array) {

  return array.reduce((occurences, v ) => 
    {
      occurences[v] = (occurences[v] ?? 0) + 1;
      console.log(occurences)
      return occurences;
    }, {})

}




let array = ['1', '9', '8', '8'];

console.log(calcul(array))


//console.log(calculOccurences(array)); // {1: 1, 8: 2, 9: 1}



