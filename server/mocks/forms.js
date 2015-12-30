var FORMS = {
  "sample": {
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
      },

      {
        "id": "files",
        "type": "section",
        "title": "Supplemental Files",
        "repeat": true,
        "children": [
          {
            "id": "supplemental",
            "type": "file"
          },
          {
            "id": "description",
            "type": "text",
            "label": "Description"
          }
        ]
      }
    ],
  
    "templates": [
      // <mods xmlns="http://www.loc.gov/mods/v3"> (compact)
      //   each authors as |author|
      //     <name type="personal">
      //       author.first -> <namePart type="given">
      //       author.last -> <namePart type="family">
      //       <role>
      //         <roleTerm type="text" authority="marcrelator">
      //           "Creator"
      //   info.title -> <titleInfo> <title>
      //   info.version -> <originInfo> <edition>
      //   <relatedItem type="host">
      //     <titleInfo>
      //       info.publication -> <title>
      //       info.issue -> <partName>
      //   <accessCondition> (keep)
      //     "Open Access, etc."
      {
        "block": [
          {
            "type": "element",
            "name": "mods",
            "compact": true,
            "attributes": {
              "xmlns": "http://www.loc.gov/mods/v3"
            },
            "children": [
              {
                "type": "each",
                "source": {
                  "type": "path",
                  "parts": ["authors"]
                },
                "variable": "author",
                "children": [
                  {
                    "type": "element",
                    "name": "name",
                    "attributes": {
                      "type": "personal"
                    },
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
              },
            
              {
                "type": "element",
                "name": "accessCondition",
                "keep": true,
                "children": [
                  {
                    "type": "literal",
                    "value": "Open Access, etc."
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
        "block": [
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
      },
    
      // <mods xmlns="http://www.loc.gov/mods/v3"> (compact)
      //   description -> <abstract>
      {
        "file": "supplemental",
        "block": [
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
                  "parts": ["description"]
                },
                "target": [
                  {
                    "type": "element",
                    "name": "abstract"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var formsRouter = express.Router();
  
  formsRouter.get('/', function(req, res) {
    var data = [];
    var id;
    
    for (id in FORMS) {
      if (FORMS.hasOwnProperty(id)) {
        data.push({
          'type': 'form',
          'id': id,
          'attributes': FORMS[id]
        });
      }
    }
    
    res.send({
      'data': data
    });
  });

  formsRouter.get('/:id', function(req, res) {
    var attributes = FORMS[req.params.id];
    
    if (attributes) {
      res.send({
        'data': {
          'type': 'form',
          'id': req.params.id,
          'attributes': attributes
        }
      });
    } else {
      res.status(404).end();
    }
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/forms', require('body-parser').json());
  app.use('/api/forms', formsRouter);
};
