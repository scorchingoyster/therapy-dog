require "json"
require "docopt"

def find_block(blocks, key)
  blocks.each do |block|
    
    if block["key"] == key
      return block
    elsif block["type"] == "section"
      b = find_block(block["children"], key)
      if b
        return b
      end
    end
  end
  
  nil
end

def key_comment(form, key)
  block = find_block(form["children"], key)
  
  if block
    line = " # "
    line << block["label"]
    line << " "
    line << "("
    line << block["type"]
    if block["required"]
      line << ", required"
    end
    line << ")"
    
    line
  else
    ""
  end
end

def stringify_properties(properties)
  output = ""
  
  properties.each do |name, value|
    output << " "
    output << name
    output << "="
    
    case value["type"]
    when "lookup"
      output << value["path"].join(".")
    when "string"
      output << "\"#{value["value"].gsub("\"", "\\\"")}\""
    end
  end
  
  output
end

def dump_structure_node(form, node, depth)
  line = "  " * depth
  
  if node["name"].start_with?("@")
    line << node["name"]
    
    if node["properties"]
      line << stringify_properties(node["properties"])
    end
  else
    line << "<"
    line << node["name"]
    
    if node["properties"]
      line << stringify_properties(node["properties"])
    end
    
    line << ">"
  end
  
  if node["compact"]
    line << " (compact)"
  end
  
  puts line
  
  if node["children"]
    node["children"].each do |child|
      dump_node(form, child, depth + 1)
    end
  end
end

def dump_each_node(form, node, depth)
  line = "  " * depth
  
  line << "for each #{node["locals"]["item"]} in #{node["items"]["path"].join(".")}:"
  line << key_comment(form, node["items"]["path"].last)
  
  puts line
  
  node["body"].each do |body_node|
    dump_node(form, body_node, depth + 1)
  end
end

def dump_string_node(form, node, depth)
  line = "  " * depth
  line << "\"#{node["value"].gsub("\"", "\\\"")}\""
  
  puts line
end

def dump_lookup_node(form, node, depth)
  line = "  " * depth
  line << node["path"].join(".")
  line << key_comment(form, node["path"].last)
  
  puts line
end

def dump_node(form, node, depth=0)
  case node["type"]
  when "structure"
    dump_structure_node(form, node, depth)
  when "each"
    dump_each_node(form, node, depth)
  when "string"
    dump_string_node(form, node, depth)
  when "lookup"
    dump_lookup_node(form, node, depth)
  end
end

def dump_metadata(form, metadata)
  puts "#{metadata["id"]} (#{metadata["type"]})"
  dump_node(form, metadata["template"])
  puts
end

def dump_form(form)
  form["metadata"].each do |metadata|
    dump_metadata(form, metadata)
  end
end


doc = <<DOCOPT
Usage:
  #{__FILE__} <form-json>
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

form = JSON.parse(File.read(options["<form-json>"]))
dump_form(form)
