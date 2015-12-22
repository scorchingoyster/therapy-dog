import Ember from 'ember';

let SAMPLE = {
  "title": "Sample Form",
  "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  
  "blocks": [
    {
      "id": "authors",
      "type": "section",
      "title": "Authors",
      "repeat": true,
      "children": [
        {
          "id": "first",
          "type": "text",
          "label": "First Name",
          "required": true
        },
        {
          "id": "last",
          "type": "text",
          "label": "Last Name",
          "required": true
        }
      ]
    },

    {
      "id": "info",
      "type": "section",
      "title": "Article Information",
      "children": [
        {
          "id": "title",
          "type": "text",
          "label": "Title",
          "required": true
        },
        {
          "id": "publication",
          "type": "text",
          "label": "Publication"
        },
        {
          "id": "issue",
          "type": "text",
          "label": "Issue"
        },
        {
          "id": "embargo",
          "type": "date",
          "label": "Embargo Until"
        }
      ]
    },
    
    {
      "id": "article",
      "type": "file",
      "label": "Article",
      "required": true
    }
  ],
  
  "templates": [
    {
      "format": "xml",
      "template": [
        {
          "type": "element",
          "name": "mods",
          "attributes": {
            "xmlns": "http://www.loc.gov/mods/v3"
          },
          "children": [
            {
              "type": "arrow",
              "source": {
                "type": "path",
                "parts": ["authors"]
              },
              "target": [
                {
                  "type": "element",
                  "name": "name",
                  "attributes": {
                    "type": "personal"
                  }
                }
              ],
              "children": [
                {
                  "type": "arrow",
                  "source": {
                    "type": "path",
                    "parts": ["author", "first"]
                  },
                  "target": [
                    {
                      "type": "element",
                      "name": "namePart",
                      "attributes": {
                        "type": "given"
                      }
                    }
                  ]
                },
                {
                  "type": "arrow",
                  "source": {
                    "type": "path",
                    "parts": ["author", "last"]
                  },
                  "target": [
                    {
                      "type": "element",
                      "name": "namePart",
                      "attributes": {
                        "type": "family"
                      }
                    }
                  ]
                },
                {
                  "type": "element",
                  "name": "role",
                  "children": [
                    {
                      "type": "element",
                      "name": "roleTerm",
                      "attributes": {
                        "type": "text",
                        "authority": "marcrelator"
                      },
                      "children": [
                        {
                          "type": "string",
                          "value": "Creator"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
          
            {
              "type": "arrow",
              "source": {
                "type": "path",
                "parts": ["info", "title"]
              },
              "target": [
                {
                  "type": "element",
                  "name": "titleInfo"
                },
                {
                  "type": "element",
                  "name": "title"
                }
              ]
            },
            
            {
              "type": "element",
              "name": "relatedItem",
              "attributes": {
                "type": "host"
              },
              "children": [
                {
                  "type": "element",
                  "name": "titleInfo",
                  "children": [
                    {
                      "type": "arrow",
                      "source": {
                        "type": "path",
                        "parts": ["info", "publication"]
                      },
                      "target": [
                        {
                          "type": "element",
                          "name": "title"
                        }
                      ]
                    },
                    {
                      "type": "arrow",
                      "source": {
                        "type": "path",
                        "parts": ["info", "issue"]
                      },
                      "target": [
                        {
                          "type": "element",
                          "name": "partName"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    
    {
      "format": "xml",
      "template": [
        {
          "type": "element",
          "name": "accessControl",
          "attributes": {
            "xmlns": "http://cdr.unc.edu/definitions/acl"
          },
          "children": [
            {
              "type": "arrow",
              "source": {
                "type": "path",
                "parts": ["embargo"]
              },
              "target": [
                {
                  "type": "attribute",
                  "name": "embargo-until"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default Ember.Route.extend({
  model() {
    return SAMPLE;
  },
  
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("entry", Ember.Object.create());
  }
});
