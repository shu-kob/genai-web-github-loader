import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'

export async function readSorceCodesFromGithub(url: string, branch: string, gitHubAccessToken: string) {

  const loader = new GithubRepoLoader(
    url,
    {
      branch: branch,
      accessToken: gitHubAccessToken,
      recursive: true,
      processSubmodules: true,
      unknown: "warn",
      maxConcurrency: 5, // Defaults to 2
      ignorePaths: ["*.json", "*.yaml", "*.yml", "*config*", "*.md", "Dockerfile", "*ignore", ".eslintrc.js", "*.svg"] // 除外するファイルパス
    }
  );

  const docs = [];
  for await (const doc of loader.loadAsStream()) {
    docs.push(doc);
  }
  console.log('sourceCodes: ' + JSON.stringify(docs));
  return JSON.stringify(docs)
};
