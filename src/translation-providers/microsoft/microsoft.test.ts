import { describe, it, expect, vi } from 'vitest';
import { microsoftTranslate } from './microsoft.js';

describe('microsoftTranslate', () => {
    it('should translate text', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ translations: [{ text: 'Hola, mundo!' }] }]),
        } as Response);
        const result = await microsoftTranslate({
            text: 'Hello, world!',
            from: 'en',
            to: 'es',
            apiKey: '1234567890',
        });
        expect(result).toBe('Hola, mundo!');
    });

    it('should throw an error if the API key is invalid or error occurs', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: () => Promise.resolve('Unauthorized'),
        } as Response);
        const spyLogError = vi.spyOn(console, 'error');
        await expect(
            microsoftTranslate({
                text: 'Hello, world!',
                from: 'en',
                to: 'es',
                apiKey: '1234567890',
            }),
        ).rejects.toThrow('process.exit unexpectedly called with "5"');
        expect(spyLogError).toHaveBeenCalledWith(
            'Microsoft Translator API error: 401 Unauthorized Unauthorized',
        );
    });

    it('should return the text if dryRun is true', async () => {
        const result = await microsoftTranslate({
            text: 'Hello, world!',
            from: 'en',
            to: 'es',
            apiKey: '1234567890',
            dryRun: true,
        });
        expect(result).toBe('[DRY-RUN][MICROSOFT:en->es] Hello, world!');
    });

    it('should throw error if no translation is found', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(),
        } as Response);
        const spyLogError = vi.spyOn(console, 'error');
        await expect(
            microsoftTranslate({
                text: 'Hello, world!',
                from: 'en',
                to: 'es',
                apiKey: '1234567890',
            }),
        ).rejects.toThrow('process.exit unexpectedly called with "5"');
        expect(spyLogError).toHaveBeenCalledWith(
            'Microsoft Translator API error:',
            expect.objectContaining({
                message: 'No translation found',
            }),
        );
    });

    it('should throw error if error occurs', async () => {
        vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Error'));
        const spyLogError = vi.spyOn(console, 'error');
        await expect(
            microsoftTranslate({
                text: 'Hello, world!',
                from: 'en',
                to: 'es',
                apiKey: '1234567890',
            }),
        ).rejects.toThrow('process.exit unexpectedly called with "5"');
        expect(spyLogError).toHaveBeenCalledWith(
            'Microsoft Translator API error:',
            expect.objectContaining({
                message: 'Error',
            }),
        );
    });
});
