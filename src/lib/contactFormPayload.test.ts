import { describe, expect, it } from 'vitest';
import { buildContactFormPayload } from './contactFormPayload';

describe('buildContactFormPayload', () => {
  it('includes required keys and omits name', () => {
    const fd = new FormData();
    fd.set('access_key', 'test-key');
    fd.set('email', '  test@example.com  ');
    fd.set('message', 'Hola');
    fd.set('name', 'Should not appear');
    fd.set('botcheck', '');

    const payload = buildContactFormPayload(fd, 'test-key');

    expect(payload).toEqual({
      access_key: 'test-key',
      email: 'test@example.com',
      message: 'Hola',
      subject: 'Contact form — byklika.com'
    });
    expect(payload).not.toHaveProperty('name');
    expect(payload).not.toHaveProperty('botcheck');
  });

  it('adds project_stage when present', () => {
    const fd = new FormData();
    fd.set('email', 'a@b.co');
    fd.set('message', '');
    fd.set('project_stage', '  Diseño instruccional  ');

    const payload = buildContactFormPayload(fd, 'key');

    expect(payload.project_stage).toBe('Diseño instruccional');
  });

  it('omits empty project_stage', () => {
    const fd = new FormData();
    fd.set('email', 'a@b.co');
    fd.set('message', 'x');
    fd.set('project_stage', '   ');

    const payload = buildContactFormPayload(fd, 'key');

    expect(payload).not.toHaveProperty('project_stage');
  });
});
