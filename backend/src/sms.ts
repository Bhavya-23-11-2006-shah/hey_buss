export interface SmsAdapter {
  send(payload: unknown): Promise<void>
}

export class MockSmsAdapter implements SmsAdapter {
  async send(payload: unknown): Promise<void> {
    console.log(`Hey Buss mock SMS sent: ${JSON.stringify(payload)}`)
  }
}
