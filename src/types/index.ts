import type { editor as MonacoEditor } from "monaco-editor";

export interface Theme {
  id: string;
  label: string;
  color: string;
}

export interface Language {
  id: string;
  label: string;
  logoPath: string;
  monacoLanguage: string;
  defaultCode: string;
  pistonRuntime: LanguageRuntime;
}

export interface LanguageRuntime {
  language: string;
  version: string;
}

export interface ExecuteCodeResponse {
  compile?: {
    output: string;
  };
  run?: {
    output: string;
    stderr: string;
  };
}

export interface ExecutionResult {
  code: string;
  output: string;
  error: string | null;
}

export interface CodeEditorState {
  language: string;
  output: string;
  input: string;
  isRunning: boolean;
  error: string | null;
  theme: string;
  fontSize: number;
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  executionResult: ExecutionResult | null;

  setEditor: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
  getCode: () => string;
  getInput: () => string;
  setInput: (input: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: () => Promise<void>;
}
