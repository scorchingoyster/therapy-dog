import Ember from 'ember';

export default Ember.Helper.helper(function(size) {
  let symbols = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  let power = Math.floor(Math.log10(size) / 3);
  let rounded = Math.round(size / Math.pow(1000, power));
  
  return rounded + ' ' + symbols[power] + 'B';
});
