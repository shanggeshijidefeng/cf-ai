import {handleErr, openaiParser, streamResponse} from "~/utils/helper";
import {OpenAIBody, OpenAIReq} from "~/utils/types";


// 声明一个变量来保存对话的上下文
let conversationContext = {};

// 定义事件处理程序
export default defineEventHandler(async (event) => {
    // 从事件体中读取数据
    const body: OpenAIReq = await readBody(event);
    const { model, endpoint, messages, key } = body;

    // 将对话的上下文添加到请求体中
    const openAIBody: OpenAIBody = {
        stream: true,
        model,
        messages,
        context: conversationContext, // 添加对话上下文
    };

    // 发送请求到 OpenAI API
    const res = await fetch(`https://aii.cmiuuqifei.dynv6.net/v1/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: key === undefined ? `Bearer ${process.env.OPENAI_API_KEY}` : `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(openAIBody),
    });

    // 处理响应
    if (!res.ok) {
        return handleErr(res);
    }

    // 从响应中读取新的对话上下文
    const responseBody = await res.json();
    conversationContext = responseBody.context;

    // 将响应流式传输给处理函数
    return streamResponse(res, openaiParser);
});
