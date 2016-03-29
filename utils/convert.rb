require 'rubygems'
require 'bundler/setup'

require "fileutils"
require "nokogiri"
require "json"
require "open-uri"

require "./template_stringifier"

PREFIXES = { "xmi" => "http://www.omg.org/XMI", "xsi" => "http://www.w3.org/2001/XMLSchema-instance" }

class Identifiers
  attr_reader :id

  def initialize
    @next_id = 1
    @ids = {}
  end

  def get(thing)
    @ids[thing]
  end

  def touch(id, thing)
    if id != nil
      @ids[thing] = id
      id
    else
      id = "_#{@next_id}"
      @next_id += 1
      @ids[thing] = id
      id
    end
  end
end

def href_name(node, type)
  if type == :mods && node["href"] =~ /^http:\/\/www.loc.gov\/mods\/v3#\/\/([^\/]+)\/(.+)$/
    $2
  elsif type == :acl && node["href"] =~ /^http:\/\/cdr.unc.edu\/definitions\/acl#\/\/([^\/]+)\/(.+)$/
    $2
  else
    nil
  end
end

def convert_attributes(element, identifiers, type)
  element.xpath("attributes").map do |attribute|
    default_value = attribute["defaultValue"]
    mapped_feature = attribute.at_xpath("mappedFeature")
    name = href_name(mapped_feature, type)
    output = attribute["Output"]
    
    if output != nil && output.start_with?("/")
      # These are always of the form "/0/@model/@elements.0/@ports.0"
      
      if output =~ /\/0\/@model\/@elements.(\d+)\/@ports.(\d+)/
        element = element.document.at_xpath("//model/elements[#{$1.to_i+1}]/ports[#{$2.to_i+1}]")
        output = identifiers.get(element)
      else
        raise "Unexpected output path: #{output}"
      end
    end
    
    if output != nil
      value = { type: "path", parts: ["section", output] }
    else
      value = { type: "string", value: default_value }
    end
    
    if name == "value"
      value
    else
      if type == :acl
        name = "acl:" + name
      end
    
      {
        type: "call",
        name: "attribute",
        params: [
          { type: "string", value: name }
        ],
        hash: { type: "hash", pairs: [] },
        locals: [],
        body: {
          type: "program",
          body: [value]
        }
      }
    end
  end
end

def convert_child_elements(mapped_element, identifiers, type)
  mapped_element.xpath("childElements").map do |child_element|
    mapped_feature = child_element.at_xpath("mappedFeature")
    name = href_name(mapped_feature, type)
    pairs = []
    
    if type == :acl
      name = "acl:" + name
    end
    
    {
      type: "call",
      name: "element",
      params: [
        { type: "string", value: name }
      ],
      hash: { type: "hash", pairs: pairs },
      locals: [],
      body: {
        type: "program",
        body: convert_child_elements(child_element, identifiers, type) + convert_attributes(child_element, identifiers, type)
      }
    }
  end
end

def convert_mapped_elements(metadata_block, identifiers, type)
  metadata_block.xpath("elements").map do |mapped_element|
    mapped_feature = mapped_element.at_xpath("mappedFeature")
    name = href_name(mapped_feature, type)
    pairs = []
    
    if name.nil?
      next
    end
    
    if type == :acl && name == "accessControl"
      name = "acl:" + name
      pairs << {
        type: "pair",
        key: "xmlns:acl",
        value: { type: "string", value: "http://cdr.unc.edu/definitions/acl" }
      }
      pairs << {
        type: "pair",
        key: "@compact",
        value: { type: "boolean", value: true }
      }
    end
    
    # Keep accessCondition boilerplate
    if type == :mods && name == "accessCondition"
      pairs << {
        type: "pair",
        key: "@keep",
        value: { type: "boolean", value: true }
      }
    end
    
    {
      type: "call",
      name: "element",
      params: [
        { type: "string", value: name }
      ],
      hash: { type: "hash", pairs: pairs },
      locals: [],
      body: {
        type: "program",
        body: convert_child_elements(mapped_element, identifiers, type) + convert_attributes(mapped_element, identifiers, type)
      }
    }
  end.compact
end

def convert_mapping(doc, identifiers, type)
  main_body = doc.xpath("//elements[@xmi:type='walk:MetadataBlock' or @xsi:type='walk:MetadataBlock']", PREFIXES).inject([]) do |list, metadata_block|
    id = identifiers.get(metadata_block)
    
    begin
      max_repeat = Integer(metadata_block["maxRepeat"])
    rescue
      max_repeat = 1
    end

    elements = convert_mapped_elements(metadata_block, identifiers, type)
    
    if elements.any?
      list << {
        type: "call",
        name: max_repeat > 1 ? "each" : "with",
        params: [
          { type: "call", name: id }
        ],
        hash: { type: "hash", pairs: [] },
        locals: ["section"],
        body: {
          type: "program",
          body: elements
        }
      }
    end
    
    list
  end
  
  if type == :mods
    {
      type: "program",
      body: [
        {
          type: "call",
          name: "element",
          params: [
            { type: "string", value: "mods" }
          ],
          hash: {
            type: "hash",
            pairs: [
              {
                type: "pair",
                key: "xmlns",
                value: {
                  type: "string",
                  value: "http://www.loc.gov/mods/v3"
                }
              },
              {
                type: "pair",
                key: "@compact",
                value: {
                  type: "boolean",
                  value: true
                }
              }
            ]
          },
          locals: [],
          body: {
            type: "program",
            body: main_body
          }
        }
      ]
    }
  else
    if main_body.size > 1
      raise "More than one item in main body of :acl mapping"
    end
    
    if main_body.size == 0
      nil
    else
      {
        type: "program",
        body: main_body
      }
    end
  end
end

def convert_form(xml, form_id)
  identifiers = Identifiers.new

  doc = Nokogiri::XML(xml)

  output = {}

  form = doc.at_xpath("//model[@xmi:type='walk:Form' or @xsi:type='walk:Form']", PREFIXES)

  if form.nil?
    raise "Couldn't find form"
  end

  output[:title] = form["title"]
  output[:description] = form["description"]
  output[:destination] = form["depositContainerId"]

  output[:children] = []

  form.xpath("elements[@xmi:type='walk:MetadataBlock' or @xsi:type='walk:MetadataBlock']", PREFIXES).each do |block|
    begin
      max_repeat = Integer(block["maxRepeat"])
    rescue
      max_repeat = 1
    end

    section = {
      type: "section",
      key: identifiers.touch(block["xmi:id"], block),
      label: block["name"],
      repeat: max_repeat > 1,
      children: []
    }

    output[:children] << section

    block.xpath("ports").each do |port|
      field = {
        key: identifiers.touch(port["xmi:id"], port),
        label: port["label"]
      }

      validations = {}

      field[:validations] = validations

      if port["required"] == "true"
        validations[:presence] = true
      end

      if port["usage"] != nil && port["usage"] != ""
        field[:placeholder] = port["usage"]
      end

      if port.xpath("validValues").any?
        field[:options] = port.xpath("validValues").map { |v| v.text }
      elsif port["vocabularyURL"] != nil && port["vocabularyURL"] != ""
        url = port["vocabularyURL"]

        if url =~ /^https:\/\/cdr.lib.unc.edu\/shared\/vocab\/.*\.txt$/
          field[:options] = File.basename(url, ".txt")
        else
          raise "Vocabulary URL outside of shared/vocab: #{url}"
        end
      end

      if port["allowFreeText"] == "false"
        field[:type] = "select"
      elsif port.xpath("validValues").any?
        field[:type] = "select"
        field[:options] = port.xpath("validValues").map { |v| v.text }
      elsif port["xmi:type"] == "walk:EmailInputField" || port["xsi:type"] == "walk:EmailInputField"
        field[:type] = "text"
      elsif port["xmi:type"] == "walk:TextInputField" || port["xsi:type"] == "walk:TextInputField"
        field[:type] = "text"
      elsif port["xmi:type"] == "walk:DateInputField" || port["xsi:type"] == "walk:DateInputField"
        field[:type] = "date"

        if port["datePrecision"] != nil && port["datePrecision"] != ""
          field[:precision] = port["datePrecision"]
        end
      end

      section[:children] << field
    end
  end
  
  mods_template = convert_mapping(doc, identifiers, :mods)
  acl_template = convert_mapping(doc, identifiers, :acl)
  
  output[:templates] = []
  
  template_stringifier = TemplateStringifier.new
  
  if mods_template
    output[:templates] << {
      id: "mods",
      type: "xml",
      template: template_stringifier.stringify(mods_template)
    }
  end
  
  if acl_template
    output[:templates] << {
      id: "acl",
      type: "xml",
      template: template_stringifier.stringify(acl_template)
    }
  end
  
  if form_id == "art-mfa"
    output[:templates] << {
      id: "work-sample",
      type: "xml",
      template: 'element "mods" xmlns="http://www.loc.gov/mods/v3" @compact=true { sample.title -> (element "titleInfo") (element "title"); element "physicalDescription" { sample.medium -> element "form" type="material"; sample.dimensions -> element "extent" }; sample.date -> (element "originInfo") (element "dateCreated" encoding="iso8601"); sample.narrative -> element "abstract" }'
    }
  end
  
  
  form.xpath("elements[@xsi:type='walk:MajorBlock']", PREFIXES).each do |block|
    field = {
      type: "select",
      key: identifiers.touch(block["xmi:id"], block),
      label: block["label"],
      optionLabelKeyPath: "name"
    }

    field[:options] = block.xpath("majorEntries").map do |entries|
      {
        name: entries["name"],
        observerGroups: entries.xpath("observerGroups").map { |g| g.text },
        emailDepositNoticeTo: entries.xpath("emailDepositNoticeTo").map { |g| g.text }
      }
    end

    output[:children] << field
  end
  
  main_file = nil
  other_files = []
  supplemental_files = nil
  
  if form.xpath("elements[@xmi:type='walk:FileBlock' or @xsi:type='walk:FileBlock']", PREFIXES).empty?
    field = {
      type: "file",
      key: "main",
      label: "File for Deposit",
      validations: {
        presence: true
      }
    }
    
    main_file = "main"

    output[:children] << field
  end

  form.xpath("elements[@xmi:type='walk:FileBlock' or @xsi:type='walk:FileBlock']", PREFIXES).each do |block|
    key = identifiers.touch(block["xmi:id"], block)
    
    field = {
      type: "file",
      key: key,
      label: block["name"]
    }
    
    if block["defaultAccess"] == "true"
      main_file = key
    else
      other_files << key
    end

    if block["required"] == "true"
      field[:validations] = {
        presence: true
      }
    end

    output[:children] << field
  end

  if form["canAddSupplementalFiles"]
    field = {
      type: "file",
      key: "supplemental",
      label: "Supplemental Files",
      multiple: true
    }
    
    supplemental_files = "supplemental"

    output[:children] << field
  end
  
  if form_id == "art-mfa"
    output[:children] << {
      type: "section",
      key: "work-samples",
      label: "Work Samples",
      repeat: true,
      children: [
        {
          type: "file",
          key: "file",
          label: "Work Sample",
          validations: {
            presence: true
          }
        },
        {
          type: "text",
          key: "title",
          label: "Title",
          validations: {
            presence: true
          }
        },
        {
          type: "text",
          key: "medium",
          label: "Medium/Materials",
          validations: {
            presence: true
          }
        },
        {
          type: "text",
          key: "dimensions",
          label: "Dimensions",
          validations: {
            presence: true
          }
        },
        {
          type: "date",
          key: "date",
          label: "Year",
          precision: "year",
          validations: {
            presence: true
          }
        },
        {
          type: "text",
          key: "narrative",
          label: "Brief narrative",
          validations: {
            presence: true
          }
        }
      ]
    }
  end
  
  
  bundle = ""
  
  bundle << "item type='Aggregate Work' {"
  bundle << "link rel='http://cdr.unc.edu/definitions/1.0/base-model.xml#defaultWebObject' href='#main'; "
  
  if mods_template
    bundle << "metadata type='descriptive' { partial 'mods' }; "
  end
  
  if acl_template
    bundle << "metadata type='access-control' { partial 'acl' }; "
  end
  
  bundle << "item type='File' fragment='main' label=#{main_file}.name { file { #{main_file} } }; "
  
  other_files.each do |key|
    bundle << "item type='File' label=#{key}.name { file { #{key} } }; "
  end
  
  if supplemental_files
    bundle << "each #{supplemental_files} as |s| { "
    bundle << "item type='File' label=s.name { file { s } }; "
    bundle << "}"
  end
  
  if form_id == "art-mfa"
    bundle << "each work-samples as |s| { "
    bundle << "item type='File' label=s.file.name { metadata type='descriptive' { partial 'work-sample' sample=s }; file { s.file } }; "
    bundle << "}"
  end
  
  bundle << "}"
  
  output[:bundle] = bundle
  
  
  output
end

def download_vocabularies(xml, vocabs_output_path)
  doc = Nokogiri::XML(xml)

  doc.xpath("//ports").each do |port|
    if port["vocabularyURL"] != nil && port["vocabularyURL"] =~ /^https:\/\/cdr.lib.unc.edu\/shared\/vocab\/.*\.txt$/
      id = File.basename(port["vocabularyURL"], ".txt")

      vocab = []

      open(port["vocabularyURL"]) do |f|
        f.each_line do |line|
          vocab << line.strip
        end
      end

      File.open(File.join(vocabs_output_path, id + ".json"), "w+") do |f|
        f << JSON.pretty_generate(vocab)
      end
    end
  end

end

require "docopt"
doc = <<DOCOPT
Usage:
  #{__FILE__} --forms-output=<forms-output-path> --vocab-output=<vocab-output-path> <form-xml>...
  #{__FILE__} -h | --help

Options:
  -h --help     Show this screen.

DOCOPT

begin
  options = Docopt::docopt(doc)
rescue Docopt::Exit => e
  puts e.message
  exit
end

forms_output_path = options["--forms-output"]
vocabs_output_path = options["--vocab-output"]
form_paths = options["<form-xml>"]

FileUtils.mkdir_p(forms_output_path)

form_paths.each do |path|
  begin
    xml = File.read(path)
    id = File.basename(path, ".form")

    download_vocabularies(xml, vocabs_output_path)

    output = convert_form(xml, id)
    json = JSON.pretty_generate(output)

    File.open(File.join(forms_output_path, id + ".json"), "w+") do |f|
      f << json
    end
  rescue StandardError => exception
    puts "#{path}: #{exception.inspect}"
    raise exception
  end
end
