import Ember from 'ember';

export function isAdminForm() {
  if (location.search.length > 0) {
    return 'in-admin-iframe';
  }
	
  return '';
}

export default Ember.Helper.helper(isAdminForm);