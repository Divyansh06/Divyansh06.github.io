const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '.');
const outputFilePath = path.join(__dirname, 'README.md');
const baseUrl = 'https://divyansh-sharma-mindtickle.github.io/'; // Base URL for GitHub Pages

function getAllMarkdownFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllMarkdownFiles(dirPath + '/' + file, arrayOfFiles);
        } else if (path.extname(file) === '.md' && file !== 'README.md') {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles;
}

function generateReadmeContent(files) {
    const fileLinks = files.map(file => {
        const relativePath = path.relative(directoryPath, file).replace(/\\/g, '/');
        let fileUrl = `${baseUrl}${relativePath}`;
        fileUrl = new URL(fileUrl).toString().replace('.md', '.html');
        return `- [${relativePath}](${fileUrl})`;
    }).join('\n');

    return `# Documentation Index\n\nThis repository contains the following Markdown files:\n\n## List of Files\n\n${fileLinks}\n\n## How to Use This Repository\n\nEach file contains documentation or notes related to specific parts of the project. Click on the links above to navigate to the respective files.\n\n## Contribution Guidelines\n\nFeel free to contribute to the documentation by adding or updating the Markdown files. Make sure to follow the repository's contribution guidelines.\n\n---\n\n*Generated on: ${new Date().toLocaleDateString()}*`;
}

function generateReadme() {
    const markdownFiles = getAllMarkdownFiles(directoryPath);
    const readmeContent = generateReadmeContent(markdownFiles);

    fs.writeFileSync(outputFilePath, readmeContent, 'utf8');
    console.log('README.md file has been generated.');
}

generateReadme();
