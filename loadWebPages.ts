import { HarmBlockThreshold, HarmCategory, VertexAI } from '@google-cloud/vertexai';
import { webLoad } from './webLoad';

const url = process.argv[2]

const project = 'PROJECT_ID'
const location = 'asia-northeast1'

const vertex_ai = new VertexAI({project: project, location: location});

const generativeModel = vertex_ai.getGenerativeModel({
  model: 'gemini-pro',
  // The following parameters are optional
  // They can also be passed to individual content generation requests
  safetySettings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
  generationConfig: {maxOutputTokens: 8192},
});

async function loadWeb(url: string) {
  const webPage = await webLoad(url)
  
  console.log('webPage: ', webPage);
  const prompt = `読み込んだWebページの内容を日本語で要約してください。${webPage}`;
  const request = {
    contents: [{role: 'user', parts: [{text: prompt}]}],
  };
  const resp = await generativeModel.generateContent(request);

  console.log('aggregated response: ', JSON.stringify(resp.response));

  return resp.response.candidates[0].content.parts[0].text
}

loadWeb(url).then((response) => {
  console.log('要約:', response)
}).catch((e) => {
  console.error(e)
})
