import Ember from 'ember';
import { parameterValue } from 'therapy-dog/utils/get-parameter';

export function isAdminForm() {
  if (parameterValue('adminOnly') === 'true') {
    return 'in-admin-iframe';
  }
	
  return '';
}

export default Ember.Helper.helper(isAdminForm);