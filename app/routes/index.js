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
          "label": "Publication",
          "placeholder": "i.e., Name of journal"
        },
        {
          "id": "issue",
          "type": "text",
          "label": "Issue",
          "placeholder": "e.g., Volume 11, Issue 2"
        },
        {
          "id": "version",
          "type": "select",
          "label": "Version",
          "options": [
            "Preprint",
            "Postprint",
            "Publisher"
          ]
        }
      ]
    },
    
    {
      "id": "embargo",
      "type": "date",
      "label": "Embargo Until"
    },

    {
      "id": "article",
      "type": "file",
      "label": "Article",
      "required": true
    }
  ],
  
  "templates": [
    // <mods xmlns="http://www.loc.gov/mods/v3"> (compact)
    //   authors as |author| -> <name type="personal">
    //     author.first -> <namePart type="given">
    //     author.last -> <namePart type="family">
    //     <role>
    //       <roleTerm type="text" authority="marcrelator">
    //         "Creator"
    //   info.title -> <titleInfo> <title>
    //   info.version -> <originInfo> <edition>
    //   <relatedItem type="host">
    //     <titleInfo>
    //       info.publication -> <title>
    //       info.issue -> <partName>
    {
      "format": "xml",
      "template": [
        {
          "type": "element",
          "name": "mods",
          "compact": true,
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
              "variable": "author",
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
                          "type": "literal",
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
              "type": "arrow",
              "source": {
                "type": "path",
                "parts": ["info", "version"]
              },
              "target": [
                {
                  "type": "element",
                  "name": "originInfo"
                },
                {
                  "type": "element",
                  "name": "edition"
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
    
    // <accessControl xmlns="http://cdr.unc.edu/definitions/acl">
    //   embargo -> @embargo-until
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

function blankEntry(blocks) {
  var entry = Ember.Object.create();
  
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    
    if (block.type === "section") {
      if (block.repeat) {
        entry.set(block.id, [blankEntry(block.children)]);
      } else {
        entry.set(block.id, blankEntry(block.children));
      }
    }
  }
  
  return entry;
}

export default Ember.Route.extend({
  model() {
    return SAMPLE;
  },
  
  setupController(controller, model) {
    this._super(controller, model);
    
    controller.set("entry", blankEntry(model.blocks));
  }
});
