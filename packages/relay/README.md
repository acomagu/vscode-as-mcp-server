# VSCode as MCP Relay

This is a Node.js implementation of an MCP (Mechanism, Control, Policy) relay for VSCode extensions. It's based on the Go implementation in ../mcp-relay/main.go but adds the following features:

## Features

1. **Multiple Server Support**: Scans ports from the specified port to +10 to discover and connect to multiple MCP servers.
2. **Custom Protocol Extensions**: Implements custom protocol messages for:
   - Client notifying server: "You are now the main server"
   - Server requesting to client: "I want to be the main server"
3. **Fallback Capability**: Can switch between available servers if the primary becomes unresponsive.

## Installation

```bash
cd packages/relay
npm install -g
```

## Usage

```bash
vscode-as-mcp-relay --server-url http://localhost:60100 --listen-port 6011
```

### Command Line Options

- `--server-url`: Base URL of the MCP server (default: http://localhost:60100)
- `--listen-port`: Starting port to listen for incoming JSON-RPC messages (default: 6011)
- `--disable`: Disable specific tools from being displayed (e.g., `--disable text_editor --disable list_directory`)

## Custom Protocol

The relay implements a custom protocol for communication between clients and servers:

1. **Registration**:
   ```json
   {
     "clientUrl": "http://localhost:PORT",
     "features": ["relay_protocol_v1"]
   }
   ```

2. **Set Main Server** (Client to Server):
   ```json
   {
     "jsonrpc": "2.0",
     "method": "$relay",
     "params": {
       "type": "set_main",
       "clientPort": PORT
     }
   }
   ```

3. **Request to be Main** (Server to Client):
   ```json
   {
     "jsonrpc": "2.0",
     "method": "$relay",
     "params": {
       "type": "request_main",
       "serverUrl": "http://localhost:PORT"
     }
   }
   ```

## How It Works

1. The relay scans ports to discover available MCP servers.
2. It registers with all discovered servers.
3. It establishes the first discovered server as the primary.
4. It processes stdin and relays messages to the active server.
5. If a server requests to be the main server, the relay can switch its active connection.
6. If the active server becomes unresponsive, the relay can fail over to another server.
