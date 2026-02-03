import { PromptService } from '../../src/services/PromptService.js';

describe('PromptService', () => {
  const sampleCategories = [
    {
      id: 'cat1',
      label: 'UNDERSTANDING',
      status: null,
      comment: '',
      children: [
        { id: 'item1', label: 'Explain concepts', status: 'green', comment: 'Always OK', children: [] },
        { id: 'item2', label: 'Background research', status: 'green', comment: '', children: [] }
      ]
    },
    {
      id: 'cat2',
      label: 'WRITING',
      status: null,
      comment: '',
      children: [
        { id: 'item3', label: 'Brainstorming', status: 'yellow', comment: 'Ask first', children: [] },
        { id: 'item4', label: 'Writing for you', status: 'red', comment: 'Never allowed', children: [] }
      ]
    }
  ];

  describe('generatePrompt', () => {
    it('should generate a prompt with department name', () => {
      const prompt = PromptService.generatePrompt('English', sampleCategories);

      expect(prompt).toContain('English');
      expect(prompt).toContain('AI usage policies');
    });

    it('should include GREEN section with green items', () => {
      const prompt = PromptService.generatePrompt('Math', sampleCategories);

      expect(prompt).toContain('GREEN');
      expect(prompt).toContain('Explain concepts');
      expect(prompt).toContain('Background research');
    });

    it('should include YELLOW section with yellow items', () => {
      const prompt = PromptService.generatePrompt('Science', sampleCategories);

      expect(prompt).toContain('YELLOW');
      expect(prompt).toContain('Brainstorming');
    });

    it('should include RED section with red items', () => {
      const prompt = PromptService.generatePrompt('Maker', sampleCategories);

      expect(prompt).toContain('RED');
      expect(prompt).toContain('Writing for you');
    });

    it('should include comments when present', () => {
      const prompt = PromptService.generatePrompt('English', sampleCategories);

      expect(prompt).toContain('Always OK');
      expect(prompt).toContain('Ask first');
      expect(prompt).toContain('Never allowed');
    });

    it('should not include empty comments', () => {
      const prompt = PromptService.generatePrompt('English', sampleCategories);

      // "Background research" has no comment, so should appear without colon
      expect(prompt).toMatch(/Background research(?!:)/);
    });

    it('should include style directives', () => {
      const prompt = PromptService.generatePrompt('English', sampleCategories);

      expect(prompt).toContain('16:9');
      expect(prompt).toContain('minimalist');
      expect(prompt).toContain('flat');
      expect(prompt).toContain('#E94E1B');
    });

    it('should include 4K resolution target', () => {
      const prompt = PromptService.generatePrompt('English', sampleCategories);

      expect(prompt).toContain('4K');
    });

    it('should handle empty categories', () => {
      const prompt = PromptService.generatePrompt('English', []);

      expect(prompt).toContain('English');
      // Should still have structure but empty sections
    });

    it('should handle all items same status', () => {
      const allGreen = [
        {
          id: 'cat1',
          label: 'TEST',
          status: null,
          comment: '',
          children: [
            { id: 'item1', label: 'Item 1', status: 'green', comment: '', children: [] },
            { id: 'item2', label: 'Item 2', status: 'green', comment: '', children: [] }
          ]
        }
      ];

      const prompt = PromptService.generatePrompt('English', allGreen);

      expect(prompt).toContain('Item 1');
      expect(prompt).toContain('Item 2');
    });
  });

  describe('generatePreviewHtml', () => {
    it('should generate HTML structure', () => {
      const html = PromptService.generatePreviewHtml('English', sampleCategories);

      expect(html).toContain('<h2');
      expect(html).toContain('English');
    });

    it('should group items by status', () => {
      const html = PromptService.generatePreviewHtml('Math', sampleCategories);

      expect(html).toContain('Go Ahead');
      expect(html).toContain('Ask First');
      expect(html).toContain('Not Allowed');
    });

    it('should escape HTML in labels and comments', () => {
      const xssCategories = [
        {
          id: 'cat1',
          label: 'TEST',
          status: null,
          comment: '',
          children: [
            { id: 'item1', label: '<script>alert("XSS")</script>', status: 'green', comment: '', children: [] }
          ]
        }
      ];

      const html = PromptService.generatePreviewHtml('English', xssCategories);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include comments with items', () => {
      const html = PromptService.generatePreviewHtml('English', sampleCategories);

      expect(html).toContain('Always OK');
    });

    it('should handle empty categories', () => {
      const html = PromptService.generatePreviewHtml('English', []);

      expect(html).toContain('English');
    });
  });

  describe('getItemsByStatus', () => {
    it('should separate items by status', () => {
      const result = PromptService.getItemsByStatus(sampleCategories);

      expect(result.green).toHaveLength(2);
      expect(result.yellow).toHaveLength(1);
      expect(result.red).toHaveLength(1);
    });

    it('should ignore parent nodes (status null)', () => {
      const result = PromptService.getItemsByStatus(sampleCategories);

      const allItems = [...result.green, ...result.yellow, ...result.red];
      expect(allItems.every(item => item.status !== null)).toBe(true);
    });
  });
});
