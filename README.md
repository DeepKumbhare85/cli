# flyonui-cli

Adds FlyonUI MCP configuration to AI IDEs (Cursor, Windsurf, Cline, etc.)

## Usage

```bash
npx -y flyonui-cli install <client> --api-key <key>
```

Use FlyonUI PRO License key as your API key at [flyonui.com](https://flyonui.com/)

Supported IDEs: cursor, windsurf, cline, claude, witsy, enconvo

## Manual Installation

Add to your IDE's MCP config:

```json
{
  "mcpServers": {
    "flyonui-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "flyonui-mcp",
        "API_KEY=\"your-api-key\""
      ]
    }
  }
}
```
