import Mitm from 'mitm';

export interface HTTPAttackOptions {
  ignoreUrlPatterns?: string[];
}

export default class HTTPAttack {
  private static configure(opts: HTTPAttackOptions): () => HTTPAttack {
    return () => {
      const attack = new HTTPAttack(opts);
      return attack;
    };
  }

  public ignoreUrlPatterns: string[];
  public stopped = false;

  constructor({ ignoreUrlPatterns = [] }: HTTPAttackOptions = {}) {
    this.ignoreUrlPatterns = ignoreUrlPatterns;
  }

  testArgs(
    param1,
    param2,
    param3,
    param4,
    param5,
    param6,
    param7,
    param8
  ): void {
    return (
      param1 + param2 + param3 + param4 + param5 + param6 + param7 + param8
    );
  }

  testStop(): void {
    this.stopped = true;
  }

  start(): void {
    const mitm = Mitm();

    mitm.on('connect', (socket, opts) => {
      // https://github.com/moll/node-mitm/issues/16
      // eslint-disable-next-line

      const requestedURL: string = opts?.host || '';

      const shouldIgnore = this.ignoreUrlPatterns.some((needle: string) =>
        requestedURL.includes(needle)
      );

      if (this.stopped || shouldIgnore) socket.bypass();
    });

    mitm.on('request', (_, res) => {
      res.statusCode = 500;
      res.end('Request failed');
    });
  }

  stop(): void {
    this.stopped = true;
  }
}
