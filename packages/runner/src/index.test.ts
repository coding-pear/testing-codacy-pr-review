import Runner from './';
import CPUAttack from '@dazn/chaos-squirrel-attack-cpu';

describe('when probability is 0', () => {
  it('never runs anything', () => {
    let times = 1000;
    const start = jest.fn();
    const runners: Runner[] = [];

    while (times--) {
      runners.push(
        new Runner({
          probability: 0,
          possibleAttacks: [
            {
              probability: 1,
              createAttack: () => ({ start, stop: jest.fn() }),
            },
          ],
        })
      );
    }

    runners.map((r) => r.start());
    for (const runner of runners) {
      expect(runner.attack).toBeUndefined();
    }
    expect(start).not.toHaveBeenCalled();
  });
});

describe('when there are no possible attacks', () => {
  it('does not run any attacks', () => {
    const runner = new Runner({
      possibleAttacks: [],
    });
    runner.start();
    expect(runner.attack).toBeUndefined();
    runner.stop();
  });
});

describe('when random does not match any attacks', () => {
  it('does not run any attacks', () => {
    const createAttack = jest.fn().mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
    });

    const runner = new Runner({
      possibleAttacks: [
        {
          probability: 0.1,
          createAttack,
        },
        {
          probability: 0.89,
          createAttack,
        },
      ],
    });

    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    runner.start();

    expect(createAttack).not.toHaveBeenCalled();
    expect(runner.attack).toBeUndefined();
  });
});

describe('when the attack matches', () => {
  it('runs the attack', () => {
    jest.spyOn(CPUAttack.prototype, 'start').mockReturnValue(undefined);
    jest.spyOn(CPUAttack.prototype, 'stop').mockReturnValue(undefined);

    const runner = new Runner({
      possibleAttacks: [
        {
          probability: 1,
          createAttack: () => new CPUAttack(),
        },
      ],
    });
    runner.start();
    expect(runner.attack).toBeInstanceOf(CPUAttack);
    expect(CPUAttack.prototype.start).toHaveBeenCalledTimes(1);
    runner.stop();
    expect(CPUAttack.prototype.stop).toHaveBeenCalledTimes(1);
  });
});

describe('when using the configure interfaces', () => {
  it('returns a function which creates new Runner instances', () => {
    const createRunner = Runner.configure({
      probability: 0,
      possibleAttacks: [],
    });
    const runner1 = createRunner();
    const runner2 = createRunner();
    expect(runner1).toBeInstanceOf(Runner);
    expect(runner2).toBeInstanceOf(Runner);
    expect(runner1.probability).toBe(0);
    expect(runner2.probability).toBe(0);
    expect(runner1).not.toBe(runner2);
  });
});
