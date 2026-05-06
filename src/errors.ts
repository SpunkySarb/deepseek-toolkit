export class DeepSeekError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "DeepSeekError";
  }
}

export class BraveSearchError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "BraveSearchError";
  }
}

export class ToolError extends Error {
  constructor(
    message: string,
    public toolName?: string,
  ) {
    super(message);
    this.name = "ToolError";
  }
}

export class ToolLoopError extends Error {
  constructor(
    message: string,
    public iterations: number,
  ) {
    super(message);
    this.name = "ToolLoopError";
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
