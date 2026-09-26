/**
 * Represents a source file rendered inside the IDE-style contract mockup window.
 */
export interface ContractSnippet {
  /** Displayed in the window's title bar, e.g. "EscrowVault.sol" */
  fileName: string;
  /** PrismJS language grammar to highlight with, e.g. "solidity" | "typescript" */
  language: string;
  /** Raw source code, already de-indented and ready to render verbatim */
  code: string;
}
