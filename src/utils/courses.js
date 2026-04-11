// We use Vite's import.meta.glob to import all markdown files as raw text
const modulesGlob = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true });

export function getCourseModules() {
  const modules = [];

  for (const path in modulesGlob) {
    const content = modulesGlob[path];
    const filename = path.split('/').pop();
    
    // Determine type
    const isIndex = filename.toLowerCase() === 'readme.md';
    
    // Parse title from the first line (# Title)
    const firstLine = content.split('\n')[0];
    let title = filename.replace('.md', '').split('_').slice(1).join(' '); // fallback
    if (firstLine && firstLine.startsWith('# ')) {
      title = firstLine.replace('# ', '').trim();
      // Clean up bold tags or weird chars in title
      title = title
        .replace(/\*+/g, '')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
        .trim();
    } else if (filename.startsWith('module_')) {
        title = filename.replace('.md', '');
    } else {
        title = "Introduction";
    }

    // Determine order
    let order = 0;
    if (isIndex) {
      order = -1; // Index goes first
      title = "Course Introduction";
    } else {
      const match = filename.match(/^module_(\d+)/);
      if (match) {
        order = parseInt(match[1], 10);
      }
    }

    // Calculate Read Time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    modules.push({
      id: filename.replace('.md', ''),
      filename,
      title,
      content,
      order,
      isIndex,
      readTime
    });
  }

  // Sort by order
  return modules.sort((a, b) => a.order - b.order);
}
