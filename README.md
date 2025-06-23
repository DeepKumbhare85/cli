# flyonui-cli-test

Adds FlyonUI MCP configuration to AI IDEs (Cursor, Windsurf, Cline, etc.)

## Usage

```bash
npx flyonui-cli-test install <client> --api-key <key>
```

You can obtain your API key at [flyonui.com Magic Console](https://flyonui.com/)

Supported IDEs: cursor, windsurf, cline, claude, witsy, enconvo

## Manual Installation

Add to your IDE's MCP config:

```json
{
  "mcpServers": {
    "flyonui-cli-test": {
      "command": "npx",
      "args": ["-y", "flyonui-mcp-test", "API_KEY=\"your-api-key\""]
    }
  }
}
```
