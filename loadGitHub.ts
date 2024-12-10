import { HarmBlockThreshold, HarmCategory, VertexAI } from '@google-cloud/vertexai';
import { readSorceCodesFromGithub } from './githubLoader';

const inputGitHubPath = process.argv[2];

const url = process.argv[2]

const branch = process.argv[3] || "main"

const gitHubAccessToken = process.env.GITHUB_ACCESS_TOKEN || ""

const project = 'PROJECT_ID' // 書き換える
const location = 'asia-northeast1'

const vertex_ai = new VertexAI({project: project, location: location});

// Instantiate models
const generativeModel = vertex_ai.getGenerativeModel({
    model: 'gemini-1.5-pro', // 'gemini-pro-vision'も選択可
    // The following parameters are optional
    // They can also be passed to individual content generation requests
    safetySettings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
    generationConfig: {maxOutputTokens: 8192},
  });

async function generateDocuments(sourceCodes) {
  const prompt = `あなたはプログラムの設計、実装のスペシャリストです。 ${JSON.stringify(sourceCodes)} を読んで、以下のフォーマットで仕様書を出力してください。
    仕様書には以下を含めてください。
    ・リポジトリ名
    ・ファイル名
    ・メソッド名とその引数、戻り値、説明
    ・ファイル全体の説明
    ・importしているライブラリ名
    `
  const request = {
    contents: [{role: 'user', parts: [{text: prompt}]}],
  };
  const resp = await generativeModel.generateContent(request);

  console.log('aggregated response: ', JSON.stringify(resp.response));

  console.log('response text: ', resp.response.candidates[0].content.parts[0].text);

  return resp.response.candidates[0].content.parts[0].text
};

readSorceCodesFromGithub(inputGitHubPath, branch, gitHubAccessToken).then(sourceCodes => {
  generateDocuments(sourceCodes).then(() => {
    console.log('done')
  })
}).catch((e) => {
  console.error(e)
})
