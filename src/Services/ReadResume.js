import { CohereClientV2 } from 'cohere-ai';
const cohare_key = "Ua8EJSzFAZ04K5ySfLMn0T1doLDCTF2chbJOFl9T"


const cohere = new CohereClientV2({
  token: cohare_key,
});

(async () => {
  const response = await cohere.chat({
    model: 'command-a-03-2025',
    messages: [
      {
        role: 'user',
        content: 'What is the capital of France?',
      },
    ],
  });

  console.log(response.message.content[0].text);
})();

// import {createWorker} from 'tesseract.js'

// (async () => {
//   const worker = await createWorker('eng');
//   const { data: { text } } = await worker.recognize('D:/Interview/src/Services/RUPAM_MANNA_JUSPAY.pdf');
//   console.log(text);
//   await worker.terminate();
// })();