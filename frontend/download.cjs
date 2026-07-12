const fs = require('fs');
const https = require('https');

const data = {
  "screens": [
    { "name": "33523e4aad4d42ce84f62359c90c43bf", "title": "Asset Management", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjdhZjc5NDEwODE2YzdhZDFkMGRmNjM1EgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "c36ef2ea3a2d41a2a0aa5a94d08626cd", "title": "Login", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjVjYTEyMzYwMzgzOTg2NGVjMjQzYzkyEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "9ec1f20557f548668d9824d5e97ee7af", "title": "Notifications", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjZiMGZmMTcwNDMxMTcwYjBlMWMwNjA4EgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "2e630b26338644f2b91c0240f2063b43", "title": "Asset Allocation", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjZjYjM1ODUwMzgzOTJiNzBhMzg0NjdlEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "8a00b865789b4659b286edbe59e2b6ee", "title": "Asset Categories", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjZlY2ZkZGEwMzgzOTg2NGVjMjQzYzkyEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "5ad31ef8e0cd438d8cf05a5787dfa062", "title": "Asset Details", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjdiOWI5ZmEwMzM4NDdlMDY4MTBkZTlhEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "37688494627f4d10a97bf9813343e01c", "title": "Dashboard", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjczZWRjMmUwMzM4NGUzMmNiMzlmOWRlEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "651cf61f2c8446fba50e18840f4e322d", "title": "Resource Booking", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjcxODViNzAwNGVhYjcyNzVhMjU1YWFjEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "08adfab824f84591a48234585272de28", "title": "Employee Directory", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjc2OWQyMmUwODI5Yjc0NWQ1MjliNTdjEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "d44f8ed4033145d8ae1668739ff55196", "title": "Maintenance", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjc5N2YyMDUwNGVhYjM4OGY5MzNkMDcwEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "e680f436f291420482d98f956580db63", "title": "Department Management", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjgwMzBlZjcwMzgzOTg2NGVjMjQzYzkyEgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "117bbff9de6d48c3b9942704a678dd7f", "title": "Audit", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjc0Yzg1ZjMwMzM4NGU0NDVlMGIzYmM5EgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" },
    { "name": "26d44d7e260a4ce5b97d4b2f355188de", "title": "Reports", "url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NjYxZjc4OGQwYmUwODE2YzdhZDFkMGRmNjM1EgsSBxCx3e7NyQcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzc1NTk5MjUyMjU1MzM3NjQyNg&filename=&opi=89354086" }
  ]
};

if (!fs.existsSync('raw_html')){
    fs.mkdirSync('raw_html');
}

data.screens.forEach(screen => {
  const file = fs.createWriteStream(`raw_html/${screen.title.replace(/\s+/g, '_')}.html`);
  https.get(screen.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${screen.title}`);
    });
  });
});
