import Ember from 'ember';

export default Ember.Helper.helper(function(size) {
  if (size < 1) {
    return '0 B';
  }
  
  let symbols = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  let power = Math.floor((Math.log(size) / Math.LN10) / 3);
  let rounded = Math.round(size / Math.pow(1000, power));
  
  return rounded + ' ' + symbols[power] + 'B';
});
