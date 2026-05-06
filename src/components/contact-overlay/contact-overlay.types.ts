export interface OverlayProps {
  progress: number;
}

export interface TerminalLine {
  text: string;
  delay: number;
  link?: string;
  id: string;
}
