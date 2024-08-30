const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '.');
const outputFilePath = path.join(__dirname, 'README.md');
const baseUrl = 'https://divyansh06.github.io/'; // Base URL for GitHub Pages

function getAllMarkdownFiles(dirPath, arrayOfFiles, folderDepth = 0) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    let containsMarkdown = false;
    const subdirFiles = [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const nestedFiles = getAllMarkdownFiles(fullPath, [], folderDepth + 1);
            if (nestedFiles.length > 0) {
                subdirFiles.push({ name: file, path: fullPath, depth: folderDepth, isDir: true });
                subdirFiles.push(...nestedFiles);
                containsMarkdown = true;
            }
        } else if (path.extname(file) === '.md' && file !== 'README.md') {
            subdirFiles.push({ name: file, path: fullPath, depth: folderDepth, isDir: false });
            containsMarkdown = true;
        }
    });

    if (containsMarkdown) {
        arrayOfFiles.push(...subdirFiles);
    }

    return arrayOfFiles;
}

function generateReadmeContent(files) {
    let previousDepth = 0;
    const fileLinks = files.map(file => {
        let output = '';

        if (file.depth > previousDepth) {
            output += '\n';
        }

        const indent = '\t'.repeat(file.depth);
        if (file.isDir) {
            output += `${indent}**${file.name}**\n`;
        } else {
            const relativePath = path.relative(directoryPath, file.path).replace(/\\/g, '/');
            let fileUrl = `${baseUrl}${relativePath}`;
            fileUrl = new URL(fileUrl).toString().replace('.md', '.html');
            output += `${indent}- [${file.name}](${fileUrl})\n`;
        }

        previousDepth = file.depth;
        return output;
    }).join('');

    return `# Documentation Index\n\nThis repository contains the following Markdown files and directories:\n\n${fileLinks}\n## How to Use This Repository\n\nEach file contains documentation or notes related to specific parts of the project. Click on the links above to navigate to the respective files.\n\n## Contribution Guidelines\n\nFeel free to contribute to the documentation by adding or updating the Markdown files. Make sure to follow the repository's contribution guidelines.\n\n---\n\n*Generated on: ${new Date().toLocaleDateString()}*`;
}

function generateReadme() {
    const markdownFiles = getAllMarkdownFiles(directoryPath);
    const readmeContent = generateReadmeContent(markdownFiles);

    fs.writeFileSync(outputFilePath, readmeContent, 'utf8');
    console.log('README.md file has been generated.');
}

generateReadme();
