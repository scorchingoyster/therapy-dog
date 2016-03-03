import Arrow from 'arrow';
import XML from 'arrow/documents/xml';
import Bundle from './bundle';

export default function generateBundle(form, values) {
  var arrow = new Arrow(form.bundle, Bundle);
  
  form.templates.forEach(function(template) {
    arrow.registerPartial(template.id, new Arrow(template.template, XML));
  });
  
  return arrow.evaluate(values);
}
