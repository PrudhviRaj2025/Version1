export interface LLMConfig {
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface LLMResponse {
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class LocalLLMService {
  private config: LLMConfig = {
    endpoint: 'http://localhost:11434/api/generate', // Default Ollama endpoint
    model: 'llama3.1:8b',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: `You are an AI assistant specialized in data analysis and visualization. You help users understand their data, create insights, and generate visualizations. 

Key capabilities:
- Analyze data patterns and trends
- Suggest appropriate chart types for different data
- Generate insights from data
- Help with data queries and filtering
- Explain statistical concepts in simple terms

Always provide clear, actionable responses and suggest specific visualizations when appropriate.`
  };

  private isConnected = false;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  // Update configuration
  updateConfig(newConfig: Partial<LLMConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  // Test connection to local LLM
  async testConnection(): Promise<boolean> {
    this.connectionStatus = 'connecting';
    
    try {
      const response = await fetch(`${this.config.endpoint.replace('/api/generate', '/api/tags')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const modelExists = models.some((model: any) => 
          model.name === this.config.model || 
          model.name.startsWith(this.config.model.split(':')[0])
        );
        
        if (modelExists) {
          this.isConnected = true;
          this.connectionStatus = 'connected';
          return true;
        } else {
          this.connectionStatus = 'error';
          console.warn(`Model ${this.config.model} not found. Available models:`, models.map((m: any) => m.name));
          return false;
        }
      } else {
        this.connectionStatus = 'error';
        return false;
      }
    } catch (error) {
      console.error('Failed to connect to local LLM:', error);
      this.connectionStatus = 'error';
      this.isConnected = false;
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionStatus;
  }

  // Check if connected
  isLLMConnected(): boolean {
    return this.isConnected;
  }

  // Generate response using local LLM
  async generateResponse(prompt: string, context?: string): Promise<LLMResponse> {
    if (!this.isConnected) {
      throw new Error('Local LLM is not connected. Please check your configuration and connection.');
    }

    const fullPrompt = context 
      ? `${this.config.systemPrompt}\n\nContext: ${context}\n\nUser: ${prompt}\n\nAssistant:`
      : `${this.config.systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        response: data.response || 'No response generated',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        model: this.config.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating LLM response:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate response with chat history
  async generateChatResponse(messages: ChatMessage[]): Promise<LLMResponse> {
    if (!this.isConnected) {
      throw new Error('Local LLM is not connected. Please check your configuration and connection.');
    }

    // Convert chat messages to a single prompt
    const prompt = messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return `System: ${msg.content}`;
        case 'user':
          return `User: ${msg.content}`;
        case 'assistant':
          return `Assistant: ${msg.content}`;
        default:
          return msg.content;
      }
    }).join('\n\n') + '\n\nAssistant:';

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        response: data.response || 'No response generated',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        model: this.config.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze data using local LLM
  async analyzeData(data: any[], query: string): Promise<string> {
    if (!data || data.length === 0) {
      return "No data available to analyze. Please upload some files or connect a data source.";
    }

    // Prepare data context
    const sampleData = data.slice(0, 5); // First 5 rows as sample
    const columns = Object.keys(data[0] || {});
    const dataInfo = {
      totalRows: data.length,
      columns: columns,
      sampleData: sampleData,
      dataTypes: this.inferDataTypes(data, columns)
    };

    const context = `Data Analysis Context:
- Total rows: ${dataInfo.totalRows}
- Columns: ${dataInfo.columns.join(', ')}
- Data types: ${JSON.stringify(dataInfo.dataTypes)}
- Sample data (first 5 rows): ${JSON.stringify(dataInfo.sampleData, null, 2)}`;

    const analysisPrompt = `Based on the provided data, please analyze and respond to this query: "${query}"

IMPORTANT: If the user is asking for a chart, visualization, or wants to see data visually, you MUST include a special marker in your response.

Use this format when recommending a visualization:
[VISUALIZATION:chart_type:chart_title]

Available chart types: bar, line, pie, area, scatter, dashboard

Examples:
- "I'll create a bar chart to show this data [VISUALIZATION:bar:Sales by Region]"
- "Let me generate a line chart for the trends [VISUALIZATION:line:Revenue Trends Over Time]"
- "A pie chart would be perfect here [VISUALIZATION:pie:Market Share Distribution]"
- "I'll create a comprehensive dashboard [VISUALIZATION:dashboard:Complete Data Analysis]"

Provide insights about:
1. Data patterns and trends
2. Key statistics if relevant
3. Suggested visualizations (with the marker if creating one)
4. Any notable findings

Keep the response concise and actionable.`;

    try {
      const response = await this.generateResponse(analysisPrompt, context);
      return response.response;
    } catch (error) {
      return `I encountered an error while analyzing your data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your local LLM connection.`;
    }
  }

  // Parse visualization commands from LLM response
  parseVisualizationCommand(response: string): { chartType: string; title: string } | null {
    const visualizationRegex = /\[VISUALIZATION:(\w+):([^\]]+)\]/;
    const match = response.match(visualizationRegex);
    
    if (match) {
      return {
        chartType: match[1],
        title: match[2]
      };
    }
    
    return null;
  }

  // Enhanced analysis with automatic visualization detection
  async analyzeDataWithVisualization(data: any[], query: string): Promise<{
    response: string;
    shouldCreateVisualization: boolean;
    chartType?: string;
    chartTitle?: string;
  }> {
    const response = await this.analyzeData(data, query);
    const visualizationCommand = this.parseVisualizationCommand(response);
    
    if (visualizationCommand) {
      return {
        response: response.replace(/\[VISUALIZATION:[^\]]+\]/, '').trim(),
        shouldCreateVisualization: true,
        chartType: visualizationCommand.chartType,
        chartTitle: visualizationCommand.title
      };
    }
    
    // Fallback: detect visualization intent from keywords
    const lowerResponse = response.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    const visualizationKeywords = [
      'chart', 'graph', 'plot', 'visualize', 'show', 'display', 'create',
      'bar chart', 'line chart', 'pie chart', 'scatter plot', 'dashboard'
    ];
    
    const hasVisualizationIntent = visualizationKeywords.some(keyword => 
      lowerQuery.includes(keyword) || lowerResponse.includes(keyword)
    );
    
    if (hasVisualizationIntent) {
      const suggestion = await this.suggestVisualization(data);
      return {
        response,
        shouldCreateVisualization: true,
        chartType: suggestion.chartType,
        chartTitle: `${suggestion.chartType.charAt(0).toUpperCase() + suggestion.chartType.slice(1)} Chart`
      };
    }
    
    return {
      response,
      shouldCreateVisualization: false
    };
  }
  // Suggest visualization based on data
  async suggestVisualization(data: any[]): Promise<{ chartType: string; reasoning: string }> {
    if (!data || data.length === 0) {
      return {
        chartType: 'bar',
        reasoning: 'Default bar chart selected as no data is available.'
      };
    }

    const columns = Object.keys(data[0] || {});
    const dataTypes = this.inferDataTypes(data, columns);
    
    const prompt = `Based on this data structure, suggest the best visualization type:

Data info:
- Columns: ${columns.join(', ')}
- Data types: ${JSON.stringify(dataTypes)}
- Row count: ${data.length}

Available chart types: bar, line, pie, area, scatter, dashboard

Respond with just the chart type and a brief reason (max 50 words).`;

    try {
      const response = await this.generateResponse(prompt);
      
      // Parse response to extract chart type
      const text = response.response.toLowerCase();
      let chartType = 'bar'; // default
      
      if (text.includes('line')) chartType = 'line';
      else if (text.includes('pie')) chartType = 'pie';
      else if (text.includes('area')) chartType = 'area';
      else if (text.includes('scatter')) chartType = 'scatter';
      else if (text.includes('dashboard')) chartType = 'dashboard';
      
      return {
        chartType,
        reasoning: response.response
      };
    } catch (error) {
      return {
        chartType: 'bar',
        reasoning: 'Default bar chart selected due to LLM connection error.'
      };
    }
  }

  // Get available models from local LLM
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.endpoint.replace('/api/generate', '/api/tags')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return (data.models || []).map((model: any) => model.name);
      }
      console.warn('Failed to fetch models: Server responded with status', response.status);
      return [];
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      return [];
    }
  }

  // Helper method to infer data types
  private inferDataTypes(data: any[], columns: string[]): Record<string, string> {
    const types: Record<string, string> = {};
    
    columns.forEach(column => {
      const sample = data.slice(0, 100).map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
      
      if (sample.length === 0) {
        types[column] = 'unknown';
        return;
      }

      const numericCount = sample.filter(val => !isNaN(Number(val))).length;
      const dateCount = sample.filter(val => !isNaN(Date.parse(val))).length;
      
      if (numericCount / sample.length > 0.8) {
        types[column] = 'numeric';
      } else if (dateCount / sample.length > 0.8) {
        types[column] = 'date';
      } else {
        types[column] = 'text';
      }
    });
    
    return types;
  }
}

export const localLLMService = new LocalLLMService();