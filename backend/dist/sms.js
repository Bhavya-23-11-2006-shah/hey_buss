"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSmsAdapter = void 0;
class MockSmsAdapter {
    async send(payload) {
        console.log(`Hey Buss mock SMS sent: ${JSON.stringify(payload)}`);
    }
}
exports.MockSmsAdapter = MockSmsAdapter;
