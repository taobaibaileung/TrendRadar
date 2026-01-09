import type { ThemeDetail } from "./api";

/**
 * Sanitizes a string to be used as a valid filename.
 * Removes characters that are not allowed in filenames on most operating systems.
 * @param title The string to sanitize.
 * @returns A sanitized string.
 */
function sanitizeFilename(title: string): string {
    // Replace slashes, backslashes, colons, etc., with a space
    // and remove any leading/trailing whitespace or dots.
    return title.replace(/[\\/:*?"<>|]/g, ' ').trim().replace(/\.$/, '');
}

/**
 * 解析 tags 字段，支持字符串和数组格式
 */
function parseTags(tags: string | string[] | undefined): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
        return JSON.parse(tags);
    } catch {
        return tags.split(',').map(t => t.trim()).filter(t => t);
    }
}

/**
 * 解析 key_points 字段，支持字符串和数组格式
 */
function parseKeyPoints(keyPoints: string | string[] | undefined): string[] {
    if (!keyPoints) return [];
    if (Array.isArray(keyPoints)) return keyPoints;
    try {
        return JSON.parse(keyPoints);
    } catch {
        return [];
    }
}


/**
 * Formats a ThemeDetail object into a Markdown string for a new note.
 * @param theme The theme object to format.
 * @returns A string containing the full content of the note in Markdown format.
 */
export function formatThemeToMarkdown(theme: ThemeDetail): { filename: string, content: string } {
    const filename = `${sanitizeFilename(theme.title)}.md`;
    const tags = parseTags(theme.tags);
    const keyPoints = parseKeyPoints(theme.key_points);

    let tagsSection = '';
    if (tags.length > 0) {
        tagsSection = tags.map(tag => `  - ${tag.toLowerCase().replace(' ', '-')}`).join('\n') + '\n';
    }

    const frontmatter = `---
tags:
  - trendradar
  - ${theme.category.toLowerCase().replace(' ', '-')}
${tagsSection}category: ${theme.category}
importance: ${theme.importance}
impact: ${theme.impact}
created: ${new Date().toISOString()}
---
`;

    let content = frontmatter;
    content += `\n# ${theme.title}\n\n`;

    content += `## AI 分析摘要\n`;
    content += `${theme.summary}\n\n`;

    if (keyPoints.length > 0) {
        content += `## 核心要点\n`;
        keyPoints.forEach(point => {
            content += `- ${point}\n`;
        });
        content += `\n`;
    }

    content += `## 信息来源 (${theme.articles.length})\n`;
    theme.articles.forEach(article => {
        content += `- [${article.title}](${article.url})\n`;
    });

    return { filename, content };
}
