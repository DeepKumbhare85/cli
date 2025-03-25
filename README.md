# @21st-dev/cli

Adds MagicMCP configuration to AI IDEs (Cursor, Windsurf, Cline, etc.)

## Usage

```bash
npx @21st-dev/cli install <client> --api-key <key>
```

You can obtain your API key at [21st.dev Magic Console](https://21st.dev/magic/console)

Supported IDEs: cursor, windsurf, cline, claude, witsy, enconvo

## Manual Installation

Add to your IDE's MCP config:

```json
{
  "servers": {
    "@21st-dev/magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest", "API_KEY=\"your-api-key\""]
    }
  }
}
```
