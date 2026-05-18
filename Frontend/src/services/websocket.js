class WebSocketManager {
    constructor(baseURL) {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const backendHost = '127.0.0.1:8000';
        this.baseURL = baseURL || `${protocol}://${backendHost}`;
        this.connections = {};
        this.listeners = {};
        this.manualClose = {};
    }

    connect(channel, onMessage, onError, options = {}) {
        let url = `${this.baseURL}/ws/${channel}/`;
        const params = [];

        if (options.token) {
            params.push(`token=${encodeURIComponent(options.token)}`);
        }
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            });
        }
        if (params.length) {
            url = `${url}?${params.join('&')}`;
        }

        const existing = this.connections[channel];

        if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
            return existing;
        }

        const ws = new WebSocket(url);
        ws._manualClose = false;

        ws.onopen = () => {
            console.log(`Connected to ${channel}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (onMessage) onMessage(data);
                if (this.listeners[channel]) {
                    this.listeners[channel].forEach((cb) => cb(data));
                }
            } catch (err) {
                console.error(`Failed to parse websocket message for ${channel}:`, err, event.data);
            }
        };

        ws.onerror = (event) => {
            if (ws._manualClose) {
                return;
            }
            console.error(`WebSocket error on ${channel}:`, event);
            if (onError) onError(event);
        };

        ws.onclose = (event) => {
            const manual = ws._manualClose;
            delete this.connections[channel];

            if (manual) {
                console.log(`WebSocket ${channel} closed manually.`);
                return;
            }

            console.warn(`WebSocket disconnected from ${channel}. code=${event.code}, reason=${event.reason}, wasClean=${event.wasClean}`);
            setTimeout(() => this.connect(channel, onMessage, onError, options), 3000);
        };

        this.connections[channel] = ws;
        return ws;
    }

    subscribe(channel, callback) {
        if (!this.listeners[channel]) {
            this.listeners[channel] = [];
        }
        this.listeners[channel].push(callback);
    }

    disconnect(channel) {
        const ws = this.connections[channel];
        if (ws) {
            ws._manualClose = true;
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            delete this.connections[channel];
        }
    }
}

export default new WebSocketManager();
