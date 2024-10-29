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
  safety_settings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
  generation_config: {max_output_tokens: 8192},
});

async function loadWeb(url: string) {
  const response = await webLoad(url)
  
  console.log('response: ', response);
  const prompt = `読み込んだWebページの内容を日本語で要約してください。${response}`;
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
