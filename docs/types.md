# Types

## Form

Property | Type | Notes |
-------- | ---- | ----- |
destination | string | The UUID of the folder or collection to deposit into.
title | string | The title of the form.
description | optional string | The description of the form. This is displayed under the form's title on form and sign-in pages. HTML may be used in this property.
allowDestinationOverride | optional boolean | Whether users can deposit to collection other than that specified in the form.
addAnother | optional boolean | Whether to display a link in the form success message that links back to the current form. See addAnotherText for customizing addAnother link text.
addAnotherText | optional string | Used in conjunction with addAnother. The text to display in addAnother message, "Add another {{addAnotherText}} in the current collection". Defaults to "work" if not set.
submitAsCurrentUser | optional boolean | Whether the form should deposit as the submitted user, instead of the default user specified by the application.
contact | optional `{ "name": string, "email": string }` | The name and email of the form's contact. This is displayed under the form's title and description on form and sign-in pages.
notificationRecipientEmails | optional array of [arrow string](#arrow-string-expression) or [arrow lookup](#arrow-lookup-expression) expressions | --
children | array of [form blocks](#form-block) | --
bundle | [single bundle](#single-bundle) or [aggregate bundle](#single-bundle) | --
metadata | array of [metadata](#metadata) | --

    {
      "destination": "uuid:fcad7e65-50e0-429e-8bba-99e24e686068",
      "title": "Article Form",
      "description": "This is a form for articles.",
      "contact": {
        "name": "Someone",
        "email": "someone@example.com"
      },
      "notificationRecipientEmails": [
        { "type": "string", "value": "someone@example.com" }
      ],
      "children": [...],
      "bundle": ...,
      "metadata": [...]
    }

## Metadata

Property | Type | Notes
-------- | ---- | -----
id | string | An identifier for this metadata specification. This must be unique between metadata specifications.
type | `"descriptive"` or `"access-control"` | The type of metadata this specification provides. Descriptive metadata should be encoded as MODS, and will be embedded in METS dmdSec elements. Access control metadata should be encoded using the CDR ACL schema, will be embedded in rightsMD elements.
model | `"xml"` | The Arrow model to use to render output from the template expression. Since there is only one model currently, this is always the string "xml".
template | [arrow expression](#arrow-expression) | The Arrow expression to evaluate to produce metadata for this specification.

    {
      "id": "article",
      "type": "descriptive",
      "model": "xml",
      "template": {
        "type": "structure",
        "name": "mods",
        "properties": {
          "xmlns": { "type": "string", "value": "http://www.loc.gov/mods/v3" }
        },
        "children": [...]
      }
    }

## Form block

One of the following:

1. [agreement form block](#agreement-form-block)
1. [checkboxes form block](#checkboxes-form-block)
1. [date form block](#date-form-block)
1. [email form block](#email-form-block)
1. [orcid form block](#orcid-form-block)
1. [file form block](#file-form-block)
1. [radio form block](#radio-form-block)
1. [section form block](#section-form-block)
1. [select form block](#select-form-block)
1. [text form block](#text-form-block)

### *agreement* form block

Property | Type | Notes
-------- | ---- | -----
type | `"agreement"` | --
key | string | --
name | string | --
uri | string | --
prompt | string | HTML may be used in this property.

    {
      "type": "agreement",
      "key": "deposit-agreement",
      "name": "Deposit Agreement",
      "uri": "http://example.com/deposit-agreement",
      "prompt": "You agree to the Deposit Agreement..."
    }

### *checkboxes* form block

Property | Type | Notes
-------- | ---- | -----
type | `"checkboxes"` | --
key | string | --
label | optional string | --
options | [options](#options) | --
required | optional boolean | --
defaultValue | optional array of string | --
note | optional string | --

    {
      "type": "checkboxes",
      "key": "intended-regional-relevance",
      "label": "Intended Regional Relevance",
      "options": [
        "All",
        "Africa",
        "Asia",
        "Australia",
        "Developing countries",
        "Europe",
        "Middle East",
        "North America",
        "South America"
      ],
      "required": true,
      "defaultValue": ["North America"]
    }

### *date* form block

Property | Type | Notes
-------- | ---- | -----
type | `"date"` | --
key | string | --
label | optional string | --
options | optional [options](#options) | --
precision | optional `"admin"`, `"year"`, `"month"`, or `"day"` (default `"day"`) | `"admin"` precision allows all date precisions: `"year"`, `"month"`, and `"day"`
required | optional boolean | --
note | optional string | --

    {
      "type": "date",
      "key": "published",
      "label": "Year Published",
      "precision": "year"
    }

### *email* form block

Property | Type | Notes
-------- | ---- | -----
type | `"email"` | --
key | string | --
label | optional string | --
options | optional [options](#options) | --
required | optional boolean | --
defaultValue | optional string | --
placeholder | optional string | --
note | optional string | --

    {
      "type": "email",
      "key": "advisor-email",
      "label": "Advisor's Email Address",
      "placeholder": "advisor@email.unc.edu"
    }
    
### *orcid* form block

Property | Type | Notes
-------- | ---- | -----
type | `"orcid"` | --
key | string | --
label | optional string | --
options | optional [options](#options) | --
required | optional boolean | --
defaultValue | optional string | --
placeholder | optional string | --
note | optional string | --

    {
      "type": "orcid",
      "key": "orcid-id",
      "label": "Orcid Id",
      "placeholder": "http://orcid.org/0000-0000-0000-0000"
    }

### *file* form block

Property | Type | Notes
-------- | ---- | -----
type | `"file"` | --
key | string | --
label | optional string | --
required | optional boolean | --
multiple | optional boolean | --
note | optional string | --

    {
      "type": "file",
      "key": "supplemental",
      "label": "Supplemental Files",
      "multiple": true
    }

### *radio* form block

Property | Type | Notes
-------- | ---- | -----
type | `"radio"` | --
key | string | --
label | optional string | --
options | [options](#options) | --
required | optional boolean | --
defaultValue | optional string | --
note | optional string | --

    {
      "type": "radio",
      "key": "license-type",
      "label": "Creative Commons license: Allow commercial uses?",
      "options": [
        {
          "value": "Creative Commons Attribution 4.0 International",
          "label": "Yes",
          "note": "<a href=\"http://creativecommons.org/licenses/by/4.0/\">Creative Commons Attribution 4.0 International</a>"
        },
        {
          "value": "Creative Commons Attribution-NonCommercial 4.0 International",
          "label": "No",
          "note": "<a href=\"http://creativecommons.org/licenses/by-nc/4.0/\">Creative Commons Attribution-NonCommercial 4.0 International</a>"
        }
      ]
    }

### *section* form block

Property | Type | Notes
-------- | ---- | -----
type | `"section"` | --
key | string | --
label | optional string | --
note | optional string | --
repeat | optional boolean | --
children | array of [form blocks](#form-blocks) | --

    {
      "type": "section",
      "key": "authors",
      "label": "Authors",
      "repeat": true,
      "children": [
        {
          "type": "text",
          "key": "first",
          "label": "First Name",
          "required": true
        },
        {
          "type": "text",
          "key": "last",
          "label": "Last Name",
          "required": true
        }
      ]
    }

### *select* form block

Property | Type | Notes
-------- | ---- | -----
type | `"select"` | --
key | string | --
label | optional string | --
options | [options](#options) | --
required | optional boolean | --
allowBlank | optional boolean | --
defaultValue | optional string | --
note | optional string | --

    {
      "type": "select",
      "key": "language",
      "label": "Language",
      "defaultValue": "eng",
      "required": true,
      "options": "iso639-2b"
    }

### *text* form block

Property | Type | Notes
-------- | ---- | -----
type | `"text"` | --
key | string | --
label | optional string | --
options | optional [options](#options) | --
required | optional boolean | --
defaultValue | optional string | --
placeholder | optional string | --
precision | optional `"line"` or `"paragraph"` | --
note | optional string | --

    {
      "type": "text",
      "key": "abstract",
      "label": "Abstract",
      "size": "paragraph",
      "required": true
    }

## Options

One of the following:

1. A string (a reference to a vocabulary)
2. An array of strings
3. An array of `{ "label": string, "value": string, "note": optional string }`. The `"note"` property may contain HTML.

## Bundle

One of the following:

1. [single bundle](#single-bundle)
1. [aggregate bundle](#aggregate-bundle)

### *single* bundle

Property | Type | Notes
-------- | ---- | -----
type | `"single"` | --
file | [bundle file](#bundle-file) | --

    {
      "type": "single",
      "file": {
        "metadata": ["description"],
        "upload": "article"
      }
    }

### *aggregate* bundle

Property | Type | Notes
-------- | ---- | -----
type | `"aggregate"` | --
aggregate | optional [bundle item](#bundle-item) | --
main | optional [bundle file](#bundle-file) | --
supplemental | optional array of [bundle file](#bundle-file) | --
agreements | optional array of string | --

    {
      "type": "aggregate",
      "aggregate": {
        "metadata": ["aggregate-description"]
      },
      "main": {
        "upload": "article"
      },
      "supplemental": {
        "context": "supplemental",
        "metadata": ["supplemental-description"],
        "upload": "file"
      },
      "agreements": ["deposit-agreement"]
    }

### Bundle Item

Property | Type | Notes
-------- | ---- | -----
context | optional string | --
metadata | optional array of string | --

### Bundle File

Property | Type | Notes
-------- | ---- | -----
context | optional string | --
metadata | optional array of string | --
upload | string | --

## Arrow Expression

One of the following:

1. [arrow string expression](#arrow-string-expression)
1. [arrow lookup expression](#arrow-lookup-expression)
1. [arrow structure expression](#arrow-structure-expression)
1. [arrow each expression](#arrow-each-expression)
1. [arrow choose expression](#arrow-choose-expression)
1. [arrow arrow expression](#arrow-arrow-expression)

### Arrow *string* expression

Property | Type | Notes
-------- | ---- | -----
type | `"string"` | --
value | string | --

    { "type": "string", "value": "personal" }

### Arrow *lookup* expression

Property | Type | Notes
-------- | ---- | -----
type | `"lookup"` | --
path | array of string | --

    { "type": "lookup", "path": ["author", "first"] }

### Arrow *structure* expression

Property | Type | Notes
-------- | ---- | -----
type | `"structure"` | --
keep | optional boolean | --
name | string | --
properties | optional map of [arrow string expression](#arrow-string-expression), [arrow lookup expression](#arrow-lookup-expression) | --
children | optional array of [arrow expressions](#arrow-expression) | --

    {
      "type": "structure",
      "name": "namePart",
      "properties": {
        "type": { "type": "string", "value": "family" }
      },
      "children": [
        { "type": "lookup", "path": ["author", "last"] }
      ]
    }

### Arrow *each* expression

Property | Type | Notes
-------- | ---- | -----
type | `"each"` | --
items | [arrow lookup expression](#arrow-lookup-expression) | --
locals | `{ "item": optional string, "index": optional string }` | --
body | array of [arrow expressions](#arrow-expression) | --

    {
      "type": "each",
      "items": { "type": "lookup", "path": ["authors"] },
      "locals": {
        "item": "author"
      },
      "body": [
        {
          "type": "structure",
          "name": "name",
          "properties": {
            "type": { "type": "string", "value": "personal" }
          },
          "children": [...]
        }
      ]
    }

### Arrow *choose* expression

Property | Type | Notes
-------- | ---- | -----
type | `"choose"` | --
choices | array of [choices](#choice) | --
otherwise | optional array of [arrow expressions](#arrow-expression) | --

    {
      "type": "choose",
      "choices": [
        {
          "predicates": [
            { "type": "present", "value": { "type": "lookup", "path": ["author", "middle"] } }
          ],
          "body": [
            { "type": "lookup", "path": ["author", "first"] }
            { "type": "string", "value": " " }
            { "type": "lookup", "path": ["author", "middle"] }
          ]
        }
      ],
      "otherwise": [
        { "type": "lookup", "path": ["author", "first"] }
      ]
    }

#### Choice

Property | Type | Notes
-------- | ---- | -----
predicates | array of [arrow predicates](#arrow-predicate) | --
body | array of [arrow expressions](#arrow-expression) | --

### Arrow *arrow* expression

Property | Type | Notes
-------- | ---- | -----
type | `"arrow"` | --
items | [arrow lookup expression](#arrow-lookup-expression) | --
target | array of [arrow structure expression](#arrow-structure-expression) | --

    {
      "type": "arrow",
      "items": { "type": "lookup", "path": ["language", "code"] },
      "target": [
        {
          "type": "structure",
          "name": "language"
        },
        {
          "type": "structure",
          "name": "languageTerm",
          "properties": {
            "type": { "type": "string", "value": "code" },
            "authority": { "type": "string", "value": "iso639-2b" }
          }
        }
      ]
    }

## Arrow predicate

One of the following:

1. [present predicate](#present-predicate)

## *present* predicate

Property | Type | Notes
-------- | ---- | -----
type | `"present"` | --
value | [arrow lookup expression](#arrow-lookup-expression) | --
