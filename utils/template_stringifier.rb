class TemplateStringifier
  
  def initialize(options = {})
    @indent = options[:indent] || false
  end
  
  def reset!
    @output = ""
    @level = -1
  end
  
  def stringify(node)
    reset!
    visit_node(node)
    @output
  end
  
  def visit_node(node)
    self.send(:"visit_#{node[:type]}", node)
  end
  
  def visit_program(node)
    @level += 1
    node[:body].each do |child|
      if @indent
        @output << "  " * @level
      end
      visit_node(child)
      unless @indent
        @output << "; "
      else
        @output << "\n"
      end
    end
    @level -= 1
  end
  
  def visit_string(node)
    @output << "\"#{node[:value]}\""
  end
  
  def visit_boolean(node)
    @output << node[:value].to_s
  end
  
  def visit_number(node)
    @output << node[:value].to_s
  end
  
  def visit_hash(node)
    node[:pairs].each do |pair|
      @output << " "
      visit_node(pair)
    end
  end
  
  def visit_pair(node)
    @output << node[:key] << "="
    visit_node(node[:value])
  end
  
  def visit_call(node)
    @output << node[:name]
    
    if !node[:params].nil? && node[:params].any?
      node[:params].each do |param|
        @output << " "
        visit_node(param)
      end
    end
    
    if !node[:hash].nil?
      visit_node(node[:hash])
    end
    
    if !node[:locals].nil? && node[:locals].any?
      @output << " as |" << node[:locals].join(" ") << "|"
    end
    
    if !node[:body].nil?
      @output << " {"
      if @indent
        @output << "\n"
      else
        @output << " "
      end
      visit_node(node[:body])
      if @indent
        @output << "  " * @level
      end
      @output << "}"
    end
  end
  
  def visit_arrow(node)
    @output << "TODO arrow"
  end
  
  def visit_path(node)
    @output << node[:parts].map { |p| p =~ /^[a-zA-Z_][a-zA-Z\-_0-9]*$/ ? p : "`#{p}`" }.join(".")
  end
  
  def visit_partial(node)
    @output << "TODO partial"
  end
  
end

