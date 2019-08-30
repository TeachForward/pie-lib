import { getShuffledChoices } from '../persistence';

describe('persistence', () => {
  let choices, session, updateSession, key;

  beforeEach(() => {
    choices = [
      {
        value: 1
      },
      {
        value: 2
      }
    ];
    key = 'value';
  });

  describe('session does not exist', () => {
    it('returns undefined for empty session', async () => {
      const result = await getShuffledChoices(choices, session, updateSession, key);
      expect(result).toEqual(undefined);
    });
  });

  describe('session exists', () => {
    it('returns compact choices if session has shuffledValues', async () => {
      session = { shuffledValues: [2, 1] };
      const result = await getShuffledChoices(choices, session, updateSession, key);
      expect(result).toEqual(expect.arrayContaining(choices));
    });

    it('returns shuffled choices if updateSession is a function', async () => {
      session = {};
      updateSession = jest.fn().mockResolvedValue();
      const result = await getShuffledChoices(choices, session, updateSession, key);
      expect(result).toEqual(expect.arrayContaining(choices));
    });

    it('calls updateSession as expected if updateSession is a function', async () => {
      session = { id: '1', element: 'pie-element' };
      await getShuffledChoices(choices, session, updateSession, key);
      expect(updateSession).toHaveBeenCalledWith('1', 'pie-element', {
        shuffledValues: expect.arrayContaining([1, 2])
      });
    });
  });
});
