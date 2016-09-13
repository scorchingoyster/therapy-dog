import Ember from 'ember';

export function isAdminForm() {
  if (/adminOnly/.test(location.href)) {
    return 'in-admin-iframe';
  }
	
  return '';
}

export default Ember.Helper.helper(isAdminForm);