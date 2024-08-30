const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '.');
const outputFilePath = path.join(__dirname, 'README.md');
const baseUrl = 'https://divyansh06.github.io/'; // Base URL for GitHub Pages
const SPACE = '__dir__';

function getAllMarkdownFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];
    let prevFolder = '';
    files.forEach((file) => {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllMarkdownFiles(dirPath + '/' + file, arrayOfFiles);
        } else if (path.extname(file) === '.md' && file !== 'README.md') {
            if (path.basename(dirPath) !== prevFolder) {
                prevFolder = path.basename(dirPath);
                arrayOfFiles.push(`${SPACE}/${prevFolder}`);
            }
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles;
}

function generateReadmeContent(files) {
    const fileLinks = files.map(file => {
        if (file.includes(SPACE)) {
            const dir = file.split('/')[1];
            return `\n***${dir}***\n`
        } else {
            const relativePath = path.relative(directoryPath, file).replace(/\\/g, '/');
            let fileUrl = `${baseUrl}${relativePath}`;
            fileUrl = new URL(fileUrl).toString().replace('.md', '.html');
            const fileName = relativePath.split('/').pop();
            return `- [${fileName}](${fileUrl})`;
        }
    }).join('\n');

    return `# Documentation Index\n\nThis repository contains the following Markdown files:\n\n## List of Files\n${fileLinks}\n\n---\n\n*Generated on: ${new Date().toLocaleDateString()}*`;
}

function generateReadme() {
    const markdownFiles = getAllMarkdownFiles(directoryPath);
    const readmeContent = generateReadmeContent(markdownFiles);

    fs.writeFileSync(outputFilePath, readmeContent, 'utf8');
    console.log('README.md file has been generated.');
}

generateReadme();
